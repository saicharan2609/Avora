-- Policy artifact: public.resources
--
-- Owner: @avora/data
--
-- Threat prevented:
-- - Cross-student resource metadata access.
-- - Client-supplied identifier authorization.
-- - Storage path ownership bypass.
-- - Accidental permissive table access.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/resources.rls-plan.json
--
-- Notes:
-- - No DELETE policy is defined in Stage 7 Group 1.
-- - Resource deletion is a later orchestrated subsystem and must not be
--   implemented as direct resource-row deletion here.
-- - Storage paths must begin with student_id.

create policy resources_select_own
  on public.resources
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resources_insert_own
  on public.resources
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy resources_update_own
  on public.resources
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());