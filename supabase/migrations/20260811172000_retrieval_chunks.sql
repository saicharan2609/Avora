-- Avora retrieval chunks.
--
-- Purpose:
-- - Persist locator-preserving, strategy-versioned retrieval chunks.
-- - Preserve strict student-scoped ownership through RLS and composite foreign keys.
-- - Provide a concrete chunks table for later citation-bearing relations.
--
-- This migration intentionally does not implement repositories, embeddings,
-- vector search, keyword search, hybrid search, AI Gateway citation verification,
-- worker execution, route handlers, UI, mobile behavior, or e2e flows.

create extension if not exists pgcrypto with schema extensions;

create table public.chunks (
  chunk_id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  resource_id uuid not null,
  extraction_document_id uuid not null,
  source_block_ids uuid[] not null,
  term_id uuid,
  subject_id uuid,
  structure_unit_id uuid,
  content_kind text not null,
  text text not null,
  token_estimate integer not null,
  sanitisation_status text not null,
  sanitisation_strategy_version text not null,
  sanitisation_warnings jsonb not null default '[]'::jsonb,
  locator jsonb not null,
  source_content_hash text not null,
  chunking_strategy_version text not null,
  status text not null default 'ready',
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chunks_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,
  constraint chunks_resource_fkey foreign key (student_id, resource_id)
    references public.resources (student_id, resource_id)
    on delete cascade,
  constraint chunks_extraction_document_fkey foreign key (
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
  constraint chunks_term_fkey foreign key (student_id, term_id)
    references public.academic_terms (student_id, term_id)
    on delete set null,
  constraint chunks_subject_fkey foreign key (student_id, term_id, subject_id)
    references public.subjects (student_id, term_id, subject_id)
    on delete set null,
  constraint chunks_structure_unit_fkey foreign key (student_id, structure_unit_id)
    references public.structure_units (student_id, structure_unit_id)
    on delete set null,
  constraint chunks_source_block_ids_not_empty_check check (
    cardinality(source_block_ids) > 0
  ),
  constraint chunks_content_kind_check check (
    content_kind in (
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
      'mixed',
      'unknown'
    )
  ),
  constraint chunks_text_not_empty_check check (
    length(trim(text)) > 0
  ),
  constraint chunks_token_estimate_non_negative_check check (
    token_estimate >= 0
  ),
  constraint chunks_sanitisation_status_check check (
    sanitisation_status in (
      'sanitised',
      'sanitised_with_warnings'
    )
  ),
  constraint chunks_sanitisation_strategy_version_check check (
    length(trim(sanitisation_strategy_version)) > 0
  ),
  constraint chunks_sanitisation_warnings_array_check check (
    jsonb_typeof(sanitisation_warnings) = 'array'
  ),
  constraint chunks_locator_object_check check (
    jsonb_typeof(locator) = 'object'
  ),
  constraint chunks_locator_kind_check check (
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
  constraint chunks_source_content_hash_check check (
    length(trim(source_content_hash)) > 0
  ),
  constraint chunks_chunking_strategy_version_check check (
    length(trim(chunking_strategy_version)) > 0
  ),
  constraint chunks_status_check check (
    status in (
      'ready',
      'superseded',
      'deleted'
    )
  ),
  constraint chunks_sort_order_non_negative_check check (
    sort_order >= 0
  )
);

comment on table public.chunks is
  'classification: derived_artifact; purpose: locator-preserving retrieval chunks generated from extracted student resources.';

comment on column public.chunks.chunk_id is
  'classification: derived_artifact; purpose: stable retrieval chunk identifier used for retrieval and citation resolution.';

comment on column public.chunks.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and retrieval pre-filtering.';

comment on column public.chunks.resource_id is
  'classification: academic_content; purpose: source resource identifier for retrieval and citation display.';

comment on column public.chunks.extraction_document_id is
  'classification: derived_artifact; purpose: source extraction document that produced this chunk.';

comment on column public.chunks.source_block_ids is
  'classification: derived_artifact; purpose: extracted content block identifiers used to create this chunk.';

comment on column public.chunks.term_id is
  'classification: academic_content; purpose: optional academic term scope facet for retrieval pre-filtering.';

comment on column public.chunks.subject_id is
  'classification: academic_content; purpose: optional subject scope facet for retrieval pre-filtering.';

comment on column public.chunks.structure_unit_id is
  'classification: academic_content; purpose: optional structure unit scope facet for retrieval pre-filtering.';

comment on column public.chunks.content_kind is
  'classification: derived_artifact; purpose: semantic chunk content kind preserved from extraction/chunking.';

comment on column public.chunks.text is
  'classification: academic_content; purpose: sanitised student-owned chunk text used for retrieval.';

comment on column public.chunks.token_estimate is
  'classification: operational; purpose: approximate token count for retrieval budget fitting.';

comment on column public.chunks.sanitisation_status is
  'classification: operational; purpose: status of prompt-injection sanitisation applied when chunk was created.';

comment on column public.chunks.sanitisation_strategy_version is
  'classification: operational; purpose: version of sanitisation strategy applied to this chunk.';

comment on column public.chunks.sanitisation_warnings is
  'classification: operational; purpose: structured sanitisation warnings for audit and backfill decisions.';

comment on column public.chunks.locator is
  'classification: derived_artifact; purpose: precise source locator used for citation resolution and deep-linking.';

comment on column public.chunks.source_content_hash is
  'classification: operational; purpose: source content hash used for deterministic regeneration and stale chunk detection.';

comment on column public.chunks.chunking_strategy_version is
  'classification: operational; purpose: versioned chunking strategy used for controlled backfills.';

comment on column public.chunks.status is
  'classification: operational; purpose: chunk lifecycle status for supersession and deletion handling.';

comment on column public.chunks.sort_order is
  'classification: operational; purpose: deterministic ordering within a source resource or extraction document.';

comment on column public.chunks.created_at is
  'classification: operational; purpose: row creation timestamp.';

comment on column public.chunks.updated_at is
  'classification: operational; purpose: row update timestamp.';

create index chunks_student_id_idx
  on public.chunks (student_id);

create index chunks_resource_id_idx
  on public.chunks (resource_id);

create index chunks_student_resource_idx
  on public.chunks (student_id, resource_id);

create index chunks_student_term_idx
  on public.chunks (student_id, term_id);

create index chunks_student_subject_idx
  on public.chunks (student_id, subject_id);

create index chunks_student_structure_unit_idx
  on public.chunks (student_id, structure_unit_id);

create index chunks_student_status_idx
  on public.chunks (student_id, status);

create index chunks_student_scope_ready_idx
  on public.chunks (
    student_id,
    term_id,
    subject_id,
    structure_unit_id,
    resource_id,
    status
  );

create index chunks_extraction_document_idx
  on public.chunks (extraction_document_id);

create index chunks_locator_kind_idx
  on public.chunks ((locator ->> 'kind'));

create index chunks_chunking_strategy_version_idx
  on public.chunks (chunking_strategy_version);

alter table public.chunks enable row level security;
alter table public.chunks force row level security;

create policy chunks_select_own
  on public.chunks
  for select
  to authenticated
  using (student_id = auth.uid());