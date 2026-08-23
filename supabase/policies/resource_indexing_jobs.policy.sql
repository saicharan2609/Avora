-- Policy artifact: public.resource_indexing_jobs
--
-- Owner: @avora/data
-- Security co-owner: @avora/security
--
-- Table:
-- - public.resource_indexing_jobs
--
-- Threat prevented:
-- - Cross-student job visibility.
-- - Client-side creation of indexing requests.
-- - Client-side mutation of queue execution state.
-- - Client-side deletion of queue records.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/resource-indexing-jobs.rls-plan.json
--
-- Notes:
-- - Indexing jobs are enqueued only by the worker plane, after resource
--   chunking succeeds, never by direct student action. There is no
--   legitimate client-side insert path, mirroring resource_extraction_jobs
--   and resource_chunking_jobs.
-- - Authenticated students may read their own indexing jobs only.
-- - Worker mutation (insert, claim, heartbeat, completion, failure) relies on
--   service-role bypass, not permissive policies.

create policy resource_indexing_jobs_select_own
  on public.resource_indexing_jobs
  for select
  to authenticated
  using (student_id = auth.uid());
