-- Avora resource classification job transactional enqueue.
--
-- Purpose:
-- - Make chunking-success and classification-job creation atomic (ENG-154,
--   AD-27), mirroring app_private.enqueue_resource_indexing_job_on_chunking_success()
--   (20260818120000_resource_indexing_jobs_transactional_enqueue.sql) exactly.
-- - Enforce replay safety at the database layer (ENG-139): a unique index on
--   the logical classification identity (student, resource, classification
--   strategy version, placement policy version) makes duplicate-enqueue-on-
--   replay impossible.
--
-- Trigger point — corrected from an earlier draft of this migration.
--
-- architecture.md section 24.1's job taxonomy lists `resource.classify` with
-- the same trigger label as `resource.index`: "Post-extraction". The actual,
-- already-implemented `resource.index` trigger
-- (app_private.enqueue_resource_indexing_job_on_chunking_success, in
-- 20260818120000_resource_indexing_jobs_transactional_enqueue.sql) fires on
-- `resource_chunking_jobs` reaching `succeeded`, not on
-- `resource_extraction_jobs` directly — chunking is the last step that
-- exists between "extraction" and the two peer post-extraction jobs
-- (indexing, classification) sharing that taxonomy row. This migration now
-- mirrors that exact, already-established precedent: classification is
-- wired as a sibling trigger on the same source table and event as
-- indexing, not as a second trigger on resource_extraction_jobs and not on
-- resource_ingestion_jobs.
--
-- This corrects a defect in this migration's first draft, which instead
-- fired classification on resource_ingestion_jobs reaching `succeeded` —
-- i.e. immediately after upload validation, before extraction or chunking
-- have produced any structure-detected headings or retrieval chunks. At
-- that point apps/worker/src/resource-classification's handler could only
-- ever see filename evidence for the resource being classified (never
-- content/heading evidence, contrary to this group's own required
-- deliverable: "classification service matching document content/headings
-- to the student's academic graph"), and the resource-content corpus
-- searched for architecture.md 19.4's embedding-similarity signal
-- (packages/retrieval/search's HybridRetrievalSearch, wired in
-- apps/worker/src/runtime/createWorkerRuntime.ts) would still have been
-- valid (it searches the student's *other* already-indexed resources, not
-- this one), but the primary lexical signal was structurally starved.
-- Firing after chunking succeeds guarantees `public.chunks` rows (and
-- therefore heading/content evidence) exist for this resource before
-- classification runs. This is the smallest correction that establishes
-- that guarantee: it reuses the existing chunking-success trigger point
-- indexing already relies on, rather than inventing a new "post-indexing"
-- or "post-classification-readiness" trigger stage that no sibling job
-- uses and no governing document names.
--
-- The `reason` value is still 'resource_ingestion_validated' — the only
-- automatic-pipeline reason defined in the pre-existing, already-approved
-- ResourceClassificationJobReason enum (Completion Group C,
-- packages/jobs/resource-classification/contracts.ts). That enum is not
-- modified here: its only other member, 'placement_reclassification_requested',
-- is reserved for a later, explicitly student-triggered flow. Renaming or
-- adding a reason value would touch an already-approved cross-cutting
-- contract outside this migration's scope; 'resource_ingestion_validated'
-- still accurately describes *why* this classification request exists (the
-- automatic pipeline, as opposed to an explicit student reclassification
-- request) even though the mechanical trigger now fires one pipeline stage
-- later than its literal name suggests. Flagged here rather than resolved
-- silently.
--
-- This migration intentionally does not implement classification execution,
-- AI/provider behavior, placement candidate persistence, retrieval,
-- embeddings, UI, or mobile behavior.

create unique index resource_classification_jobs_logical_identity_uniq
  on public.resource_classification_jobs (
    student_id,
    resource_id,
    (payload ->> 'classificationStrategyVersion'),
    (payload ->> 'placementPolicyVersion')
  );

comment on index resource_classification_jobs_logical_identity_uniq is
  'classification: operational; purpose: ENG-139 database-enforced idempotency key preventing duplicate classification job rows for the same student, resource, classification strategy version, and placement policy version across replay of the chunking worker.';

create or replace function app_private.enqueue_resource_classification_job_on_chunking_success()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
declare
  classification_strategy_version text := 'classifier.v1';
  placement_policy_version text := 'placement-policy.v1';
  requested_at text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  insert into public.resource_classification_jobs (
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
    'resource.classification.requested',
    'resource_ingestion_validated',
    'normal',
    jsonb_build_object(
      'studentId', new.payload ->> 'studentId',
      'resourceId', new.payload ->> 'resourceId',
      'classificationStrategyVersion', classification_strategy_version,
      'placementPolicyVersion', placement_policy_version,
      'requestedAt', requested_at
    )
  )
  on conflict (
    student_id,
    resource_id,
    (payload ->> 'classificationStrategyVersion'),
    (payload ->> 'placementPolicyVersion')
  )
  do nothing;

  return new;
end;
$$;

comment on function app_private.enqueue_resource_classification_job_on_chunking_success() is
  'classification: operational; purpose: atomically create the durable resource classification job in the same transaction as the chunking job terminal succeeded write (ENG-154, AD-27), mirroring the indexing trigger''s use of the same source event; idempotent via resource_classification_jobs_logical_identity_uniq (ENG-139).';

drop trigger if exists enqueue_resource_classification_job_after_ingestion_success on public.resource_ingestion_jobs;

drop trigger if exists enqueue_resource_classification_job_after_chunking_success on public.resource_chunking_jobs;

create trigger enqueue_resource_classification_job_after_chunking_success
  after update on public.resource_chunking_jobs
  for each row
  when (new.status = 'succeeded' and old.status is distinct from 'succeeded')
  execute function app_private.enqueue_resource_classification_job_on_chunking_success();
