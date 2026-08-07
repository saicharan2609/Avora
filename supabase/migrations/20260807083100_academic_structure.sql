-- Avora academic structure graph.
--
-- Purpose:
-- - Persist student-owned academic terms.
-- - Persist subjects inside academic terms.
-- - Persist recursive structure units inside subjects.
-- - Preserve strict student-scoped ownership through RLS and composite foreign keys.
--
-- This migration intentionally does not implement repositories, route handlers,
-- setup services, UI, mobile behavior, AI behavior, retrieval behavior,
-- worker behavior, or tests.

create extension if not exists pgcrypto with schema extensions;

create table public.academic_terms (
  term_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (student_id) on delete cascade,
  label text not null,
  institution_name text,
  starts_on date,
  ends_on date,
  lifecycle_state text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_terms_label_not_empty_check check (
    length(trim(label)) > 0
  ),
  constraint academic_terms_lifecycle_state_check check (
    lifecycle_state in ('planned', 'active', 'completed', 'archived')
  ),
  constraint academic_terms_date_order_check check (
    starts_on is null
    or ends_on is null
    or starts_on <= ends_on
  ),
  constraint academic_terms_student_term_unique unique (student_id, term_id)
);

comment on table public.academic_terms is
  'classification: academic_structure; purpose: student-owned academic terms such as semesters, trimesters, school years, or custom study periods.';

comment on column public.academic_terms.term_id is
  'classification: academic_structure; purpose: stable academic term identifier.';

comment on column public.academic_terms.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and graph ownership.';

comment on column public.academic_terms.label is
  'classification: academic_structure; purpose: student-visible academic term label.';

comment on column public.academic_terms.institution_name is
  'classification: academic_structure; purpose: optional student-provided institution label for the term.';

comment on column public.academic_terms.starts_on is
  'classification: academic_structure; purpose: optional term start date.';

comment on column public.academic_terms.ends_on is
  'classification: academic_structure; purpose: optional term end date.';

comment on column public.academic_terms.lifecycle_state is
  'classification: operational; purpose: lifecycle state of the academic term.';

comment on column public.academic_terms.created_at is
  'classification: operational; purpose: row creation timestamp.';

comment on column public.academic_terms.updated_at is
  'classification: operational; purpose: row update timestamp.';

create table public.subjects (
  subject_id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  term_id uuid not null,
  display_name text not null,
  subject_code text,
  description text,
  lifecycle_state text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,
  constraint subjects_term_fkey foreign key (student_id, term_id)
    references public.academic_terms (student_id, term_id)
    on delete cascade,
  constraint subjects_display_name_not_empty_check check (
    length(trim(display_name)) > 0
  ),
  constraint subjects_lifecycle_state_check check (
    lifecycle_state in ('active', 'archived')
  ),
  constraint subjects_student_subject_unique unique (student_id, subject_id),
  constraint subjects_student_term_subject_unique unique (student_id, term_id, subject_id)
);

comment on table public.subjects is
  'classification: academic_structure; purpose: student-owned subjects inside an academic term.';

comment on column public.subjects.subject_id is
  'classification: academic_structure; purpose: stable subject identifier.';

comment on column public.subjects.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and graph ownership.';

comment on column public.subjects.term_id is
  'classification: academic_structure; purpose: owning academic term identifier.';

comment on column public.subjects.display_name is
  'classification: academic_structure; purpose: student-visible subject name.';

comment on column public.subjects.subject_code is
  'classification: academic_structure; purpose: optional student-provided or institution-provided subject code.';

comment on column public.subjects.description is
  'classification: academic_structure; purpose: optional student-visible subject description.';

comment on column public.subjects.lifecycle_state is
  'classification: operational; purpose: lifecycle state of the subject.';

comment on column public.subjects.created_at is
  'classification: operational; purpose: row creation timestamp.';

comment on column public.subjects.updated_at is
  'classification: operational; purpose: row update timestamp.';

