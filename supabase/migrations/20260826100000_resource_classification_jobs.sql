-- Avora resource classification jobs.
--
-- Purpose:
-- - Persist durable resource classification job requests after resource
--   ingestion validation succeeds, mirroring the resource_extraction_jobs /
--   resource_chunking_jobs / resource_indexing_jobs durable-queue pattern.
-- - Make the worker-side classification job handler claimable, retryable,
--   and idempotent (ENG-191, ENG-192, ENG-193), matching the sibling job
--   tables' claim/heartbeat/complete/fail lifecycle exactly.
-- - Preserve student-scoped ownership and deny-by-default RLS (NN-04).
--
-- This migration intentionally does not implement classification execution,
-- AI/provider behavior, placement candidate persistence (that is
-- public.resource_placement_candidates, Completion Group A/B), workers, API
-- routes, UI, or mobile behavior. Stage 12 Group 6 maps to
-- docs/MASTER-ROADMAP.md "Group 6: Resource Auto-Classification".

create table public.resource_classification_jobs (
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
  constraint resource_classification_jobs_job_name_check check (
    job_name = 'resource.classification.requested'
  ),
  constraint resource_classification_jobs_reason_check check (
    reason in (
      'resource_ingestion_validated',
      'placement_reclassification_requested'
    )
  ),
  constraint resource_classification_jobs_priority_check check (
    priority in ('interactive', 'normal', 'backfill')
  ),
  constraint resource_classification_jobs_status_check check (
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
  constraint resource_classification_jobs_attempt_count_non_negative_check check (
    attempt_count >= 0
  ),
  constraint resource_classification_jobs_payload_object_check check (
    jsonb_typeof(payload) = 'object'
  ),
  constraint resource_classification_jobs_payload_student_id_check check (
    payload ? 'studentId'
    and payload ->> 'studentId' = student_id::text
  ),
  constraint resource_classification_jobs_payload_resource_id_check check (
    payload ? 'resourceId'
    and payload ->> 'resourceId' = resource_id::text
  ),
  constraint resource_classification_jobs_payload_classification_strategy_version_check check (
    payload ? 'classificationStrategyVersion'
    and length(payload ->> 'classificationStrategyVersion') > 0
  ),
  constraint resource_classification_jobs_payload_placement_policy_version_check check (
    payload ? 'placementPolicyVersion'
    and length(payload ->> 'placementPolicyVersion') > 0
  ),
  constraint resource_classification_jobs_payload_requested_at_check check (
    payload ? 'requestedAt'
    and length(payload ->> 'requestedAt') > 0
  ),
  constraint resource_classification_jobs_lock_state_check check (
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
  constraint resource_classification_jobs_terminal_timestamp_check check (
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

comment on table public.resource_classification_jobs is
  'classification: operational; purpose: durable resource classification job requests created after resource ingestion validation succeeds.';

comment on column public.resource_classification_jobs.job_id is
  'classification: operational; purpose: stable job identifier for worker claim and status tracking.';

comment on column public.resource_classification_jobs.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and job ownership.';

comment on column public.resource_classification_jobs.resource_id is
  'classification: academic_content; purpose: resource identifier proposed for automated classification.';

comment on column public.resource_classification_jobs.job_name is
  'classification: operational; purpose: typed job name used by the worker plane.';

comment on column public.resource_classification_jobs.reason is
  'classification: operational; purpose: reason this classification job was requested.';

comment on column public.resource_classification_jobs.priority is
  'classification: operational; purpose: queue priority used for worker ordering.';

comment on column public.resource_classification_jobs.status is
  'classification: operational; purpose: durable job lifecycle state.';

comment on column public.resource_classification_jobs.attempt_count is
  'classification: operational; purpose: number of worker attempts made for this job.';

comment on column public.resource_classification_jobs.payload is
  'classification: operational; purpose: typed resource classification payload without raw extracted text or headings.';

comment on column public.resource_classification_jobs.locked_at is
  'classification: operational; purpose: worker claim timestamp.';

comment on column public.resource_classification_jobs.locked_by is
  'classification: operational; purpose: worker claim owner identifier.';

comment on column public.resource_classification_jobs.heartbeat_at is
  'classification: operational; purpose: worker heartbeat timestamp.';

comment on column public.resource_classification_jobs.available_at is
  'classification: operational; purpose: earliest timestamp when the job may be claimed.';

comment on column public.resource_classification_jobs.enqueued_at is
  'classification: operational; purpose: timestamp when ingestion validation success requested classification.';

comment on column public.resource_classification_jobs.started_at is
  'classification: operational; purpose: worker execution start timestamp.';

comment on column public.resource_classification_jobs.completed_at is
  'classification: operational; purpose: worker success timestamp.';

comment on column public.resource_classification_jobs.failed_at is
  'classification: operational; purpose: worker failure timestamp.';

comment on column public.resource_classification_jobs.last_error is
  'classification: operational; purpose: sanitized worker error summary.';

comment on column public.resource_classification_jobs.created_at is
  'classification: operational; purpose: job row audit timestamp.';

comment on column public.resource_classification_jobs.updated_at is
  'classification: operational; purpose: job row audit timestamp.';

create index resource_classification_jobs_student_id_idx
  on public.resource_classification_jobs (student_id);

create index resource_classification_jobs_resource_id_idx
  on public.resource_classification_jobs (resource_id);

create index resource_classification_jobs_status_priority_available_at_idx
  on public.resource_classification_jobs (status, priority, available_at);

create index resource_classification_jobs_student_resource_idx
  on public.resource_classification_jobs (student_id, resource_id);

create index resource_classification_jobs_enqueued_at_idx
  on public.resource_classification_jobs (enqueued_at);

alter table public.resource_classification_jobs enable row level security;
alter table public.resource_classification_jobs force row level security;

create policy resource_classification_jobs_select_own
  on public.resource_classification_jobs
  for select
  to authenticated
  using (student_id = auth.uid());
