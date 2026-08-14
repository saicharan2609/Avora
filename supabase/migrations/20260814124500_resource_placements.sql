-- Avora resource placement persistence.
--
-- Purpose:
-- - Persist accepted/tentative resource placement decisions.
-- - Persist placement correction history.
-- - Preserve strict student-scoped ownership through RLS and composite foreign keys.
--
-- This migration intentionally does not implement classification workers,
-- placement services, placement APIs, correction e2e, extraction work,
-- retrieval behavior, AI/provider behavior, route handlers, UI, or mobile code.

create extension if not exists pgcrypto with schema extensions;

create table public.resource_placements (
  placement_id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  resource_id uuid not null,
  term_id uuid not null,
  subject_id uuid not null,
  structure_unit_id uuid,
  confidence_level text not null,
  confidence_source text not null,
  confidence_reason text,
  status text not null,
  candidate_id uuid,
  candidate_provenance text,
  placement_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint resource_placements_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,

  constraint resource_placements_resource_fkey foreign key (student_id, resource_id)
    references public.resources (student_id, resource_id)
    on delete cascade,

  constraint resource_placements_term_fkey foreign key (student_id, term_id)
    references public.academic_terms (student_id, term_id)
    on delete restrict,

  constraint resource_placements_subject_fkey foreign key (student_id, term_id, subject_id)
    references public.subjects (student_id, term_id, subject_id)
    on delete restrict,

  constraint resource_placements_structure_unit_fkey foreign key (student_id, structure_unit_id)
    references public.structure_units (student_id, structure_unit_id)
    on delete restrict,

  constraint resource_placements_student_resource_unique unique (
    student_id,
    resource_id
  ),

  constraint resource_placements_confidence_level_check check (
    confidence_level in ('student_confirmed', 'high', 'medium', 'low', 'unknown')
  ),

  constraint resource_placements_confidence_source_check check (
    confidence_source in ('student', 'imported', 'system_suggested')
  ),

  constraint resource_placements_status_check check (
    status in ('accepted', 'tentative')
  ),

  constraint resource_placements_candidate_provenance_check check (
    candidate_provenance is null
    or candidate_provenance in (
      'resource_metadata',
      'resource_content',
      'student_declared',
      'imported'
    )
  ),

  constraint resource_placements_candidate_metadata_consistent_check check (
    (
      candidate_id is null
      and candidate_provenance is null
    )
    or (
      candidate_id is not null
      and candidate_provenance is not null
    )
  ),

  constraint resource_placements_confidence_reason_not_blank_check check (
    confidence_reason is null
    or length(trim(confidence_reason)) > 0
  ),

  constraint resource_placements_placement_reason_not_blank_check check (
    placement_reason is null
    or length(trim(placement_reason)) > 0
  )
);

comment on table public.resource_placements is
  'classification: academic_content; purpose: student-owned accepted or tentative placement of a resource into the academic graph.';

comment on column public.resource_placements.placement_id is
  'classification: operational; purpose: stable resource placement identifier.';

comment on column public.resource_placements.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and placement ownership.';

comment on column public.resource_placements.resource_id is
  'classification: academic_content; purpose: resource being placed.';

comment on column public.resource_placements.term_id is
  'classification: academic_structure; purpose: academic term target for resource placement.';

comment on column public.resource_placements.subject_id is
  'classification: academic_structure; purpose: subject target for resource placement.';

comment on column public.resource_placements.structure_unit_id is
  'classification: academic_structure; purpose: optional structure unit target for resource placement.';

comment on column public.resource_placements.confidence_level is
  'classification: operational; purpose: confidence level associated with the placement.';

comment on column public.resource_placements.confidence_source is
  'classification: operational; purpose: source of placement confidence.';

comment on column public.resource_placements.confidence_reason is
  'classification: operational; purpose: optional human-readable confidence reason.';

comment on column public.resource_placements.status is
  'classification: operational; purpose: accepted or tentative placement state.';

comment on column public.resource_placements.candidate_id is
  'classification: operational; purpose: optional placement candidate identifier that produced this placement.';

comment on column public.resource_placements.candidate_provenance is
  'classification: operational; purpose: optional provenance for the placement candidate that produced this placement.';

comment on column public.resource_placements.placement_reason is
  'classification: operational; purpose: optional deterministic policy or correction reason.';

comment on column public.resource_placements.created_at is
  'classification: operational; purpose: row creation timestamp.';

comment on column public.resource_placements.updated_at is
  'classification: operational; purpose: row update timestamp.';

