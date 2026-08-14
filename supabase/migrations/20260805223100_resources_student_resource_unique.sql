-- Avora resource ownership compatibility key.
--
-- Purpose:
-- - Make the existing student-scoped resource foreign-key convention explicit.
-- - Support existing and future foreign keys that reference
--   public.resources(student_id, resource_id).
--
-- This migration intentionally does not implement placement persistence,
-- extraction, retrieval, route handlers, workers, AI behavior, UI, mobile
-- behavior, or tests.

alter table public.resources
  add constraint resources_student_resource_unique
  unique (student_id, resource_id);