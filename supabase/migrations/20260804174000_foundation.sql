-- Avora database foundation.
--
-- Purpose:
-- - Establish baseline database posture before the first application table.
-- - Keep Stage 6 Group 1 free of feature schema.
--
-- This migration intentionally creates no student-scoped application tables.
-- Every future student-scoped table must enable RLS and add negative-authorisation
-- harness coverage in the same change.

create schema if not exists app_private;

comment on schema public is
  'Public application schema. Student-scoped tables require deny-by-default RLS and reviewed policies.';

comment on schema app_private is
  'Private application schema for database-owned implementation details. No secrets are stored in schema comments or seed data.';
