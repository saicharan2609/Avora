# generated

Owner: @avora/data  
Generated path: yes  
Hand-editable: no

## Purpose

This directory owns generated database schema type artifacts.

Generated files in this directory are derived from the reviewed Supabase schema and are never hand-edited. CI regenerates schema types and fails on drift once the Supabase CLI workflow is enabled.

## Requirement trace

- REPO-018
- ENG-053
- ENG-165
- NN-04

## Current Stage 7 Group 1 state

Stage 6 Group 2 introduced the first student-scoped table:

- `public.students`

Stage 6 Group 3 introduced the auth-user creation trigger:

- `app_private.create_student_for_auth_user()`
- `on_auth_user_created_create_student` on `auth.users`

Stage 7 Group 1 introduces the first resource upload-intent table:

- `public.resources`

The checked-in generated type artifact reflects the application schema baseline visible to typed Avora code. Trigger functions and triggers remain database-owned migration artifacts and are not application call surfaces.

When future application tables are introduced, the generated type artifact must be regenerated in the same change.