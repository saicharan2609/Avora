-- Avora chunk embeddings.
--
-- Purpose:
-- - Persist dense vector embeddings for retrieval chunks, versioned by
--   embedding-model/strategy id, so re-embedding after a model upgrade is a
--   controlled backfill with a rollback path rather than a destructive
--   rewrite (architecture.md section 17.2, NN-06, NN-07, ENG-165).
-- - Provide the pgvector HNSW index architecture.md section 17.4 requires for
--   vector search, always paired with a student_id pre-filter (ENG-171,
--   SEC-290).
-- - Keep embeddings independently deletable per student, per chunk, per
--   strategy version, satisfying the deletion cascade contract (NN-06,
--   SEC-471) without depending on the separate content-addressed
--   embedding_cache table (embedding_cache.sql), which carries no student
--   attribution at all (AD-30).
--
-- Dimensionality: 1536, not the gemini-embedding-001 model's native 3072.
-- pgvector's HNSW/IVFFlat indexes only support up to 2000 dimensions for the
-- standard `vector` type; 1536 is Gemini's supported truncated output
-- dimensionality (Matryoshka representation learning) and keeps this table on
-- the standard, documented pgvector type instead of introducing halfvec, a
-- type that appears nowhere else in this repository. See
-- packages/ai/adapters/google/GeminiEmbeddingModel.ts.
--
-- This migration intentionally does not implement the content-addressed
-- embedding cache, vector search query logic, scoped retrieval, hybrid
-- search, AI Tutor orchestration, UI, or mobile behavior.
--
-- Rollback (ENG-180): reversible. `drop table public.chunk_embeddings;`
-- (leave `create extension if not exists vector` in place; other tables may
-- come to depend on it). chunk_embeddings is derived, regenerable data
-- (architecture.md section 17.1: "embeddings... are all reconstructible from
-- originals plus attempts") — it is not student-authored content protected
-- by NN-06, so a rollback that drops the table is not a destructive-content
-- violation; re-running the Stage 12 Group 2 indexing worker repopulates it
-- from the still-intact `chunks` table.

create extension if not exists vector with schema extensions;

create table public.chunk_embeddings (
  chunk_id uuid not null,
  student_id uuid not null,
  resource_id uuid not null,
  embedding_strategy_version text not null,
  embedding extensions.vector(1536) not null,
  dimensions integer not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chunk_embeddings_pkey primary key (chunk_id, embedding_strategy_version),
  constraint chunk_embeddings_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,
  constraint chunk_embeddings_chunk_fkey foreign key (student_id, chunk_id)
    references public.chunks (student_id, chunk_id)
    on delete cascade,
  constraint chunk_embeddings_resource_fkey foreign key (student_id, resource_id)
    references public.resources (student_id, resource_id)
    on delete cascade,
  constraint chunk_embeddings_dimensions_check check (dimensions = 1536),
  constraint chunk_embeddings_embedding_strategy_version_check check (
    length(trim(embedding_strategy_version)) > 0
  ),
  constraint chunk_embeddings_content_hash_check check (
    length(trim(content_hash)) > 0
  )
);

comment on table public.chunk_embeddings is
  'classification: derived_artifact; purpose: dense vector embeddings for retrieval chunks, versioned by embedding strategy for controlled re-embedding backfills.';

comment on column public.chunk_embeddings.chunk_id is
  'classification: derived_artifact; purpose: retrieval chunk this embedding was generated from.';

comment on column public.chunk_embeddings.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and mandatory vector search pre-filtering (ENG-171, SEC-290).';

comment on column public.chunk_embeddings.resource_id is
  'classification: academic_content; purpose: source resource identifier denormalized for scoped retrieval without a join back through chunks.';

comment on column public.chunk_embeddings.embedding_strategy_version is
  'classification: operational; purpose: versioned embedding provider/model/dimensionality strategy that produced this vector; part of the primary key so re-embedding never overwrites a prior version.';

comment on column public.chunk_embeddings.embedding is
  'classification: derived_artifact; purpose: dense vector representation of the chunk text used for HNSW approximate nearest neighbour search.';

comment on column public.chunk_embeddings.dimensions is
  'classification: operational; purpose: embedding vector dimensionality recorded for validation and backfill auditing.';

comment on column public.chunk_embeddings.content_hash is
  'classification: operational; purpose: content hash of the source chunk text used to correlate with the content-addressed embedding_cache table (never a foreign key, per the AD-30 no-cross-student-attribution constraint).';

comment on column public.chunk_embeddings.created_at is
  'classification: operational; purpose: row creation timestamp.';

comment on column public.chunk_embeddings.updated_at is
  'classification: operational; purpose: row update timestamp.';

create index chunk_embeddings_student_id_idx
  on public.chunk_embeddings (student_id);

create index chunk_embeddings_student_resource_idx
  on public.chunk_embeddings (student_id, resource_id);

create index chunk_embeddings_embedding_strategy_version_idx
  on public.chunk_embeddings (embedding_strategy_version);

create index chunk_embeddings_hnsw_cosine_idx
  on public.chunk_embeddings
  using hnsw (embedding extensions.vector_cosine_ops);

alter table public.chunk_embeddings enable row level security;
alter table public.chunk_embeddings force row level security;

-- No policy is created for the authenticated role (ENG-304 secure default):
-- raw embedding vectors have no direct student-facing surface in the PRD, so
-- this table is deny-by-default for every client-reachable role. The worker
-- plane writes and the (future Group 3) retrieval search service reads
-- exclusively through the service-role connection, which bypasses RLS.
