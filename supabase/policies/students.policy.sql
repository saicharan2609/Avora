-- Policy artifact: public.students
--
-- Owner: @avora/data
--
-- Threat prevented:
-- - Cross-student identity access.
-- - Client-supplied identifier authorization.
-- - Accidental permissive table access.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/students.rls-plan.json
--
-- Notes:
-- - No DELETE policy is defined in Stage 6 Group 2.
-- - Account deletion is a later orchestrated subsystem and must not be
--   implemented as direct student-row deletion here.

create policy students_select_own
  on public.students
  for select
  to authenticated
  using (student_id = auth.uid());

create policy students_insert_own
  on public.students
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy students_update_own
  on public.students
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());