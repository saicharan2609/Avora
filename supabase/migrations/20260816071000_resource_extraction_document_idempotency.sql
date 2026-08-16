-- Avora resource extraction document idempotency.
--
-- Purpose:
-- - Add the Stage 10 Group 4 DB-backed checkpoint key for extraction documents.
-- - Guarantee one extraction document per student/resource/extraction strategy/chunking strategy.
-- - Preserve all existing resource extraction document identity and ownership constraints.
--
-- This migration intentionally does not implement worker execution, storage adapters,
-- OCR, parsing, AI behavior, retrieval indexing, route handlers, UI, mobile behavior,
-- RLS changes, child-row idempotency, or production data cleanup.

do $$
begin
  if exists (
    select 1
    from public.resource_extraction_documents
    group by
      student_id,
      resource_id,
      extraction_strategy_version,
      chunking_strategy_version
    having count(*) > 1
  ) then
    raise exception
      'Cannot add resource extraction document checkpoint uniqueness: duplicate student/resource/strategy/chunking combinations already exist.';
  end if;
end $$;

alter table public.resource_extraction_documents
  add constraint resource_extraction_documents_student_resource_strategy_unique unique (
    student_id,
    resource_id,
    extraction_strategy_version,
    chunking_strategy_version
  );

comment on constraint resource_extraction_documents_student_resource_strategy_unique
  on public.resource_extraction_documents is
  'classification: operational; purpose: Stage 10 Group 4 idempotency checkpoint for one extraction document per student, resource, extraction strategy, and chunking strategy.';