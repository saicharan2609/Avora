-- Avora resource summary job transactional enqueue.
--
-- Purpose:
-- - Make indexing-success and summary-job creation atomic (ENG-154, AD-27),
--   mirroring app_private.enqueue_resource_indexing_job_on_chunking_success()
--   and app_private.enqueue_resource_classification_job_on_chunking_success()
--   exactly.
-- - Enforce replay safety at the database layer (ENG-139): a unique index
--   on the logical summary job identity (student, resource, prompt
--   version, summary strategy version) makes duplicate-enqueue-on-replay
--   impossible.
--
-- Trigger point — traced against actual code, not assumed equivalent to
-- the architecture narrative.
--
-- architecture.md describes summary generation as beginning from a
-- `resource.ready` domain event. A full repository trace (Stage 12 Group 7
-- blocker resolution) found NO implementation of that event anywhere in
-- this codebase: no outbox table, no event dispatcher, no code emitting or
-- subscribing to a literal "resource.ready" message. The only concrete
-- database analogue, `resources.lifecycle_state = 'ready'`, is written by
-- markResourceReady() (packages/db/repositories/resources/repository.ts),
-- called exclusively from the resource-extraction worker handler
-- immediately after extraction succeeds — before chunking, indexing, or
-- classification ever run, and therefore before any public.chunks rows
-- exist for the resource. Subscribing to that transition would mean this
-- job always observes zero chunks; it cannot be the trigger this task
-- needs, regardless of its name. This is a genuine divergence between
-- architecture.md's documented resource state machine
-- (processing -> extracted -> indexed -> ready, section 19.2) and the
-- actual resources_lifecycle_state_check constraint (a flatter 7-state
-- machine where 'ready' means "extraction done", not "pipeline done") —
-- reported here as an ENG-411 finding, not silently resolved, and out of
-- scope for this group to fix (it would require changing Stage 9's
-- extraction handler).
--
-- With no event to subscribe to, this migration instead follows
-- architecture.md section 24.1's job taxonomy table directly — the one
-- authoritative, structured statement of summary.generate's trigger point,
-- independent of the unimplemented event narrative:
-- "summary.generate | Post-index | Interactive | resource_id + prompt_version".
-- public.resource_indexing_jobs reaching `succeeded` is the concrete
-- job-table transition that label names. This mirrors exactly how Stage 12
-- Group 6's classification trigger
-- (20260826101000_resource_classification_jobs_transactional_enqueue.sql)
-- resolved its own "Post-extraction" label: read the taxonomy label as a
-- data-availability requirement and pick the concrete job-table event that
-- satisfies it, rather than firing on the literal-but-unusable resource
-- lifecycle transition or inventing an event mechanism this repository
-- does not have. Summary generation itself only needs chunk text (not
-- embeddings) and so does not strictly require indexing to complete before
-- resource_chunking_jobs would already suffice — but the documented label
-- ("Post-index") is explicit and distinct from classify's ("Post-
-- extraction"), so this migration follows it rather than substituting a
-- weaker precondition the documents do not name.
--
-- This migration intentionally does not implement summary generation
-- execution, AI/provider behavior, worker behavior, API routes, UI, or
-- mobile behavior.

create unique index resource_summary_jobs_logical_identity_uniq
  on public.resource_summary_jobs (
    student_id,
    resource_id,
    (payload ->> 'promptVersion'),
    (payload ->> 'summaryStrategyVersion')
  );

comment on index resource_summary_jobs_logical_identity_uniq is
  'notes: operational; purpose: ENG-139 database-enforced idempotency key preventing duplicate summary job rows for the same student, resource, prompt version, and summary strategy version across replay of the indexing worker.';

create or replace function app_private.enqueue_resource_summary_job_on_indexing_success()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
declare
  prompt_version text := 'summary-system-policy.v1';
  summary_strategy_version text := 'summary.generate.v1';
  requested_at text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  insert into public.resource_summary_jobs (
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
    'summary.generate.requested',
    'resource_indexed',
    'normal',
    jsonb_build_object(
      'studentId', new.payload ->> 'studentId',
      'resourceId', new.payload ->> 'resourceId',
      'promptVersion', prompt_version,
      'summaryStrategyVersion', summary_strategy_version,
      'requestedAt', requested_at
    )
  )
  on conflict (
    student_id,
    resource_id,
    (payload ->> 'promptVersion'),
    (payload ->> 'summaryStrategyVersion')
  )
  do nothing;

  return new;
end;
$$;

comment on function app_private.enqueue_resource_summary_job_on_indexing_success() is
  'notes: operational; purpose: atomically create the durable resource summary job in the same transaction as the indexing job terminal succeeded write (ENG-154, AD-27); idempotent via resource_summary_jobs_logical_identity_uniq (ENG-139).';

drop trigger if exists enqueue_resource_summary_job_after_indexing_success on public.resource_indexing_jobs;

create trigger enqueue_resource_summary_job_after_indexing_success
  after update on public.resource_indexing_jobs
  for each row
  when (new.status = 'succeeded' and old.status is distinct from 'succeeded')
  execute function app_private.enqueue_resource_summary_job_on_indexing_success();
