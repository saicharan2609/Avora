-- Policy artifact: retrieval chunks
--
-- Owner: @avora/data
-- Security co-owner: @avora/security
--
-- Table:
-- - public.chunks
--
-- Threat prevented:
-- - Cross-student retrieval chunk visibility.
-- - Client-side insertion of derived retrieval chunks.
-- - Client-side mutation of derived retrieval chunks.
-- - Client-side deletion of derived retrieval chunks.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/chunks.rls-plan.json
--
-- Notes:
-- - Authenticated students may read their own chunks.
-- - Authenticated students may not insert, update, or delete chunks.
-- - Worker mutation relies on service-role bypass.
-- - Chunks are citation-bearing derived artifacts and must remain student-scoped.

create policy chunks_select_own
  on public.chunks
  for select
  to authenticated
  using (student_id = auth.uid());