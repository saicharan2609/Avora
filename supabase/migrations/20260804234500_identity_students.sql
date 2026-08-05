-- Avora identity persistence baseline.
--
-- Purpose:
-- - Introduce the durable student identity row.
-- - Keep identity decoupled from institution, programme, branch, and term.
-- - Establish the first student-scoped RLS table.
--
-- This migration intentionally does not implement authentication flows,
-- onboarding, enrolment, academic setup, subscriptions, deletion cascades,
-- or application APIs.

create table public.students (
  student_id uuid primary key references auth.users (id) on delete restrict,
  display_name text,
  lifecycle_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_lifecycle_status_check check (
    lifecycle_status in ('active', 'pending_deletion', 'deleted')
  )
);

comment on table public.students is
  'classification: identity; purpose: durable Avora student identity row decoupled from institution and term.';

comment on column public.students.student_id is
  'classification: identity; purpose: stable student identity derived from the verified auth session; never supplied by request body.';

comment on column public.students.display_name is
  'classification: identity; purpose: student-controlled display name for account and shell UI only.';

comment on column public.students.lifecycle_status is
  'classification: operational; purpose: account lifecycle state for access and deletion orchestration.';

comment on column public.students.created_at is
  'classification: operational; purpose: account lifecycle audit timestamp.';

comment on column public.students.updated_at is
  'classification: operational; purpose: account lifecycle audit timestamp.';

create index students_lifecycle_status_idx
  on public.students (lifecycle_status);

alter table public.students enable row level security;
alter table public.students force row level security;

create policy students_select_own
  on public.students
  for select
  to authenticated
  using (student_id = auth.uid());

create policy students_insert_own
  on public.students
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy students_update_own
  on public.students
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());