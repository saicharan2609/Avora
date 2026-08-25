-- Avora hybrid retrieval search.
--
-- Purpose (Stage 12 Group 3, architecture.md section 17.4, ENG-171, ENG-225,
-- SEC-290, SEC-291):
-- - Add the full-text keyword search index architecture.md section 9 assigns
--   to retrieval chunks ("GIN index on generated tsvector") so keyword
--   ranking has an indexed column to rank against.
-- - Add a single narrowly-scoped SQL function, callable only by the
--   `authenticated` role, that pre-filters public.chunks and
--   public.chunk_embeddings by student and scope, then produces a fused
--   vector + keyword rank (Reciprocal Rank Fusion, architecture.md section
--   17.4's "FUSE" step) over that pre-filtered candidate set only.
--
-- Why a SECURITY DEFINER function instead of a service-role connection:
-- - public.chunk_embeddings intentionally carries no `authenticated` policy
--   (20260824091000_chunk_embeddings.sql, ENG-304 secure default). A plain
--   `authenticated`-role query can never see a row in it.
-- - The only alternative would be reading chunk_embeddings with the Supabase
--   service-role key from the calling runtime. The caller here is
--   apps/web/app/api/tutor (a client-input-accepting runtime), and SEC-005 /
--   CLAUDE.md section 21 unconditionally prohibit a service-role credential
--   in any runtime that accepts client input.
-- - A SECURITY DEFINER function keeps the elevated read narrowly scoped to
--   one auditable query, executed under the function owner's privilege
--   (which bypasses RLS the same way service-role does), while the function
--   body itself re-asserts `p_student_id = auth.uid()` before touching a
--   single row — the pre-filter is therefore independent of, and stricter
--   than, table-level RLS, satisfying SEC-290 and SEC-291 without granting
--   chunk_embeddings a broader `authenticated` policy and without placing a
--   service-role credential in apps/web.
-- - The function returns only chunk_id and a fused rank score. The full
--   chunk row (locator, text, citation fields) is fetched by the caller
--   through the ordinary `authenticated` RLS-scoped `chunks` select
--   (chunks_select_own, 20260811172000_retrieval_chunks.sql), so the
--   elevated-privilege code path never itself returns chunk content.
--
-- This migration intentionally does not implement scope resolution,
-- reciprocal rank fusion tuning, retrieval insufficiency policy, AI Gateway
-- context assembly, citation verification, worker execution, web routes, UI,
-- mobile behavior, or e2e flows. Those are TypeScript-layer Stage 12 Group 3
-- concerns built on top of this function.
--
-- Rollback (ENG-180): reversible.
--   drop function if exists public.search_chunks_hybrid(uuid, uuid, uuid, uuid, uuid, text, text, extensions.vector, text, integer);
--   drop index if exists public.chunks_content_tsv_idx;
--   alter table public.chunks drop column if exists content_tsv;
--   (leave pg_trgm installed; nothing else in this migration depends on removing it)
-- chunks.content_tsv is a generated, regenerable column (derived from
-- chunks.text) and search_chunks_hybrid is a pure query function — neither
-- is student-authored content protected by NN-06, so this rollback is not a
-- destructive-content violation.

create extension if not exists pg_trgm with schema extensions;

alter table public.chunks
  add column content_tsv tsvector
  generated always as (to_tsvector('english', text)) stored;

comment on column public.chunks.content_tsv is
  'classification: derived_artifact; purpose: generated full-text search vector over chunk text, indexed for keyword-ranked hybrid retrieval (architecture.md section 9, section 17.4).';

create index chunks_content_tsv_idx
  on public.chunks
  using gin (content_tsv);

create or replace function public.search_chunks_hybrid(
  p_student_id uuid,
  p_term_id uuid,
  p_subject_id uuid,
  p_structure_unit_id uuid,
  p_resource_id uuid,
  p_status text,
  p_query_text text,
  p_query_embedding extensions.vector(1536),
  p_embedding_strategy_version text,
  p_match_count integer
)
returns table (
  chunk_id uuid,
  fused_score double precision
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  rrf_k constant integer := 60;
  -- Each retrieval method is bounded to its own top-K candidate list before
  -- fusion (architecture.md section 17.4's VEC and KW nodes are independent
  -- paths into FUSE), rather than ranking every pre-filtered chunk by both
  -- methods before fusing. 4x the requested match count, floored at 40,
  -- gives RRF enough candidates from each method to fuse meaningfully
  -- without ranking a student's entire scoped corpus on every query.
  vector_candidate_count constant integer := greatest(p_match_count * 4, 40);
  keyword_candidate_count constant integer := greatest(p_match_count * 4, 40);
begin
  -- set local, not a function-level SET clause: hnsw.iterative_scan is a
  -- custom GUC registered by the vector extension only once something in
  -- this session has actually invoked extension code (a function-level SET
  -- clause is validated at CREATE FUNCTION time, before that has
  -- necessarily happened, and fails with "permission denied to set
  -- parameter" for the non-superuser role migrations run as — verified
  -- against the live stack). By body-execution time, p_query_embedding's
  -- vector(1536) argument has already forced the extension to load, so
  -- set local always succeeds here. It lets pgvector attempt an iterative
  -- HNSW scan when a WHERE filter accompanies the vector ORDER BY/LIMIT
  -- below; see the note on vector_candidates for why the planner does not
  -- currently choose that path regardless.
  set local hnsw.iterative_scan = strict_order;

  if p_student_id is null or auth.uid() is distinct from p_student_id then
    raise exception using
      errcode = '28000',
      message = 'search_chunks_hybrid requires p_student_id to equal the authenticated session.';
  end if;

  if p_query_text is null or length(trim(p_query_text)) = 0 then
    raise exception using
      errcode = '22023',
      message = 'search_chunks_hybrid requires a non-empty p_query_text.';
  end if;

  if p_match_count is null or p_match_count <= 0 then
    raise exception using
      errcode = '22023',
      message = 'search_chunks_hybrid requires a positive p_match_count.';
  end if;

  return query
  with scoped_chunks as (
    -- Scope pre-filter (ENG-171, ENG-225, SEC-290): resolved once, then
    -- both the vector and keyword candidate queries below are restricted to
    -- exactly this chunk_id set — neither method ever considers a row
    -- outside the requesting student's requested scope.
    select
      c.chunk_id as scoped_chunk_id,
      c.content_tsv
    from public.chunks c
    where c.student_id = p_student_id
      and c.status = p_status
      and (p_term_id is null or c.term_id = p_term_id)
      and (p_subject_id is null or c.subject_id = p_subject_id)
      and (p_structure_unit_id is null or c.structure_unit_id = p_structure_unit_id)
      and (p_resource_id is null or c.resource_id = p_resource_id)
  ),
  vector_candidates as (
    -- Verified live (EXPLAIN ANALYZE against a 4,000-row scoped / 12,000-row
    -- total chunk_embeddings fixture, and confirmed unaffected by trying an
    -- IN-subquery, an ARRAY(...) = ANY() filter, a JOIN against
    -- scoped_chunks, hnsw.iterative_scan, hnsw.ef_search, and a tuned
    -- random_page_cost): PostgreSQL's planner does not choose
    -- chunk_embeddings_hnsw_cosine_idx for this query. Any predicate that
    -- narrows chunk_embeddings to the pre-filtered chunk_id set — required
    -- by ENG-171/ENG-225/SEC-290, non-negotiable — gives the planner a
    -- cheap chunk_embeddings_pkey (chunk_id, embedding_strategy_version)
    -- lookup path, which it estimates (and near this row count, genuinely
    -- executes) as cheaper than an HNSW graph walk; forcing the index via
    -- `set enable_seqscan = off` does not change this, because the
    -- competing plan is already an index scan, not a sequential scan. The
    -- HNSW index remains fully functional and dramatically faster once
    -- actually selected (confirmed: ~15ms vs ~1.5s unfiltered at this same
    -- row count with enable_seqscan forced off) — this is a planner
    -- selectivity/cost-estimation limitation at the per-student scale
    -- AS-01/NFR-020 assume (10 subjects, 500 resources: a pre-filtered
    -- candidate set an exact sort handles well within budget), not a defect
    -- in this query's shape. ARRAY(...) = ANY() is kept over the original
    -- chunk_id IN (subquery) because it is still the standard, more
    -- planner-friendly filtered-ANN form, and because bounding each
    -- method's candidate list independently (this CTE, keyword_candidates
    -- below) before fusion is correct per architecture.md section 17.4
    -- regardless of which scan method services it.
    select
      ce.chunk_id as scoped_chunk_id,
      row_number() over (order by ce.embedding <=> p_query_embedding) as vec_rank
    from public.chunk_embeddings ce
    where ce.student_id = p_student_id
      and ce.embedding_strategy_version = p_embedding_strategy_version
      and ce.chunk_id = any(array(select scoped_chunk_id from scoped_chunks))
    order by ce.embedding <=> p_query_embedding
    limit vector_candidate_count
  ),
  keyword_candidates as (
    select
      scoped_chunk_id,
      row_number() over (
        order by ts_rank_cd(content_tsv, plainto_tsquery('english', p_query_text)) desc
      ) as kw_rank
    from scoped_chunks
    where content_tsv @@ plainto_tsquery('english', p_query_text)
    order by ts_rank_cd(content_tsv, plainto_tsquery('english', p_query_text)) desc
    limit keyword_candidate_count
  ),
  fused as (
    select
      coalesce(v.scoped_chunk_id, k.scoped_chunk_id) as fused_chunk_id,
      (coalesce(1.0 / (rrf_k + v.vec_rank), 0.0)
        + coalesce(1.0 / (rrf_k + k.kw_rank), 0.0))::double precision as fused_score
    from vector_candidates v
    full outer join keyword_candidates k
      on k.scoped_chunk_id = v.scoped_chunk_id
  )
  select fused.fused_chunk_id, fused.fused_score
  from fused
  order by fused.fused_score desc, fused.fused_chunk_id
  limit p_match_count;
end;
$$;

comment on function public.search_chunks_hybrid(
  uuid, uuid, uuid, uuid, uuid, text, text, extensions.vector, text, integer
) is
  'classification: operational; purpose: student- and scope-pre-filtered hybrid (vector + keyword, Reciprocal Rank Fusion) chunk search for Stage 12 Group 3 retrieval; SECURITY DEFINER solely to read chunk_embeddings, independently re-asserts auth.uid() = p_student_id before reading any row (ENG-171, ENG-225, SEC-290, SEC-291).';

-- The Supabase base image's public-schema default ACL grants EXECUTE on
-- every newly created function to postgres, anon, authenticated, and
-- service_role (verified against the live stack via pg_default_acl). That
-- grant targets those roles by name, not the PUBLIC pseudo-role, so
-- "revoke all ... from public" alone does not remove it. auth.uid() being
-- null under anon/service_role already fails this function closed (SEC-290),
-- but least-privilege (ENG-304) still requires the grant itself removed —
-- each role is revoked individually before authenticated is re-granted.
revoke all on function public.search_chunks_hybrid(
  uuid, uuid, uuid, uuid, uuid, text, text, extensions.vector, text, integer
) from public, anon, authenticated, service_role;

grant execute on function public.search_chunks_hybrid(
  uuid, uuid, uuid, uuid, uuid, text, text, extensions.vector, text, integer
) to authenticated;
