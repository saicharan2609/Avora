-- Avora resource upload-intent baseline.
--
-- Purpose:
-- - Introduce public.resources as the durable resource row created before bytes move.
-- - Establish upload state tracking before ingestion implementation begins.
-- - Establish storage bucket names and storage path constraints.
--
-- This migration intentionally does not implement upload APIs, signed URL issuance,
-- storage adapter behavior, ingestion jobs, extraction, classification, AI summaries,
-- retrieval, or product surfaces.

create extension if not exists pgcrypto with schema extensions;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'quarantine',
    'quarantine',
    false,
    52428800,
    null
  ),
  (
    'originals',
    'originals',
    false,
    52428800,
    null
  ),
  (
    'derivatives',
    'derivatives',
    false,
    52428800,
    null
  ),
  (
    'exports',
    'exports',
    false,
    52428800,
    null
  ),
  (
    'shared',
    'shared',
    false,
    52428800,
    null
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table public.resources (
  resource_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (student_id) on delete cascade,
  resource_kind text not null,
  original_filename text not null,
  declared_mime_type text not null,
  byte_size bigint not null,
  content_hash text,
  lifecycle_state text not null default 'pending_upload',
  storage_bucket text not null default 'quarantine',
  storage_object_path text not null,
  storage_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_resource_kind_check check (
    resource_kind in ('document', 'image', 'scan', 'audio', 'video', 'archive', 'other')
  ),
  constraint resources_lifecycle_state_check check (
    lifecycle_state in (
      'pending_upload',
      'uploaded',
      'rejected',
      'processing',
      'ready',
      'failed',
      'deleted'
    )
  ),
  constraint resources_storage_bucket_check check (
    storage_bucket in ('quarantine', 'originals', 'derivatives', 'exports', 'shared')
  ),
  constraint resources_byte_size_positive_check check (byte_size > 0),
  constraint resources_storage_version_positive_check check (storage_version > 0),
  constraint resources_storage_path_student_prefix_check check (
    starts_with(storage_object_path, student_id::text || '/')
  )
);

comment on table public.resources is
  'classification: academic_content; purpose: durable resource metadata row created before upload bytes move.';

comment on column public.resources.resource_id is
  'classification: operational; purpose: stable resource identifier used across storage, jobs, ingestion, retrieval, and citations.';

comment on column public.resources.student_id is
  'classification: identity; purpose: owning student identifier used for RLS and storage path ownership.';

comment on column public.resources.resource_kind is
  'classification: operational; purpose: declared high-level resource kind used before content validation.';

comment on column public.resources.original_filename is
  'classification: academic_content; purpose: student-visible original filename metadata.';

comment on column public.resources.declared_mime_type is
  'classification: operational; purpose: declared MIME type before hostile upload validation.';

comment on column public.resources.byte_size is
  'classification: operational; purpose: declared upload size used for quota and limit enforcement.';

comment on column public.resources.content_hash is
  'classification: operational; purpose: client-computed content hash used for idempotency after upload completion.';

comment on column public.resources.lifecycle_state is
  'classification: operational; purpose: resource processing state visible to students as honest upload and ingestion progress.';

comment on column public.resources.storage_bucket is
  'classification: operational; purpose: private storage bucket containing the resource object at its current lifecycle stage.';

comment on column public.resources.storage_object_path is
  'classification: operational; purpose: private storage object path beginning with student_id for ownership enforcement.';

comment on column public.resources.storage_version is
  'classification: operational; purpose: immutable object version segment for storage lifecycle management.';

comment on column public.resources.created_at is
  'classification: operational; purpose: resource lifecycle audit timestamp.';

comment on column public.resources.updated_at is
  'classification: operational; purpose: resource lifecycle audit timestamp.';

create index resources_student_id_idx
  on public.resources (student_id);

create index resources_student_lifecycle_state_idx
  on public.resources (student_id, lifecycle_state);

create unique index resources_student_storage_object_path_idx
  on public.resources (student_id, storage_object_path);

create unique index resources_student_content_hash_idx
  on public.resources (student_id, content_hash)
  where content_hash is not null;

alter table public.resources enable row level security;
alter table public.resources force row level security;

create policy resources_select_own
  on public.resources
  for select
  to authenticated
  using (student_id = auth.uid());

create policy resources_insert_own
  on public.resources
  for insert
  to authenticated
  with check (student_id = auth.uid());

create policy resources_update_own
  on public.resources
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());