-- Policy artifact: public.resource_chunking_jobs
--
-- Owner: @avora/data
-- Security co-owner: @avora/security
--
-- Table:
-- - public.resource_chunking_jobs
--
-- Threat prevented:
-- - Cross-student job visibility.
-- - Client-side creation of chunking requests.
-- - Client-side mutation of queue execution state.
-- - Client-side deletion of queue records.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/resource-chunking-jobs.rls-plan.json
--
-- Notes:
-- - Chunking jobs are enqueued only by the worker plane, after resource
--   extraction succeeds, never by direct student action. There is no
--   legitimate client-side insert path, mirroring resource_extraction_jobs.
-- - Authenticated students may read their own chunking jobs only.
-- - Worker mutation (insert, claim, heartbeat, completion, failure) relies on
--   service-role bypass, not permissive policies.

create policy resource_chunking_jobs_select_own
  on public.resource_chunking_jobs
  for select
  to authenticated
  using (student_id = auth.uid());
