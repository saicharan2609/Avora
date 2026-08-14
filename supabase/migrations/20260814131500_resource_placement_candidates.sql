-- Avora resource placement candidate persistence.
--
-- Purpose:
-- - Persist server-generated placement candidates before acceptance.
-- - Allow later API routes to read placement candidates and accept an existing
--   candidate by candidate_id without trusting client-supplied candidate data.
-- - Preserve strict student-scoped ownership through RLS and composite FKs.
--
-- This migration intentionally does not implement web routes, API contracts,
-- classification execution, workers, AI/provider behavior, retrieval behavior,
-- UI, mobile code, or Stage 11 tutor behavior.

create extension if not exists pgcrypto with schema extensions;

create table public.resource_placement_candidates (
  candidate_id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  resource_id uuid not null,
  term_id uuid not null,
  subject_id uuid not null,
  structure_unit_id uuid,
  confidence_level text not null,
  confidence_source text not null,
  confidence_reason text,
  provenance text not null,
  reason text,
  created_at timestamptz not null default now(),

  constraint resource_placement_candidates_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,

  constraint resource_placement_candidates_resource_fkey foreign key (student_id, resource_id)
    references public.resources (student_id, resource_id)
    on delete cascade,

  constraint resource_placement_candidates_term_fkey foreign key (student_id, term_id)
    references public.academic_terms (student_id, term_id)
    on delete restrict,

  constraint resource_placement_candidates_subject_fkey foreign key (student_id, term_id, subject_id)
    references public.subjects (student_id, term_id, subject_id)
    on delete restrict,

  constraint resource_placement_candidates_structure_unit_fkey foreign key (
    student_id,
    structure_unit_id
  )
    references public.structure_units (student_id, structure_unit_id)
    on delete restrict,

  constraint resource_placement_candidates_student_candidate_unique unique (
    student_id,
    candidate_id
  ),

  constraint resource_placement_candidates_confidence_level_check check (
    confidence_level in ('student_confirmed', 'high', 'medium', 'low', 'unknown')
  ),

  constraint resource_placement_candidates_confidence_source_check check (
    confidence_source in ('student', 'imported', 'system_suggested')
  ),

  constraint resource_placement_candidates_provenance_check check (
    provenance in (
      'resource_metadata',
      'resource_content',
      'student_declared',
      'imported'
    )
  ),

  constraint resource_placement_candidates_confidence_reason_not_blank_check check (
    confidence_reason is null
    or length(trim(confidence_reason)) > 0
  ),

  constraint resource_placement_candidates_reason_not_blank_check check (
    reason is null
    or length(trim(reason)) > 0
  )
);

comment on table public.resource_placement_candidates is
  'classification: academic_content; purpose: student-owned server-generated candidate placement targets for resources before acceptance.';

comment on column public.resource_placement_candidates.candidate_id is
  'classification: operational; purpose: stable placement candidate identifier used for server-side candidate acceptance.';

comment on column public.resource_placement_candidates.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and candidate ownership.';

comment on column public.resource_placement_candidates.resource_id is
  'classification: academic_content; purpose: resource being proposed for placement.';

comment on column public.resource_placement_candidates.term_id is
  'classification: academic_structure; purpose: proposed academic term target.';

comment on column public.resource_placement_candidates.subject_id is
  'classification: academic_structure; purpose: proposed subject target.';

comment on column public.resource_placement_candidates.structure_unit_id is
  'classification: academic_structure; purpose: optional proposed structure unit target.';

comment on column public.resource_placement_candidates.confidence_level is
  'classification: operational; purpose: candidate confidence level.';

comment on column public.resource_placement_candidates.confidence_source is
  'classification: operational; purpose: source of candidate confidence.';

comment on column public.resource_placement_candidates.confidence_reason is
  'classification: operational; purpose: optional human-readable confidence reason.';

comment on column public.resource_placement_candidates.provenance is
  'classification: operational; purpose: source evidence category that produced the placement candidate.';

comment on column public.resource_placement_candidates.reason is
  'classification: operational; purpose: optional human-readable candidate reason.';

comment on column public.resource_placement_candidates.created_at is
  'classification: operational; purpose: candidate creation timestamp.';

create index resource_placement_candidates_student_id_idx
  on public.resource_placement_candidates (student_id);

create index resource_placement_candidates_student_resource_idx
  on public.resource_placement_candidates (
    student_id,
    resource_id,
    created_at desc
  );

create index resource_placement_candidates_student_scope_idx
  on public.resource_placement_candidates (
    student_id,
    term_id,
    subject_id,
    structure_unit_id
  );

alter table public.resource_placement_candidates enable row level security;
alter table public.resource_placement_candidates force row level security;

create policy resource_placement_candidates_select_own
  on public.resource_placement_candidates
  for select
  to authenticated
  using (student_id = auth.uid());