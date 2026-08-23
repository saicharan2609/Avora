-- Avora resource extraction jobs.
--
-- Purpose:
-- - Persist durable resource extraction job requests after ingestion validation succeeds.
-- - Make extraction requests durable and claimable by the worker plane, mirroring the
--   resource_ingestion_jobs durable-queue pattern.
-- - Preserve student-scoped ownership and deny-by-default RLS.
--
-- This migration intentionally does not implement chunking, embeddings, indexing,
-- retrieval, AI processing, UI, or mobile behavior.

create table public.resource_extraction_jobs (
  job_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (student_id) on delete cascade,
  resource_id uuid not null references public.resources (resource_id) on delete cascade,
  job_name text not null,
  reason text not null,
  priority text not null,
  status text not null default 'queued',
  attempt_count integer not null default 0,
  payload jsonb not null,
  locked_at timestamptz,
  locked_by text,
  heartbeat_at timestamptz,
  available_at timestamptz not null default now(),
  enqueued_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_extraction_jobs_job_name_check check (
    job_name = 'resource.extraction.extract'
  ),
  constraint resource_extraction_jobs_reason_check check (
    reason in ('resource_validation_succeeded', 'manual_reprocess_requested')
  ),
  constraint resource_extraction_jobs_priority_check check (
    priority in ('interactive', 'normal', 'backfill')
  ),
  constraint resource_extraction_jobs_status_check check (
    status in (
      'queued',
      'claimed',
      'running',
      'succeeded',
      'failed',
      'dead_lettered',
      'cancelled'
    )
  ),
  constraint resource_extraction_jobs_attempt_count_non_negative_check check (
    attempt_count >= 0
  ),
  constraint resource_extraction_jobs_payload_object_check check (
    jsonb_typeof(payload) = 'object'
  ),
  constraint resource_extraction_jobs_payload_extraction_document_id_check check (
    payload ? 'extractionDocumentId'
    and length(payload ->> 'extractionDocumentId') > 0
  ),
  constraint resource_extraction_jobs_payload_student_id_check check (
    payload ? 'studentId'
    and payload ->> 'studentId' = student_id::text
  ),
  constraint resource_extraction_jobs_payload_resource_id_check check (
    payload ? 'resourceId'
    and payload ->> 'resourceId' = resource_id::text
  ),
  constraint resource_extraction_jobs_payload_storage_check check (
    payload ? 'storage'
    and jsonb_typeof(payload -> 'storage') = 'object'
    and payload -> 'storage' ? 'bucket'
    and payload -> 'storage' ? 'objectPath'
  ),
  constraint resource_extraction_jobs_payload_storage_bucket_check check (
    payload -> 'storage' ->> 'bucket' = 'resources'
  ),
  constraint resource_extraction_jobs_payload_storage_path_check check (
    left(
      payload -> 'storage' ->> 'objectPath',
      length(student_id::text || '/')
    ) = student_id::text || '/'
  ),
  constraint resource_extraction_jobs_payload_declared_mime_type_check check (
    payload ? 'declaredMimeType'
    and length(payload ->> 'declaredMimeType') > 0
  ),
  constraint resource_extraction_jobs_payload_byte_size_check check (
    payload ? 'byteSize'
    and jsonb_typeof(payload -> 'byteSize') = 'number'
    and ((payload ->> 'byteSize')::bigint >= 0)
  ),
  constraint resource_extraction_jobs_payload_content_hash_check check (
    payload ? 'contentHash'
    and length(payload ->> 'contentHash') > 0
  ),
  constraint resource_extraction_jobs_payload_extraction_strategy_version_check check (
    payload ? 'extractionStrategyVersion'
    and length(payload ->> 'extractionStrategyVersion') > 0
  ),
  constraint resource_extraction_jobs_payload_chunking_strategy_version_check check (
    payload ? 'chunkingStrategyVersion'
    and length(payload ->> 'chunkingStrategyVersion') > 0
  ),
  constraint resource_extraction_jobs_payload_requested_at_check check (
    payload ? 'requestedAt'
    and length(payload ->> 'requestedAt') > 0
  ),
  constraint resource_extraction_jobs_lock_state_check check (
    (
      status in ('queued', 'succeeded', 'failed', 'dead_lettered', 'cancelled')
      and locked_at is null
      and locked_by is null
      and heartbeat_at is null
    )
    or (
      status in ('claimed', 'running')
      and locked_at is not null
      and locked_by is not null
    )
  ),
  constraint resource_extraction_jobs_terminal_timestamp_check check (
    (
      status = 'succeeded'
      and completed_at is not null
      and failed_at is null
    )
    or (
      status in ('failed', 'dead_lettered')
      and failed_at is not null
      and completed_at is null
    )
    or (
      status not in ('succeeded', 'failed', 'dead_lettered')
      and completed_at is null
      and failed_at is null
    )
  )
);

