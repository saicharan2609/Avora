-- Extend academic_terms with programme and branch capture (FR-010).
--
-- Free-text fields only, mirroring institution_name exactly:
-- no institution/programme/branch library, no lookup table, no foreign key.

alter table public.academic_terms
  add column programme_name text,
  add column branch_name text;

comment on column public.academic_terms.programme_name is
  'classification: academic_structure; purpose: optional student-provided programme label for the term.';

comment on column public.academic_terms.branch_name is
  'classification: academic_structure; purpose: optional student-provided branch label for the term.';
