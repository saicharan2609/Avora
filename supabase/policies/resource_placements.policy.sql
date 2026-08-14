-- Policy artifact: public.resource_placements
--
-- Owner: @avora/data
--
-- Threat prevented:
-- - Cross-student resource placement access.
-- - Client-supplied identifier authorization.
-- - Academic placement ownership bypass.
-- - Accidental permissive table access.
--
-- Notes:
-- - No DELETE policy is defined in Completion Group B.
-- - Placement deletion is a later orchestrated subsystem.

create policy resource_placements_select_own
  on public.resource_placements
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resource_placements_insert_own
  on public.resource_placements
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy resource_placements_update_own
  on public.resource_placements
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());