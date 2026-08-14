-- Policy artifact: public.resource_placement_corrections
--
-- Owner: @avora/data
--
-- Threat prevented:
-- - Cross-student placement correction access.
-- - Client-supplied identifier authorization.
-- - Academic correction ownership bypass.
-- - Accidental permissive table access.
--
-- Notes:
-- - Corrections are append-only from the application perspective.
-- - No authenticated UPDATE or DELETE policy is defined in Completion Group B.

create policy resource_placement_corrections_select_own
  on public.resource_placement_corrections
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resource_placement_corrections_insert_own
  on public.resource_placement_corrections
  for insert
  to authenticated
  with check (student_id = auth.uid());