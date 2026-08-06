-- Policy artifact: public.resource_ingestion_jobs
--
-- Owner: @avora/data
--
-- Threat prevented:
-- - Cross-student job visibility.
-- - Cross-student ingestion request creation.
-- - Client-side mutation of queue execution state.
-- - Client-side deletion of queue records.
-- - Accidental permissive table access.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/resource-ingestion-jobs.rls-plan.json
--
-- Notes:
-- - No UPDATE policy is defined in Stage 7 Group 8.
-- - No DELETE policy is defined in Stage 7 Group 8.
-- - Worker/service-role mutation relies on service-role bypass, not permissive policies.
-- - Client inserts are restricted to initial queued jobs only.

create policy resource_ingestion_jobs_select_own
  on public.resource_ingestion_jobs
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resource_ingestion_jobs_insert_own
  on public.resource_ingestion_jobs
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and status = 'queued'
    and attempt_count = 0
    and locked_at is null
    and locked_by is null
    and heartbeat_at is null
    and started_at is null
    and completed_at is null
    and failed_at is null
  );