-- Avora resource indexing job embedding strategy version update.
--
-- Purpose:
-- - Update the literal default embeddingStrategyVersion written by
--   app_private.enqueue_resource_indexing_job_on_chunking_success()
--   (20260818120000_resource_indexing_jobs_transactional_enqueue.sql) from
--   "gemini-embedding-001.3072d.v1" to "gemini-embedding-001.1536d.v1",
--   matching the Stage 12 Group 2 decision to request Gemini's truncated
--   1536-dimension output instead of the model's native 3072 dimensions, so
--   chunk_embeddings can use the standard pgvector `vector` type with a
--   standard HNSW index (pgvector's HNSW/IVFFlat indexes only support up to
--   2000 dimensions for that type). See
--   packages/ai/adapters/google/GeminiEmbeddingModel.ts.
-- - This is a pure literal-value update via CREATE OR REPLACE FUNCTION; the
--   prior migration file is left untouched (migrations are never edited
--   after being applied, ENG-178). No resource_indexing_jobs rows exist yet
--   referencing the old literal (Stage 12 Group 2 is the first group to
--   populate chunk_embeddings), so this is not a backfill.
--
-- This migration intentionally does not implement embedding persistence
-- changes, vector search, retrieval, AI Tutor orchestration, UI, or mobile
-- behavior.
--
-- Rollback (ENG-180): reversible. Re-run `create or replace function` with
-- `embedding_strategy_version text := 'gemini-embedding-001.3072d.v1';`
-- restored, matching 20260818120000_resource_indexing_jobs_transactional_
-- enqueue.sql's original body exactly. No data migration is required either
-- direction: this only changes the literal written into new job rows going
-- forward, and (as of this migration) no resource_indexing_jobs rows exist
-- yet that reference the old literal.

create or replace function app_private.enqueue_resource_indexing_job_on_chunking_success()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
declare
  embedding_strategy_version text := 'gemini-embedding-001.1536d.v1';
  requested_at text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  insert into public.resource_indexing_jobs (
    student_id,
    resource_id,
    job_name,
    reason,
    priority,
    payload
  )
  values (
    (new.payload ->> 'studentId')::uuid,
    (new.payload ->> 'resourceId')::uuid,
    'retrieval.index.resource',
    'resource_chunking_succeeded',
    'normal',
    jsonb_build_object(
      'studentId', new.payload ->> 'studentId',
      'resourceId', new.payload ->> 'resourceId',
      'embeddingStrategyVersion', embedding_strategy_version,
      'chunkingStrategyVersion', new.payload ->> 'chunkingStrategyVersion',
      'sourceContentHash', new.payload ->> 'sourceContentHash',
      'requestedAt', requested_at
    )
  )
  on conflict (
    student_id,
    resource_id,
    (payload ->> 'chunkingStrategyVersion'),
    (payload ->> 'embeddingStrategyVersion')
  )
  do nothing;

  return new;
end;
$$;

comment on function app_private.enqueue_resource_indexing_job_on_chunking_success() is
  'classification: operational; purpose: atomically create the durable resource indexing job in the same transaction as the chunking job terminal succeeded write (ENG-154, AD-27); idempotent via resource_indexing_jobs_logical_identity_uniq (ENG-139); embeddingStrategyVersion literal updated to gemini-embedding-001.1536d.v1 in Stage 12 Group 2.';
