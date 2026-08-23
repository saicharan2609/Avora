-- Avora resource upload ticket jobs.
--
-- Purpose:
-- - Persist durable resource upload-ticket job requests so that signed
--   upload URL issuance (a privileged Supabase Storage operation) happens
--   exclusively in the worker plane, never in the web request runtime.
-- - Preserve student-scoped ownership and deny-by-default RLS.
--
-- This migration corrects a SEC-005 violation: apps/web previously
-- constructed a service-role Supabase Storage client directly to issue
-- signed upload URLs. That capability moves to the worker plane; the web
-- tier now only enqueues this job and reads back its result.
--
-- This migration intentionally does not implement Stripe/PSP, billing,
-- Gemini/AI provider logic, or any Track B/C functionality.

create table public.resource_upload_ticket_jobs (
  job_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (student_id) on delete cascade,
  resource_id uuid not null references public.resources (resource_id) on delete cascade,
  job_name text not null,
  reason text not null,
  priority text not null,
  status text not null default 'queued',
  attempt_count integer not null default 0,
  payload jsonb not null,
  result jsonb,
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
  constraint resource_upload_ticket_jobs_job_name_check check (
    job_name = 'resource.upload_ticket.create'
  ),
  constraint resource_upload_ticket_jobs_reason_check check (
    reason in ('upload_declared')
  ),
  constraint resource_upload_ticket_jobs_priority_check check (
    priority in ('interactive', 'normal', 'backfill')
  ),
  constraint resource_upload_ticket_jobs_status_check check (
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
  constraint resource_upload_ticket_jobs_attempt_count_non_negative_check check (
    attempt_count >= 0
  ),
  constraint resource_upload_ticket_jobs_payload_object_check check (
    jsonb_typeof(payload) = 'object'
  ),
  constraint resource_upload_ticket_jobs_payload_student_id_check check (
    payload ? 'studentId'
    and payload ->> 'studentId' = student_id::text
  ),
  constraint resource_upload_ticket_jobs_payload_resource_id_check check (
    payload ? 'resourceId'
    and payload ->> 'resourceId' = resource_id::text
  ),
  constraint resource_upload_ticket_jobs_payload_object_path_check check (
    payload ? 'objectPath'
    and length(payload ->> 'objectPath') > 0
  ),
  constraint resource_upload_ticket_jobs_result_object_check check (
    result is null or jsonb_typeof(result) = 'object'
  ),
  constraint resource_upload_ticket_jobs_lock_state_check check (
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
  constraint resource_upload_ticket_jobs_terminal_timestamp_check check (
    (
      status = 'succeeded'
      and completed_at is not null
      and failed_at is null
      and result is not null
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

comment on table public.resource_upload_ticket_jobs is
  'classification: operational; purpose: durable resource upload-ticket job requests, moving privileged signed-upload-URL issuance out of the web request runtime and into the worker plane.';

comment on column public.resource_upload_ticket_jobs.job_id is
  'classification: operational; purpose: stable job identifier for worker claim and status tracking.';

comment on column public.resource_upload_ticket_jobs.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and job ownership.';

comment on column public.resource_upload_ticket_jobs.resource_id is
  'classification: academic_content; purpose: resource identifier the requested upload ticket belongs to.';

comment on column public.resource_upload_ticket_jobs.job_name is
  'classification: operational; purpose: typed job name used by the worker plane.';

comment on column public.resource_upload_ticket_jobs.reason is
  'classification: operational; purpose: reason this upload-ticket job was requested.';

comment on column public.resource_upload_ticket_jobs.priority is
  'classification: operational; purpose: queue priority used for worker ordering.';

comment on column public.resource_upload_ticket_jobs.status is
  'classification: operational; purpose: durable job lifecycle state.';

comment on column public.resource_upload_ticket_jobs.attempt_count is
  'classification: operational; purpose: number of worker attempts made for this job.';

comment on column public.resource_upload_ticket_jobs.payload is
  'classification: operational; purpose: typed upload-ticket request payload.';

comment on column public.resource_upload_ticket_jobs.result is
  'classification: operational; purpose: signed upload URL and storage location produced by the worker on success. Never contains a credential.';

comment on column public.resource_upload_ticket_jobs.locked_at is
  'classification: operational; purpose: worker claim timestamp.';

comment on column public.resource_upload_ticket_jobs.locked_by is
  'classification: operational; purpose: worker claim owner identifier.';

comment on column public.resource_upload_ticket_jobs.heartbeat_at is
  'classification: operational; purpose: worker heartbeat timestamp.';

comment on column public.resource_upload_ticket_jobs.available_at is
  'classification: operational; purpose: earliest timestamp when the job may be claimed.';

comment on column public.resource_upload_ticket_jobs.enqueued_at is
  'classification: operational; purpose: timestamp when the upload was declared.';

comment on column public.resource_upload_ticket_jobs.started_at is
  'classification: operational; purpose: worker execution start timestamp.';

comment on column public.resource_upload_ticket_jobs.completed_at is
  'classification: operational; purpose: worker success timestamp.';

comment on column public.resource_upload_ticket_jobs.failed_at is
  'classification: operational; purpose: worker failure timestamp.';

comment on column public.resource_upload_ticket_jobs.last_error is
  'classification: operational; purpose: sanitized worker error summary.';

comment on column public.resource_upload_ticket_jobs.created_at is
  'classification: operational; purpose: job row audit timestamp.';

comment on column public.resource_upload_ticket_jobs.updated_at is
  'classification: operational; purpose: job row audit timestamp.';

create index resource_upload_ticket_jobs_student_id_idx
  on public.resource_upload_ticket_jobs (student_id);

create index resource_upload_ticket_jobs_resource_id_idx
  on public.resource_upload_ticket_jobs (resource_id);

create index resource_upload_ticket_jobs_status_priority_available_at_idx
  on public.resource_upload_ticket_jobs (status, priority, available_at);

create index resource_upload_ticket_jobs_student_resource_idx
  on public.resource_upload_ticket_jobs (student_id, resource_id);

alter table public.resource_upload_ticket_jobs enable row level security;
alter table public.resource_upload_ticket_jobs force row level security;

create policy resource_upload_ticket_jobs_select_own
  on public.resource_upload_ticket_jobs
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resource_upload_ticket_jobs_insert_own
  on public.resource_upload_ticket_jobs
  for insert
  to authenticated
  with check (student_id = auth.uid());
