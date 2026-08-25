-- Avora retrieval chunk ownership compatibility key.
--
-- Purpose:
-- - Make the existing student-scoped chunk foreign-key convention explicit,
--   mirroring resources_student_resource_unique
--   (20260805223100_resources_student_resource_unique.sql).
-- - Support the Stage 12 Group 2 chunk_embeddings foreign key that must
--   reference chunks by (student_id, chunk_id) so RLS and NN-04 ownership
--   checks never depend on a join back through chunks.
--
-- This migration intentionally does not implement embedding persistence,
-- vector search, retrieval, AI Tutor orchestration, UI, mobile behavior, or
-- tests.
--
-- Rollback (ENG-180): reversible. `alter table public.chunks drop constraint
-- chunks_student_chunk_unique;`. chunk_id is already globally unique (primary
-- key), so this constraint adds no new data-integrity guarantee beyond
-- enabling composite foreign keys; dropping it is always safe as long as no
-- migration created after this one still depends on the composite FK it
-- enables (chunk_embeddings.sql does; drop that dependent constraint first).

alter table public.chunks
  add constraint chunks_student_chunk_unique
  unique (student_id, chunk_id);