comment on table public.resource_extraction_jobs is
  'classification: operational; purpose: durable resource extraction job requests created after ingestion validation succeeds.';

comment on column public.resource_extraction_jobs.job_id is
  'classification: operational; purpose: stable job identifier for worker claim and status tracking.';

comment on column public.resource_extraction_jobs.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and job ownership.';

comment on column public.resource_extraction_jobs.resource_id is
  'classification: academic_content; purpose: resource identifier whose validated upload requires extraction.';

comment on column public.resource_extraction_jobs.job_name is
  'classification: operational; purpose: typed job name used by the worker plane.';

comment on column public.resource_extraction_jobs.reason is
  'classification: operational; purpose: reason this extraction job was requested.';

comment on column public.resource_extraction_jobs.priority is
  'classification: operational; purpose: queue priority used for worker ordering.';

comment on column public.resource_extraction_jobs.status is
  'classification: operational; purpose: durable job lifecycle state.';

comment on column public.resource_extraction_jobs.attempt_count is
  'classification: operational; purpose: number of worker attempts made for this job.';

comment on column public.resource_extraction_jobs.payload is
  'classification: operational; purpose: typed resource extraction payload without raw bytes, signed URLs, or credentials.';

comment on column public.resource_extraction_jobs.locked_at is
  'classification: operational; purpose: worker claim timestamp.';

comment on column public.resource_extraction_jobs.locked_by is
  'classification: operational; purpose: worker claim owner identifier.';

comment on column public.resource_extraction_jobs.heartbeat_at is
  'classification: operational; purpose: worker heartbeat timestamp.';

comment on column public.resource_extraction_jobs.available_at is
  'classification: operational; purpose: earliest timestamp when the job may be claimed.';

comment on column public.resource_extraction_jobs.enqueued_at is
  'classification: operational; purpose: timestamp when ingestion validation requested extraction.';

comment on column public.resource_extraction_jobs.started_at is
  'classification: operational; purpose: worker execution start timestamp.';

comment on column public.resource_extraction_jobs.completed_at is
  'classification: operational; purpose: worker success timestamp.';

comment on column public.resource_extraction_jobs.failed_at is
  'classification: operational; purpose: worker failure timestamp.';

comment on column public.resource_extraction_jobs.last_error is
  'classification: operational; purpose: sanitized worker error summary.';

comment on column public.resource_extraction_jobs.created_at is
  'classification: operational; purpose: job row audit timestamp.';

comment on column public.resource_extraction_jobs.updated_at is
  'classification: operational; purpose: job row audit timestamp.';

create index resource_extraction_jobs_student_id_idx
  on public.resource_extraction_jobs (student_id);

create index resource_extraction_jobs_resource_id_idx
  on public.resource_extraction_jobs (resource_id);

create index resource_extraction_jobs_status_priority_available_at_idx
  on public.resource_extraction_jobs (status, priority, available_at);

create index resource_extraction_jobs_student_resource_idx
  on public.resource_extraction_jobs (student_id, resource_id);

create index resource_extraction_jobs_enqueued_at_idx
  on public.resource_extraction_jobs (enqueued_at);

alter table public.resource_extraction_jobs enable row level security;
alter table public.resource_extraction_jobs force row level security;

create policy resource_extraction_jobs_select_own
  on public.resource_extraction_jobs
  for select
  to authenticated
  using (student_id = auth.uid());
