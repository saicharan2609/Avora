-- Avora auth-user identity trigger baseline.
--
-- Purpose:
-- - Create the durable public.students row when Supabase Auth creates an auth user.
-- - Keep application code out of credential handling, session issuance, and token verification.
-- - Preserve identity continuity by making the auth user id the student identity.
--
-- This migration intentionally does not implement web login UI, mobile login UI,
-- OAuth button flows, email OTP flows, consent seeding, entitlement seeding,
-- application APIs, or repository methods.

create or replace function app_private.create_student_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, app_private
as $$
begin
  insert into public.students (
    student_id,
    display_name,
    lifecycle_status
  )
  values (
    new.id,
    null,
    'active'
  )
  on conflict (student_id) do nothing;

  return new;
end;
$$;

comment on function app_private.create_student_for_auth_user() is
  'classification: operational; purpose: create durable student identity row on Supabase Auth user creation without application-owned credential handling.';

drop trigger if exists on_auth_user_created_create_student on auth.users;

create trigger on_auth_user_created_create_student
  after insert on auth.users
  for each row
  execute function app_private.create_student_for_auth_user();