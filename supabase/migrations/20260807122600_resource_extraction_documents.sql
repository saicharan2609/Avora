-- Avora resource extraction persistence.
--
-- Purpose:
-- - Persist extraction documents produced from validated resources.
-- - Persist locator-preserving extracted content blocks.
-- - Preserve strict student-scoped ownership through RLS and composite foreign keys.
--
-- This migration intentionally does not implement repositories, worker execution,
-- storage adapters, OCR, parsing, AI behavior, retrieval indexing, route handlers,
-- UI, mobile behavior, or tests.

create extension if not exists pgcrypto with schema extensions;

create table public.resource_extraction_documents (
  extraction_document_id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  resource_id uuid not null,
  status text not null,
  extraction_strategy_version text not null,
  chunking_strategy_version text not null,
  extracted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_extraction_documents_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,
  constraint resource_extraction_documents_resource_fkey foreign key (student_id, resource_id)
    references public.resources (student_id, resource_id)
    on delete cascade,
  constraint resource_extraction_documents_status_check check (
    status in ('extracted', 'partially_extracted', 'failed')
  ),
  constraint resource_extraction_documents_extraction_strategy_version_check check (
    length(trim(extraction_strategy_version)) > 0
  ),
  constraint resource_extraction_documents_chunking_strategy_version_check check (
    length(trim(chunking_strategy_version)) > 0
  ),
  constraint resource_extraction_documents_student_document_unique unique (
    student_id,
    extraction_document_id
  ),
  constraint resource_extraction_documents_student_resource_document_unique unique (
    student_id,
    resource_id,
    extraction_document_id
  )
);

comment on table public.resource_extraction_documents is
  'classification: resource_processing; purpose: extraction documents produced from validated student resources.';

comment on column public.resource_extraction_documents.extraction_document_id is
  'classification: resource_processing; purpose: stable extraction document identifier.';

comment on column public.resource_extraction_documents.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and graph ownership.';

comment on column public.resource_extraction_documents.resource_id is
  'classification: resources; purpose: source resource identifier.';

comment on column public.resource_extraction_documents.status is
  'classification: operational; purpose: extraction document terminal status.';

comment on column public.resource_extraction_documents.extraction_strategy_version is
  'classification: operational; purpose: versioned extraction strategy used to produce this document.';

comment on column public.resource_extraction_documents.chunking_strategy_version is
  'classification: operational; purpose: versioned chunking strategy associated with extracted content.';

comment on column public.resource_extraction_documents.extracted_at is
  'classification: operational; purpose: timestamp when extraction output was produced.';

comment on column public.resource_extraction_documents.created_at is
  'classification: operational; purpose: row creation timestamp.';

comment on column public.resource_extraction_documents.updated_at is
  'classification: operational; purpose: row update timestamp.';

create table public.resource_extracted_content_blocks (
  block_id uuid primary key default gen_random_uuid(),
  extraction_document_id uuid not null,
  student_id uuid not null,
  resource_id uuid not null,
  kind text not null,
  text text not null,
  locator jsonb not null,
  sort_order integer not null,
  parent_block_id uuid,
  confidence numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_extracted_content_blocks_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,
  constraint resource_extracted_content_blocks_document_fkey foreign key (
    student_id,
    resource_id,
    extraction_document_id
  )
    references public.resource_extraction_documents (
      student_id,
      resource_id,
      extraction_document_id
    )
    on delete cascade,
  constraint resource_extracted_content_blocks_parent_fkey foreign key (
    student_id,
    extraction_document_id,
    parent_block_id
  )
    references public.resource_extracted_content_blocks (
      student_id,
      extraction_document_id,
      block_id
    )
    on delete cascade,
  constraint resource_extracted_content_blocks_kind_check check (
    kind in (
      'heading',
      'paragraph',
      'list',
      'table',
      'formula',
      'code',
      'figure',
      'diagram',
      'transcript',
      'metadata',
      'unknown'
    )
  ),
  constraint resource_extracted_content_blocks_text_not_empty_check check (
    length(trim(text)) > 0
  ),
  constraint resource_extracted_content_blocks_locator_object_check check (
    jsonb_typeof(locator) = 'object'
  ),
  constraint resource_extracted_content_blocks_locator_kind_check check (
    locator ? 'kind'
    and locator ->> 'kind' in (
      'document_page',
      'slide',
      'image_region',
      'audio_time_range',
      'video_time_range',
      'text_span',
      'unknown'
    )
  ),
  constraint resource_extracted_content_blocks_sort_order_non_negative_check check (
    sort_order >= 0
  ),
  constraint resource_extracted_content_blocks_not_own_parent_check check (
    parent_block_id is null
    or parent_block_id <> block_id
  ),
  constraint resource_extracted_content_blocks_confidence_range_check check (
    confidence is null
    or (
      confidence >= 0
      and confidence <= 1
    )
  ),
  constraint resource_extracted_content_blocks_student_document_block_unique unique (
    student_id,
    extraction_document_id,
    block_id
  )
);

