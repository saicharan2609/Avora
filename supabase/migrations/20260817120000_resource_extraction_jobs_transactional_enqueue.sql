-- Avora resource extraction job transactional enqueue.
--
-- Purpose:
-- - Make ingestion-success and extraction-job creation atomic (ENG-154, AD-27):
--   the extraction job row is created by a trigger firing in the same transaction
--   as the ingestion job's terminal "succeeded" write, never by a second,
--   independent application write. This removes the dual-write window between
--   "resource marked processing / ingestion job completed" and "extraction job
--   exists" that a crash between two separate application writes would open.
-- - Enforce replay safety at the database layer (ENG-139): a unique index on the
--   logical extraction identity (student, resource, extraction strategy version,
--   chunking strategy version) makes duplicate-enqueue-on-replay impossible,
--   mirroring the existing idempotency key already used by
--   resource_extraction_documents' own checkpoint constraint for the same
--   logical identity.
--
-- This migration intentionally does not implement chunking, embeddings, indexing,
-- retrieval, AI processing, a general-purpose domain-event outbox table, UI, or
-- mobile behavior. It narrowly closes the atomicity and idempotency gap for this
-- one worker flow, reusing the trigger pattern already established by
-- app_private.create_student_for_auth_user() (20260805191000_identity_auth_user_trigger.sql).

create unique index resource_extraction_jobs_logical_identity_uniq
  on public.resource_extraction_jobs (
    student_id,
    resource_id,
    (payload ->> 'extractionStrategyVersion'),
    (payload ->> 'chunkingStrategyVersion')
  );

comment on index resource_extraction_jobs_logical_identity_uniq is
  'classification: operational; purpose: ENG-139 database-enforced idempotency key preventing duplicate extraction job rows for the same student, resource, and strategy-version pair across replay of the ingestion validation handler.';

create or replace function app_private.enqueue_resource_extraction_job_on_ingestion_success()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
declare
  extraction_document_id uuid := gen_random_uuid();
  extraction_strategy_version text := 'extractor.v1';
  chunking_strategy_version text := 'chunker.v1';
  requested_at text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  insert into public.resource_extraction_jobs (
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
    'resource.extraction.extract',
    'resource_validation_succeeded',
    'normal',
    jsonb_build_object(
      'extractionDocumentId', extraction_document_id::text,
      'studentId', new.payload ->> 'studentId',
      'resourceId', new.payload ->> 'resourceId',
      'storage', jsonb_build_object(
        'bucket', 'resources',
        'objectPath', new.payload -> 'storage' ->> 'objectPath'
      ),
      'declaredMimeType', new.payload ->> 'declaredMimeType',
      'byteSize', (new.payload ->> 'byteSize')::bigint,
      'contentHash', new.payload ->> 'contentHash',
      'extractionStrategyVersion', extraction_strategy_version,
      'chunkingStrategyVersion', chunking_strategy_version,
      'requestedAt', requested_at
    )
  )
  on conflict (
    student_id,
    resource_id,
    (payload ->> 'extractionStrategyVersion'),
    (payload ->> 'chunkingStrategyVersion')
  )
  do nothing;

  return new;
end;
$$;

comment on function app_private.enqueue_resource_extraction_job_on_ingestion_success() is
  'classification: operational; purpose: atomically create the durable resource extraction job in the same transaction as the ingestion job terminal succeeded write (ENG-154, AD-27); idempotent via resource_extraction_jobs_logical_identity_uniq (ENG-139).';

drop trigger if exists enqueue_resource_extraction_job_after_ingestion_success on public.resource_ingestion_jobs;

create trigger enqueue_resource_extraction_job_after_ingestion_success
  after update on public.resource_ingestion_jobs
  for each row
  when (new.status = 'succeeded' and old.status is distinct from 'succeeded')
  execute function app_private.enqueue_resource_extraction_job_on_ingestion_success();
