-- Avora resource summaries.
--
-- Purpose:
-- - Persist automatically generated, per-resource summaries (FR-070), one
--   row per (student, resource, prompt version, summary strategy version)
--   so a superseding prompt/strategy version creates a new row rather than
--   overwriting a prior one (NN-06, ENG-165 — derived artifacts are
--   versioned and regenerable, never destructively overwritten).
-- - Preserve student-scoped ownership and deny-by-default RLS (NN-04).
-- - Carry provenance so every summary is labelled AI-generated at
--   presentation (NN-07).
-- - Stamp provenance, model version, and prompt version at persistence for
--   every AI output (ENG-235).
--
-- This migration intentionally does not implement citation storage (see
-- 20260826111000_resource_summary_citations.sql), job queueing (see
-- 20260826112000_resource_summary_jobs.sql), AI/provider behavior, worker
-- behavior, API routes, UI, or mobile behavior. Stage 12 Group 7 maps to
-- docs/MASTER-ROADMAP.md "Group 7: Resource Summary Generation" (FR-070).

create table public.resource_summaries (
  resource_summary_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (student_id) on delete cascade,
  resource_id uuid not null references public.resources (resource_id) on delete cascade,
  prompt_version text not null,
  summary_strategy_version text not null,
  model_version text not null,
  body jsonb not null,
  provenance text not null default 'ai',
  created_at timestamptz not null default now(),
  constraint resource_summaries_provenance_check check (
    provenance = 'ai'
  ),
  constraint resource_summaries_body_object_check check (
    jsonb_typeof(body) = 'object'
  ),
  constraint resource_summaries_body_headings_check check (
    jsonb_typeof(body -> 'headings') = 'array'
    and jsonb_array_length(body -> 'headings') > 0
  ),
  constraint resource_summaries_prompt_version_check check (
    length(prompt_version) > 0
  ),
  constraint resource_summaries_summary_strategy_version_check check (
    length(summary_strategy_version) > 0
  ),
  constraint resource_summaries_model_version_check check (
    length(model_version) > 0
  )
);

comment on table public.resource_summaries is
  'notes: derived_artifact; purpose: automatically generated, per-resource summaries (FR-070), regenerable and versioned by prompt/strategy version, never overwritten in place.';

comment on column public.resource_summaries.resource_summary_id is
  'notes: operational; purpose: stable identifier for this summary version.';

comment on column public.resource_summaries.student_id is
  'notes: identity; purpose: owning student identifier used for RLS and ownership.';

comment on column public.resource_summaries.resource_id is
  'notes: academic_content; purpose: source resource this summary was generated from.';

comment on column public.resource_summaries.prompt_version is
  'notes: operational; purpose: versioned prompt asset identity used to generate this summary (ENG-166).';

comment on column public.resource_summaries.summary_strategy_version is
  'notes: operational; purpose: versioned summary generation strategy identity (ENG-165).';

comment on column public.resource_summaries.model_version is
  'notes: operational; purpose: concrete AI provider model identifier that produced this summary (e.g. gemini-3.6-flash), stamped at persistence per ENG-235.';

comment on column public.resource_summaries.body is
  'notes: derived_artifact; purpose: structured summary content (headings and points), never raw model chain-of-thought.';

comment on column public.resource_summaries.provenance is
  'notes: derived_artifact; purpose: content provenance, always ai for this table (NN-07); student and co_created notes are a distinct, later artifact (FR-071).';

comment on column public.resource_summaries.created_at is
  'notes: operational; purpose: row audit timestamp.';

create unique index resource_summaries_student_resource_version_uniq
  on public.resource_summaries (student_id, resource_id, prompt_version, summary_strategy_version);

create index resource_summaries_student_id_idx
  on public.resource_summaries (student_id);

create index resource_summaries_resource_id_idx
  on public.resource_summaries (resource_id);

create index resource_summaries_student_resource_idx
  on public.resource_summaries (student_id, resource_id);

alter table public.resource_summaries enable row level security;
alter table public.resource_summaries force row level security;

create policy resource_summaries_select_own
  on public.resource_summaries
  for select
  to authenticated
  using (student_id = auth.uid());
