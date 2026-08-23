-- Avora resource chunking job transactional enqueue.
--
-- Purpose:
-- - Make extraction-success and chunking-job creation atomic (ENG-154, AD-27):
--   the chunking job row is created by a trigger firing in the same transaction
--   as the extraction job's terminal "succeeded" write, never by a second,
--   independent application write. This mirrors
--   app_private.enqueue_resource_extraction_job_on_ingestion_success()
--   (20260817120000_resource_extraction_jobs_transactional_enqueue.sql).
-- - Enforce replay safety at the database layer (ENG-139): a unique index on the
--   logical chunking identity (student, resource, extraction document, chunking
--   strategy version) makes duplicate-enqueue-on-replay impossible.
--
-- Source values:
-- - studentId, resourceId, extractionDocumentId, chunkingStrategyVersion are
--   forwarded unchanged from the extraction job payload that produced them.
-- - sourceContentHash is forwarded from the extraction job payload's contentHash
--   (the hash of the original resource bytes that were extracted), the only
--   content-addressing value available at this point in the pipeline; no
--   extracted-text-specific hash is persisted anywhere upstream.
-- - sanitisationStrategyVersion has no upstream source and is declared here as a
--   literal default, mirroring how the existing trigger declares
--   extraction_strategy_version and chunking_strategy_version as literal
--   defaults rather than reading them from an external source.
-- - termId, subjectId, structureUnitId are read from resource_placements if a
--   placement row exists for this resource, and left null otherwise (NN-01: a
--   resource may have no placement yet).
--
-- This migration intentionally does not implement embeddings, indexing,
-- retrieval, AI processing, a general-purpose domain-event outbox table, UI, or
-- mobile behavior. It narrowly closes the atomicity and idempotency gap for this
-- one worker flow.

create unique index resource_chunking_jobs_logical_identity_uniq
  on public.resource_chunking_jobs (
    student_id,
    resource_id,
    extraction_document_id,
    (payload ->> 'chunkingStrategyVersion')
  );

comment on index resource_chunking_jobs_logical_identity_uniq is
  'classification: operational; purpose: ENG-139 database-enforced idempotency key preventing duplicate chunking job rows for the same student, resource, extraction document, and chunking strategy version across replay of the extraction worker.';

create or replace function app_private.enqueue_resource_chunking_job_on_extraction_success()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
declare
  resolved_extraction_document_id uuid := (new.payload ->> 'extractionDocumentId')::uuid;
  resolved_student_id uuid := (new.payload ->> 'studentId')::uuid;
  resolved_resource_id uuid := (new.payload ->> 'resourceId')::uuid;
  sanitisation_strategy_version text := 'sanitiser.v1';
  requested_at text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  placement_term_id uuid;
  placement_subject_id uuid;
  placement_structure_unit_id uuid;
begin
  select
    term_id,
    subject_id,
    structure_unit_id
  into
    placement_term_id,
    placement_subject_id,
    placement_structure_unit_id
  from public.resource_placements
  where student_id = resolved_student_id
    and resource_id = resolved_resource_id;

  insert into public.resource_chunking_jobs (
    student_id,
    resource_id,
    extraction_document_id,
    job_name,
    reason,
    priority,
    payload
  )
  values (
    resolved_student_id,
    resolved_resource_id,
    resolved_extraction_document_id,
    'resource.chunking.chunk',
    'resource_extraction_succeeded',
    'normal',
    jsonb_build_object(
      'studentId', resolved_student_id::text,
      'resourceId', resolved_resource_id::text,
      'extractionDocumentId', resolved_extraction_document_id::text,
      'sourceContentHash', new.payload ->> 'contentHash',
      'chunkingStrategyVersion', new.payload ->> 'chunkingStrategyVersion',
      'sanitisationStrategyVersion', sanitisation_strategy_version,
      'termId', placement_term_id::text,
      'subjectId', placement_subject_id::text,
      'structureUnitId', placement_structure_unit_id::text,
      'requestedAt', requested_at
    )
  )
  on conflict (
    student_id,
    resource_id,
    extraction_document_id,
    (payload ->> 'chunkingStrategyVersion')
  )
  do nothing;

  return new;
end;
$$;

comment on function app_private.enqueue_resource_chunking_job_on_extraction_success() is
  'classification: operational; purpose: atomically create the durable resource chunking job in the same transaction as the extraction job terminal succeeded write (ENG-154, AD-27); idempotent via resource_chunking_jobs_logical_identity_uniq (ENG-139).';

drop trigger if exists enqueue_resource_chunking_job_after_extraction_success on public.resource_extraction_jobs;

create trigger enqueue_resource_chunking_job_after_extraction_success
  after update on public.resource_extraction_jobs
  for each row
  when (new.status = 'succeeded' and old.status is distinct from 'succeeded')
  execute function app_private.enqueue_resource_chunking_job_on_extraction_success();
