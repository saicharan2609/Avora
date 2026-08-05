# Auth user trigger policy note

Owner: @avora/data  
Security owner: @avora/security

## Purpose

This note documents the database-owned identity creation trigger introduced in Stage 6 Group 3.

## Database artifact

- Migration: `supabase/migrations/20260805191000_identity_auth_user_trigger.sql`
- Function: `app_private.create_student_for_auth_user()`
- Trigger: `on_auth_user_created_create_student` on `auth.users`
- Target table: `public.students`

## Requirement trace

- ENG-183
- ENG-184
- ENG-186
- SEC-040
- NN-04

## Security posture

Supabase Auth remains the authentication authority.

Avora application packages do not implement credential handling, session issuance, token verification, or password storage.

The trigger creates only the durable identity row:

- `student_id`
- `display_name`
- `lifecycle_status`

The trigger does not seed consent state, entitlement state, enrolment state, academic setup, analytics state, or application content.

## Data handling

The trigger does not copy email addresses or provider metadata into `public.students`.

The Stage 6 Group 3 identity row stores no academic content and no production seed values.