comment on table public.resource_extracted_content_blocks is
  'classification: resource_processing; purpose: locator-preserving content blocks extracted from student resources.';

comment on column public.resource_extracted_content_blocks.block_id is
  'classification: resource_processing; purpose: stable extracted content block identifier.';

comment on column public.resource_extracted_content_blocks.extraction_document_id is
  'classification: resource_processing; purpose: owning extraction document identifier.';

comment on column public.resource_extracted_content_blocks.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and graph ownership.';

comment on column public.resource_extracted_content_blocks.resource_id is
  'classification: resources; purpose: source resource identifier.';

comment on column public.resource_extracted_content_blocks.kind is
  'classification: resource_processing; purpose: semantic extracted content block kind.';

comment on column public.resource_extracted_content_blocks.text is
  'classification: student_content; purpose: extracted student-owned content text.';

comment on column public.resource_extracted_content_blocks.locator is
  'classification: resource_processing; purpose: locator metadata back to the original resource.';

comment on column public.resource_extracted_content_blocks.sort_order is
  'classification: operational; purpose: deterministic ordering inside an extraction document or parent block.';

comment on column public.resource_extracted_content_blocks.parent_block_id is
  'classification: resource_processing; purpose: optional parent block for hierarchical extraction output.';

comment on column public.resource_extracted_content_blocks.confidence is
  'classification: operational; purpose: optional extractor confidence from 0 to 1.';

comment on column public.resource_extracted_content_blocks.created_at is
  'classification: operational; purpose: row creation timestamp.';

comment on column public.resource_extracted_content_blocks.updated_at is
  'classification: operational; purpose: row update timestamp.';

create index resource_extraction_documents_student_id_idx
  on public.resource_extraction_documents (student_id);

create index resource_extraction_documents_resource_id_idx
  on public.resource_extraction_documents (resource_id);

create index resource_extraction_documents_student_resource_idx
  on public.resource_extraction_documents (student_id, resource_id);

create index resource_extraction_documents_student_status_idx
  on public.resource_extraction_documents (student_id, status);

create index resource_extraction_documents_extracted_at_idx
  on public.resource_extraction_documents (extracted_at);

create index resource_extracted_content_blocks_student_id_idx
  on public.resource_extracted_content_blocks (student_id);

create index resource_extracted_content_blocks_resource_id_idx
  on public.resource_extracted_content_blocks (resource_id);

create index resource_extracted_content_blocks_extraction_document_id_idx
  on public.resource_extracted_content_blocks (extraction_document_id);

create index resource_extracted_content_blocks_parent_block_id_idx
  on public.resource_extracted_content_blocks (parent_block_id);

create index resource_extracted_content_blocks_student_document_sort_idx
  on public.resource_extracted_content_blocks (
    student_id,
    extraction_document_id,
    parent_block_id,
    sort_order
  );

create index resource_extracted_content_blocks_locator_kind_idx
  on public.resource_extracted_content_blocks ((locator ->> 'kind'));

alter table public.resource_extraction_documents enable row level security;
alter table public.resource_extraction_documents force row level security;

alter table public.resource_extracted_content_blocks enable row level security;
alter table public.resource_extracted_content_blocks force row level security;

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