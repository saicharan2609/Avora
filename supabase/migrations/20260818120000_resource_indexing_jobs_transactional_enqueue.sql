-- Avora resource indexing job transactional enqueue.
--
-- Purpose:
-- - Make chunking-success and indexing-job creation atomic (ENG-154, AD-27):
--   the indexing job row is created by a trigger firing in the same transaction
--   as the chunking job's terminal "succeeded" write, mirroring
--   app_private.enqueue_resource_chunking_job_on_extraction_success()
--   (20260818100000_resource_chunking_jobs_transactional_enqueue.sql).
-- - Enforce replay safety at the database layer (ENG-139): a unique index on the
--   logical indexing identity (student, resource, chunking strategy version,
--   embedding strategy version) makes duplicate-enqueue-on-replay impossible.
--
-- Source values:
-- - studentId, resourceId, chunkingStrategyVersion, sourceContentHash are
--   forwarded unchanged from the chunking job payload that produced them.
-- - embeddingStrategyVersion is declared here as a literal default identifying
--   the concrete Gemini embedding adapter approved and implemented in
--   packages/ai/adapters/google/GeminiEmbeddingModel.ts
--   (geminiEmbeddingStrategyVersion = "gemini-embedding-001.3072d.v1"); this
--   mirrors how the extraction trigger declares extraction_strategy_version and
--   chunking_strategy_version as literal defaults.
--
-- This migration intentionally does not implement embedding persistence
-- (chunk_embeddings), vector search, retrieval, AI Tutor orchestration, UI, or
-- mobile behavior. It narrowly closes the atomicity and idempotency gap for
-- this one worker flow.

create unique index resource_indexing_jobs_logical_identity_uniq
  on public.resource_indexing_jobs (
    student_id,
    resource_id,
    (payload ->> 'chunkingStrategyVersion'),
    (payload ->> 'embeddingStrategyVersion')
  );

comment on index resource_indexing_jobs_logical_identity_uniq is
  'classification: operational; purpose: ENG-139 database-enforced idempotency key preventing duplicate indexing job rows for the same student, resource, chunking strategy version, and embedding strategy version across replay of the chunking worker.';

create or replace function app_private.enqueue_resource_indexing_job_on_chunking_success()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
declare
  embedding_strategy_version text := 'gemini-embedding-001.3072d.v1';
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
  'classification: operational; purpose: atomically create the durable resource indexing job in the same transaction as the chunking job terminal succeeded write (ENG-154, AD-27); idempotent via resource_indexing_jobs_logical_identity_uniq (ENG-139).';

drop trigger if exists enqueue_resource_indexing_job_after_chunking_success on public.resource_chunking_jobs;

create trigger enqueue_resource_indexing_job_after_chunking_success
  after update on public.resource_chunking_jobs
  for each row
  when (new.status = 'succeeded' and old.status is distinct from 'succeeded')
  execute function app_private.enqueue_resource_indexing_job_on_chunking_success();