create table public.resource_placement_corrections (
  correction_id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  resource_id uuid not null,
  previous_term_id uuid,
  previous_subject_id uuid,
  previous_structure_unit_id uuid,
  corrected_term_id uuid not null,
  corrected_subject_id uuid not null,
  corrected_structure_unit_id uuid,
  reason text,
  corrected_at timestamptz not null default now(),

  constraint resource_placement_corrections_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,

  constraint resource_placement_corrections_resource_fkey foreign key (student_id, resource_id)
    references public.resources (student_id, resource_id)
    on delete cascade,

  constraint resource_placement_corrections_previous_term_fkey foreign key (student_id, previous_term_id)
    references public.academic_terms (student_id, term_id)
    on delete restrict,

  constraint resource_placement_corrections_previous_subject_fkey foreign key (
    student_id,
    previous_term_id,
    previous_subject_id
  )
    references public.subjects (student_id, term_id, subject_id)
    on delete restrict,

  constraint resource_placement_corrections_previous_structure_unit_fkey foreign key (
    student_id,
    previous_structure_unit_id
  )
    references public.structure_units (student_id, structure_unit_id)
    on delete restrict,

  constraint resource_placement_corrections_corrected_term_fkey foreign key (student_id, corrected_term_id)
    references public.academic_terms (student_id, term_id)
    on delete restrict,

  constraint resource_placement_corrections_corrected_subject_fkey foreign key (
    student_id,
    corrected_term_id,
    corrected_subject_id
  )
    references public.subjects (student_id, term_id, subject_id)
    on delete restrict,

  constraint resource_placement_corrections_corrected_structure_unit_fkey foreign key (
    student_id,
    corrected_structure_unit_id
  )
    references public.structure_units (student_id, structure_unit_id)
    on delete restrict,

  constraint resource_placement_corrections_previous_target_complete_check check (
    (
      previous_term_id is null
      and previous_subject_id is null
      and previous_structure_unit_id is null
    )
    or (
      previous_term_id is not null
      and previous_subject_id is not null
    )
  ),

  constraint resource_placement_corrections_reason_not_blank_check check (
    reason is null
    or length(trim(reason)) > 0
  )
);

comment on table public.resource_placement_corrections is
  'classification: academic_content; purpose: append-only student-owned correction history for resource placement.';

comment on column public.resource_placement_corrections.correction_id is
  'classification: operational; purpose: stable placement correction identifier.';

comment on column public.resource_placement_corrections.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and correction ownership.';

comment on column public.resource_placement_corrections.resource_id is
  'classification: academic_content; purpose: resource whose placement was corrected.';

comment on column public.resource_placement_corrections.previous_term_id is
  'classification: academic_structure; purpose: previous term target before correction.';

comment on column public.resource_placement_corrections.previous_subject_id is
  'classification: academic_structure; purpose: previous subject target before correction.';

comment on column public.resource_placement_corrections.previous_structure_unit_id is
  'classification: academic_structure; purpose: previous structure unit target before correction.';

comment on column public.resource_placement_corrections.corrected_term_id is
  'classification: academic_structure; purpose: corrected term target.';

comment on column public.resource_placement_corrections.corrected_subject_id is
  'classification: academic_structure; purpose: corrected subject target.';

comment on column public.resource_placement_corrections.corrected_structure_unit_id is
  'classification: academic_structure; purpose: corrected optional structure unit target.';

comment on column public.resource_placement_corrections.reason is
  'classification: operational; purpose: optional student-visible correction reason.';

comment on column public.resource_placement_corrections.corrected_at is
  'classification: operational; purpose: correction timestamp.';

create index resource_placements_student_id_idx
  on public.resource_placements (student_id);

create index resource_placements_resource_id_idx
  on public.resource_placements (resource_id);

create index resource_placements_student_scope_idx
  on public.resource_placements (
    student_id,
    term_id,
    subject_id,
    structure_unit_id
  );

create index resource_placements_student_status_idx
  on public.resource_placements (student_id, status);

create index resource_placement_corrections_student_id_idx
  on public.resource_placement_corrections (student_id);

create index resource_placement_corrections_resource_id_idx
  on public.resource_placement_corrections (resource_id);

create index resource_placement_corrections_student_resource_corrected_idx
  on public.resource_placement_corrections (
    student_id,
    resource_id,
    corrected_at desc
  );

alter table public.resource_placements enable row level security;
alter table public.resource_placements force row level security;

alter table public.resource_placement_corrections enable row level security;
alter table public.resource_placement_corrections force row level security;

create policy resource_placements_select_own
  on public.resource_placements
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resource_placements_insert_own
  on public.resource_placements
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy resource_placements_update_own
  on public.resource_placements
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy resource_placement_corrections_select_own
  on public.resource_placement_corrections
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resource_placement_corrections_insert_own
  on public.resource_placement_corrections
  for insert
  to authenticated
  with check (student_id = auth.uid());