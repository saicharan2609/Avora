-- Avora content-addressed embedding cache.
--
-- Purpose:
-- - Implement the AD-30 / ENG-238 / SEC-322 content-addressed cost control:
--   identical chunk text at the same embedding strategy version is never
--   embedded twice, so an identical resource circulating through an entire
--   class costs one embedding inference call, not N.
--
-- Binding privacy constraint (AD-30, quoted from ENGINEERING-RULES.md
-- ENG-238): "the cache stores only derived computation results keyed by
-- content hash. It never stores the file, never an association between
-- students, and no cache entry is attributable to any student. Cache hits
-- are invisible in every student-facing surface."
--
-- Accordingly this table carries no student_id, resource_id, or chunk_id
-- column, and no foreign key ever references it from a student-scoped table
-- (see chunk_embeddings.content_hash, which correlates by value only, never
-- by foreign key). Deleting a student's chunk_embeddings rows never touches
-- this table, and this table is never joined into any student-facing query.
--
-- This migration intentionally does not implement chunk_embeddings
-- persistence (chunk_embeddings.sql), vector search, retrieval, AI Tutor
-- orchestration, UI, mobile behavior, or a cache eviction/TTL policy.
--
-- Rollback (ENG-180): reversible. `drop table public.embedding_cache;`. No
-- foreign key ever references this table (by design, AD-30) and it carries
-- no student-attributable data, so dropping it is always safe: it only
-- reverts the cost-optimization, causing subsequent identical-content
-- embedding requests to call the provider again instead of hitting the
-- cache.

create table public.embedding_cache (
  content_hash text not null,
  embedding_strategy_version text not null,
  embedding extensions.vector(1536) not null,
  dimensions integer not null,
  created_at timestamptz not null default now(),
  constraint embedding_cache_pkey primary key (content_hash, embedding_strategy_version),
  constraint embedding_cache_dimensions_check check (dimensions = 1536),
  constraint embedding_cache_content_hash_check check (
    length(trim(content_hash)) > 0
  ),
  constraint embedding_cache_embedding_strategy_version_check check (
    length(trim(embedding_strategy_version)) > 0
  )
);

comment on table public.embedding_cache is
  'classification: operational; purpose: content-addressed embedding cache keyed by content hash and embedding strategy version; carries no student attribution by design (AD-30, ENG-238, SEC-322).';

comment on column public.embedding_cache.content_hash is
  'classification: operational; purpose: hash of the source text that was embedded; the sole cache lookup key alongside embedding_strategy_version.';

comment on column public.embedding_cache.embedding_strategy_version is
  'classification: operational; purpose: versioned embedding provider/model/dimensionality strategy that produced this cached vector.';

comment on column public.embedding_cache.embedding is
  'classification: operational; purpose: cached dense vector for this content hash and strategy version, reused to avoid duplicate provider inference cost.';

comment on column public.embedding_cache.dimensions is
  'classification: operational; purpose: cached embedding vector dimensionality recorded for validation.';

comment on column public.embedding_cache.created_at is
  'classification: operational; purpose: cache entry creation timestamp.';

alter table public.embedding_cache enable row level security;
alter table public.embedding_cache force row level security;

-- No policy is created for any client-reachable role (ENG-304 secure
-- default). This table is never attributable to a student and must never
-- appear in a student-facing surface (AD-30); only the worker plane's
-- service-role connection reads or writes it, bypassing RLS.