create table public.structure_units (
  structure_unit_id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  term_id uuid not null,
  subject_id uuid not null,
  parent_unit_id uuid,
  title text not null,
  description text,
  unit_kind text not null,
  source text not null default 'student_declared',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint structure_units_student_fkey foreign key (student_id)
    references public.students (student_id)
    on delete cascade,
  constraint structure_units_term_fkey foreign key (student_id, term_id)
    references public.academic_terms (student_id, term_id)
    on delete cascade,
  constraint structure_units_subject_fkey foreign key (student_id, term_id, subject_id)
    references public.subjects (student_id, term_id, subject_id)
    on delete cascade,
  constraint structure_units_parent_fkey foreign key (student_id, parent_unit_id)
    references public.structure_units (student_id, structure_unit_id)
    on delete cascade,
  constraint structure_units_title_not_empty_check check (
    length(trim(title)) > 0
  ),
  constraint structure_units_unit_kind_check check (
    unit_kind in (
      'module',
      'topic',
      'week',
      'lecture',
      'assignment_group',
      'exam_area',
      'custom'
    )
  ),
  constraint structure_units_source_check check (
    source in ('student_declared', 'imported', 'system_suggested')
  ),
  constraint structure_units_sort_order_non_negative_check check (
    sort_order >= 0
  ),
  constraint structure_units_not_own_parent_check check (
    parent_unit_id is null
    or parent_unit_id <> structure_unit_id
  ),
  constraint structure_units_student_unit_unique unique (student_id, structure_unit_id)
);

comment on table public.structure_units is
  'classification: academic_structure; purpose: recursive student-owned academic structure units inside subjects.';

comment on column public.structure_units.structure_unit_id is
  'classification: academic_structure; purpose: stable structure unit identifier.';

comment on column public.structure_units.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and graph ownership.';

comment on column public.structure_units.term_id is
  'classification: academic_structure; purpose: owning academic term identifier.';

comment on column public.structure_units.subject_id is
  'classification: academic_structure; purpose: owning subject identifier.';

comment on column public.structure_units.parent_unit_id is
  'classification: academic_structure; purpose: optional parent structure unit for recursive academic structure.';

comment on column public.structure_units.title is
  'classification: academic_structure; purpose: student-visible structure unit title.';

comment on column public.structure_units.description is
  'classification: academic_structure; purpose: optional student-visible structure unit description.';

comment on column public.structure_units.unit_kind is
  'classification: academic_structure; purpose: semantic kind of the structure unit.';

comment on column public.structure_units.source is
  'classification: operational; purpose: source that created or suggested the structure unit.';

comment on column public.structure_units.sort_order is
  'classification: operational; purpose: student-visible ordering within a parent or subject.';

comment on column public.structure_units.created_at is
  'classification: operational; purpose: row creation timestamp.';

comment on column public.structure_units.updated_at is
  'classification: operational; purpose: row update timestamp.';

create index academic_terms_student_id_idx
  on public.academic_terms (student_id);

create index academic_terms_student_lifecycle_idx
  on public.academic_terms (student_id, lifecycle_state);

create index subjects_student_id_idx
  on public.subjects (student_id);

create index subjects_term_id_idx
  on public.subjects (term_id);

create index subjects_student_term_idx
  on public.subjects (student_id, term_id);

create index subjects_student_lifecycle_idx
  on public.subjects (student_id, lifecycle_state);

create index structure_units_student_id_idx
  on public.structure_units (student_id);

create index structure_units_term_id_idx
  on public.structure_units (term_id);

create index structure_units_subject_id_idx
  on public.structure_units (subject_id);

create index structure_units_parent_unit_id_idx
  on public.structure_units (parent_unit_id);

create index structure_units_student_subject_parent_sort_idx
  on public.structure_units (student_id, subject_id, parent_unit_id, sort_order);

alter table public.academic_terms enable row level security;
alter table public.academic_terms force row level security;

alter table public.subjects enable row level security;
alter table public.subjects force row level security;

alter table public.structure_units enable row level security;
alter table public.structure_units force row level security;

create policy academic_terms_select_own
  on public.academic_terms
  for select
  to authenticated
  using (student_id = auth.uid());

create policy academic_terms_insert_own
  on public.academic_terms
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy academic_terms_update_own
  on public.academic_terms
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy subjects_select_own
  on public.subjects
  for select
  to authenticated
  using (student_id = auth.uid());

create policy subjects_insert_own
  on public.subjects
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy subjects_update_own
  on public.subjects
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy structure_units_select_own
  on public.structure_units
  for select
  to authenticated
  using (student_id = auth.uid());

create policy structure_units_insert_own
  on public.structure_units
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy structure_units_update_own
  on public.structure_units
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());