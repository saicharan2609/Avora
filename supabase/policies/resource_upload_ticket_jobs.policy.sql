-- Policy artifact: public.resource_upload_ticket_jobs
--
-- Owner: @avora/data
-- Security co-owner: @avora/security
--
-- Table:
-- - public.resource_upload_ticket_jobs
--
-- Threat prevented:
-- - Cross-student job visibility.
-- - Client-side creation of an upload-ticket request owned by another student.
-- - Client-side mutation of queue execution state.
-- - Client-side deletion of queue records.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/resource-upload-ticket-jobs.rls-plan.json
--
-- Notes:
-- - Unlike resource_chunking_jobs, this job is enqueued directly by the
--   authenticated student's own request (through the student-scoped
--   Supabase client the web tier already uses for resources, never a
--   service-role client). A student may insert a job row for themself only.
-- - Claim, heartbeat, completion, and failure recording happen only in the
--   worker plane, which performs the actual privileged Supabase Storage
--   operation using its own worker-tier service-role client and relies on
--   service-role bypass for those mutations, not a permissive policy.
-- - Authenticated students may read their own upload-ticket jobs only, and
--   may never update or delete a job row.

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
