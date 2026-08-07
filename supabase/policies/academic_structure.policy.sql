-- Policy artifact: academic structure graph
--
-- Owner: @avora/data
-- Security co-owner: @avora/security
--
-- Tables:
-- - public.academic_terms
-- - public.subjects
-- - public.structure_units
--
-- Threat prevented:
-- - Cross-student academic term visibility.
-- - Cross-student subject visibility.
-- - Cross-student structure unit visibility.
-- - Cross-student academic graph insertion.
-- - Cross-student academic graph mutation.
-- - Client-side deletion of academic graph rows.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/academic-structure.rls-plan.json
--
-- Notes:
-- - No DELETE policy is defined in Stage 8 Group 2.
-- - Worker/service-role access, if ever needed, must rely on service-role bypass.
-- - Composite foreign keys preserve same-student ownership across terms, subjects, and structure units.

create policy academic_terms_select_own
  on public.academic_terms
  for select
  to authenticated
  using (student_id = auth.uid());

create policy academic_terms_insert_own
  on public.academic_terms
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy academic_terms_update_own
  on public.academic_terms
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy subjects_select_own
  on public.subjects
  for select
  to authenticated
  using (student_id = auth.uid());

create policy subjects_insert_own
  on public.subjects
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy subjects_update_own
  on public.subjects
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy structure_units_select_own
  on public.structure_units
  for select
  to authenticated
  using (student_id = auth.uid());

create policy structure_units_insert_own
  on public.structure_units
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy structure_units_update_own
  on public.structure_units
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());