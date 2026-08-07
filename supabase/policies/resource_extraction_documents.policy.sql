-- Policy artifact: resource extraction documents
--
-- Owner: @avora/data
-- Security co-owner: @avora/security
--
-- Tables:
-- - public.resource_extraction_documents
-- - public.resource_extracted_content_blocks
--
-- Threat prevented:
-- - Cross-student extraction document visibility.
-- - Cross-student extracted content visibility.
-- - Client-side insertion of extraction output.
-- - Client-side mutation of extraction output.
-- - Client-side deletion of extraction output.
--
-- Harness coverage:
-- - packages/db/rls/__tests__/resource-extraction-documents.rls-plan.json
--
-- Notes:
-- - Authenticated students may read their own extraction output.
-- - Authenticated students may not insert, update, or delete extraction output.
-- - Worker mutation relies on service-role bypass.
-- - Composite foreign keys preserve same-student ownership from resources
--   to extraction documents and extracted content blocks.

create policy resource_extraction_documents_select_own
  on public.resource_extraction_documents
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resource_extracted_content_blocks_select_own
  on public.resource_extracted_content_blocks
  for select
  to authenticated
  using (student_id = auth.uid());