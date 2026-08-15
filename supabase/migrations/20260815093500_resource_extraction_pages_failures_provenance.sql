-- Avora resource extraction page, failure, and provenance persistence.
--
-- Purpose:
-- - Persist extracted pages associated with extraction documents.
-- - Persist extraction provenance for documents and pages.
-- - Persist extraction failures, including unsupported-page failures.
-- - Preserve strict student-scoped ownership through RLS and composite foreign keys.
--
-- This migration intentionally does not implement repositories, worker execution,
-- storage adapters, OCR, parsing, AI behavior, retrieval indexing, route handlers,
-- UI, mobile behavior, or tests.

create extension if not exists pgcrypto with schema extensions;

create table public.resource_extraction_provenance (
  provenance_id uuid primary key default gen_random_uuid(),
  extraction_document_id uuid not null,
  student_id uuid not null,
  resource_id uuid not null,
  page_number integer,
  source text not null,
  strategy_version text not null,
  extracted_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint resource_extraction_provenance_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,
  constraint resource_extraction_provenance_document_fkey foreign key (
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
  constraint resource_extraction_provenance_source_check check (
    source in (
      'document_text',
      'ocr',
      'scan',
      'handwriting',
      'manual',
      'system'
    )
  ),
  constraint resource_extraction_provenance_strategy_version_check check (
    length(trim(strategy_version)) > 0
  ),
  constraint resource_extraction_provenance_page_number_positive_check check (
    page_number is null
    or page_number > 0
  ),
  constraint resource_extraction_provenance_notes_not_blank_check check (
    notes is null
    or length(trim(notes)) > 0
  ),
  constraint resource_extraction_provenance_student_document_provenance_unique unique (
    student_id,
    extraction_document_id,
    provenance_id
  )
);

comment on table public.resource_extraction_provenance is
  'classification: resource_processing; purpose: provenance metadata for extracted student resource content.';

comment on column public.resource_extraction_provenance.provenance_id is
  'classification: resource_processing; purpose: stable extraction provenance identifier.';

comment on column public.resource_extraction_provenance.extraction_document_id is
  'classification: resource_processing; purpose: owning extraction document identifier.';

comment on column public.resource_extraction_provenance.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and graph ownership.';

comment on column public.resource_extraction_provenance.resource_id is
  'classification: resources; purpose: source resource identifier.';

comment on column public.resource_extraction_provenance.page_number is
  'classification: resource_processing; purpose: optional page number for page-scoped provenance.';

comment on column public.resource_extraction_provenance.source is
  'classification: resource_processing; purpose: extraction provenance source.';

comment on column public.resource_extraction_provenance.strategy_version is
  'classification: operational; purpose: versioned extraction strategy associated with this provenance.';

comment on column public.resource_extraction_provenance.extracted_at is
  'classification: operational; purpose: timestamp when the provenance source produced extraction output.';

comment on column public.resource_extraction_provenance.notes is
  'classification: resource_processing; purpose: optional provenance notes.';

comment on column public.resource_extraction_provenance.created_at is
  'classification: operational; purpose: row creation timestamp.';

create table public.resource_extracted_pages (
  page_id uuid primary key default gen_random_uuid(),
  extraction_document_id uuid not null,
  student_id uuid not null,
  resource_id uuid not null,
  provenance_id uuid not null,
  page_number integer not null,
  text text not null,
  locator jsonb not null,
  confidence numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_extracted_pages_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,
  constraint resource_extracted_pages_document_fkey foreign key (
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
  constraint resource_extracted_pages_provenance_fkey foreign key (
    student_id,
    extraction_document_id,
    provenance_id
  )
    references public.resource_extraction_provenance (
      student_id,
      extraction_document_id,
      provenance_id
    )
    on delete restrict,
  constraint resource_extracted_pages_page_number_positive_check check (
    page_number > 0
  ),
  constraint resource_extracted_pages_text_not_empty_check check (
    length(trim(text)) > 0
  ),
  constraint resource_extracted_pages_locator_object_check check (
    jsonb_typeof(locator) = 'object'
  ),
  constraint resource_extracted_pages_locator_kind_check check (
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
  constraint resource_extracted_pages_confidence_range_check check (
    confidence is null
    or (
      confidence >= 0
      and confidence <= 1
    )
  ),
  constraint resource_extracted_pages_student_document_page_unique unique (
    student_id,
    extraction_document_id,
    page_number
  )
);

comment on table public.resource_extracted_pages is
  'classification: student_content; purpose: page-level extracted text for student resources.';

comment on column public.resource_extracted_pages.page_id is
  'classification: resource_processing; purpose: stable extracted page identifier.';

comment on column public.resource_extracted_pages.extraction_document_id is
  'classification: resource_processing; purpose: owning extraction document identifier.';

comment on column public.resource_extracted_pages.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and graph ownership.';

comment on column public.resource_extracted_pages.resource_id is
  'classification: resources; purpose: source resource identifier.';

comment on column public.resource_extracted_pages.provenance_id is
  'classification: resource_processing; purpose: provenance record used to produce the extracted page.';

comment on column public.resource_extracted_pages.page_number is
  'classification: resource_processing; purpose: 1-based extracted page number.';

comment on column public.resource_extracted_pages.text is
  'classification: student_content; purpose: extracted page text.';

comment on column public.resource_extracted_pages.locator is
  'classification: resource_processing; purpose: locator metadata back to the original page.';

comment on column public.resource_extracted_pages.confidence is
  'classification: operational; purpose: optional extractor confidence from 0 to 1.';

comment on column public.resource_extracted_pages.created_at is
  'classification: operational; purpose: row creation timestamp.';

comment on column public.resource_extracted_pages.updated_at is
  'classification: operational; purpose: row update timestamp.';

create table public.resource_extraction_failures (
  failure_id uuid primary key default gen_random_uuid(),
  extraction_document_id uuid not null,
  student_id uuid not null,
  resource_id uuid not null,
  provenance_id uuid,
  code text not null,
  page_number integer,
  message text not null,
  created_at timestamptz not null default now(),
  constraint resource_extraction_failures_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,
  constraint resource_extraction_failures_document_fkey foreign key (
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
  constraint resource_extraction_failures_provenance_fkey foreign key (
    student_id,
    extraction_document_id,
    provenance_id
  )
    references public.resource_extraction_provenance (
      student_id,
      extraction_document_id,
      provenance_id
    )
    on delete restrict,
  constraint resource_extraction_failures_code_check check (
    code in (
      'resource_not_processable',
      'storage_object_unavailable',
      'unsupported_mime_type',
      'unsupported_resource_kind',
      'unsupported_page',
      'empty_extraction',
      'extractor_failed'
    )
  ),
  constraint resource_extraction_failures_page_number_positive_check check (
    page_number is null
    or page_number > 0
  ),
  constraint resource_extraction_failures_unsupported_page_number_check check (
    code <> 'unsupported_page'
    or page_number is not null
  ),
  constraint resource_extraction_failures_message_not_empty_check check (
    length(trim(message)) > 0
  )
);

comment on table public.resource_extraction_failures is
  'classification: resource_processing; purpose: extraction failures for student resources, including unsupported-page failures.';

comment on column public.resource_extraction_failures.failure_id is
  'classification: resource_processing; purpose: stable extraction failure identifier.';

comment on column public.resource_extraction_failures.extraction_document_id is
  'classification: resource_processing; purpose: owning extraction document identifier.';

comment on column public.resource_extraction_failures.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and graph ownership.';

comment on column public.resource_extraction_failures.resource_id is
  'classification: resources; purpose: source resource identifier.';

comment on column public.resource_extraction_failures.provenance_id is
  'classification: resource_processing; purpose: optional provenance associated with this failure.';

comment on column public.resource_extraction_failures.code is
  'classification: operational; purpose: extraction failure code.';

comment on column public.resource_extraction_failures.page_number is
  'classification: resource_processing; purpose: optional page number associated with this failure.';

comment on column public.resource_extraction_failures.message is
  'classification: operational; purpose: human-readable extraction failure message.';

comment on column public.resource_extraction_failures.created_at is
  'classification: operational; purpose: row creation timestamp.';

create index resource_extraction_provenance_student_id_idx
  on public.resource_extraction_provenance (student_id);

create index resource_extraction_provenance_document_idx
  on public.resource_extraction_provenance (student_id, extraction_document_id);

create index resource_extraction_provenance_resource_idx
  on public.resource_extraction_provenance (student_id, resource_id);

create index resource_extraction_provenance_page_idx
  on public.resource_extraction_provenance (student_id, extraction_document_id, page_number);

create index resource_extracted_pages_student_id_idx
  on public.resource_extracted_pages (student_id);

create index resource_extracted_pages_resource_idx
  on public.resource_extracted_pages (student_id, resource_id);

create index resource_extracted_pages_document_page_idx
  on public.resource_extracted_pages (student_id, extraction_document_id, page_number);

create index resource_extracted_pages_locator_kind_idx
  on public.resource_extracted_pages ((locator ->> 'kind'));

create index resource_extraction_failures_student_id_idx
  on public.resource_extraction_failures (student_id);

create index resource_extraction_failures_document_idx
  on public.resource_extraction_failures (student_id, extraction_document_id);

create index resource_extraction_failures_resource_idx
  on public.resource_extraction_failures (student_id, resource_id);

create index resource_extraction_failures_code_idx
  on public.resource_extraction_failures (student_id, code);

create index resource_extraction_failures_page_idx
  on public.resource_extraction_failures (student_id, extraction_document_id, page_number);

alter table public.resource_extraction_provenance enable row level security;
alter table public.resource_extraction_provenance force row level security;

alter table public.resource_extracted_pages enable row level security;
alter table public.resource_extracted_pages force row level security;

alter table public.resource_extraction_failures enable row level security;
alter table public.resource_extraction_failures force row level security;

create policy resource_extraction_provenance_select_own
  on public.resource_extraction_provenance
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resource_extracted_pages_select_own
  on public.resource_extracted_pages
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resource_extraction_failures_select_own
  on public.resource_extraction_failures
  for select
  to authenticated
  using (student_id = auth.uid());