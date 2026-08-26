-- Avora resource summary citations.
--
-- Purpose:
-- - Store every resource summary citation as a foreign key to a stored
--   chunk, never as a free-text locator string (NN-11, ENG-168).
-- - Reference public.chunks by (student_id, chunk_id) and public.resources
--   by (student_id, resource_id), mirroring the existing chunk_embeddings
--   precedent (20260824091000_chunk_embeddings.sql) rather than a single
--   three-column composite key — chunks carries no
--   (student_id, resource_id, chunk_id) unique constraint today, only
--   chunks_student_chunk_unique (student_id, chunk_id) added in
--   20260824090000. Citation locality (a citation's chunk must belong to
--   the same resource as its parent summary) is enforced at the AI Gateway
--   citation-resolution layer (packages/ai/gateway/summary/), the same
--   place tutor citation membership is enforced today, and is covered by
--   the summary-grounding eval gate — not by a database constraint, to
--   avoid inventing a chunks-table schema change this group does not own.
--
-- This migration intentionally does not implement summary generation,
-- AI/provider behavior, worker behavior, API routes, UI, or mobile
-- behavior. Stage 12 Group 7 maps to docs/MASTER-ROADMAP.md
-- "Group 7: Resource Summary Generation" (FR-070).

create table public.resource_summary_citations (
  resource_summary_citation_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (student_id) on delete cascade,
  resource_summary_id uuid not null references public.resource_summaries (resource_summary_id) on delete cascade,
  resource_id uuid not null,
  chunk_id uuid not null,
  quote text not null,
  created_at timestamptz not null default now(),
  constraint resource_summary_citations_quote_check check (
    length(quote) > 0
  ),
  constraint resource_summary_citations_resource_fkey
    foreign key (student_id, resource_id)
    references public.resources (student_id, resource_id)
    on delete cascade,
  constraint resource_summary_citations_chunk_fkey
    foreign key (student_id, chunk_id)
    references public.chunks (student_id, chunk_id)
    on delete cascade
);

comment on table public.resource_summary_citations is
  'notes: derived_artifact; purpose: machine-resolved citations linking a resource summary to the specific chunks it was grounded in (NN-11).';

comment on column public.resource_summary_citations.resource_summary_citation_id is
  'notes: operational; purpose: stable identifier for this citation row.';

comment on column public.resource_summary_citations.student_id is
  'notes: identity; purpose: owning student identifier used for RLS and ownership.';

comment on column public.resource_summary_citations.resource_summary_id is
  'notes: derived_artifact; purpose: parent summary this citation belongs to.';

comment on column public.resource_summary_citations.resource_id is
  'notes: academic_content; purpose: source resource, redundant with resource_summaries.resource_id; citation locality against this value is enforced at the AI Gateway citation-resolution layer, not by a database constraint.';

comment on column public.resource_summary_citations.chunk_id is
  'notes: derived_artifact; purpose: foreign key to the exact chunk this citation quotes (NN-11).';

comment on column public.resource_summary_citations.quote is
  'notes: derived_artifact; purpose: verbatim quote from the cited chunk.';

comment on column public.resource_summary_citations.created_at is
  'notes: operational; purpose: row audit timestamp.';

create index resource_summary_citations_student_id_idx
  on public.resource_summary_citations (student_id);

create index resource_summary_citations_resource_summary_id_idx
  on public.resource_summary_citations (resource_summary_id);

create index resource_summary_citations_chunk_id_idx
  on public.resource_summary_citations (chunk_id);

alter table public.resource_summary_citations enable row level security;
alter table public.resource_summary_citations force row level security;

create policy resource_summary_citations_select_own
  on public.resource_summary_citations
  for select
  to authenticated
  using (student_id = auth.uid());
