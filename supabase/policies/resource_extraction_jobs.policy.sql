-- Policy artifact: public.resource_extraction_jobs
--
-- Owner: @avora/data
-- Security co-owner: @avora/security
--
-- Table:
-- - public.resource_extraction_jobs
--
-- Threat prevented:
-- - Cross-student job visibility.
-- - Client-side creation of extraction requests.
-- - Client-side mutation of queue execution state.
-- - Client-side deletion of queue records.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/resource-extraction-jobs.rls-plan.json
--
-- Notes:
-- - Extraction jobs are enqueued only by the worker plane, after ingestion validation
--   succeeds, never by direct student action. There is no legitimate client-side insert
--   path, unlike resource_ingestion_jobs (which the web composition root enqueues on the
--   student's behalf at upload-completion time).
-- - Authenticated students may read their own extraction jobs only.
-- - Worker mutation (insert, claim, heartbeat, completion, failure) relies on
--   service-role bypass, not permissive policies.

create policy resource_extraction_jobs_select_own
  on public.resource_extraction_jobs
  for select
  to authenticated
  using (student_id = auth.uid());
