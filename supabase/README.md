# supabase

Owner: @avora/data  
Protected path: yes  
Workspace member: no

## Purpose

`supabase/` contains Avora's reviewed database artifacts.

It owns local Supabase project configuration, versioned migrations, reviewed RLS policies, synthetic seed data, and short data-adjacent Edge Function locations.

Stage 6 Group 2 introduced the first student-scoped application table, `public.students`.

Stage 6 Group 3 wires the Supabase Auth database trigger that creates a `public.students` row on first auth-user creation.

## Requirement trace

- REPO-001
- REPO-004
- REPO-018
- REPO-019
- ENG-163
- ENG-164
- ENG-169
- ENG-172
- ENG-173
- ENG-175
- ENG-179
- ENG-180
- ENG-183
- ENG-184
- ENG-186
- NN-04
- NN-12
- SEC-040
- SEC-081
- SEC-082
- SEC-230

## Directory responsibilities

- `config.toml` owns local Supabase project configuration.
- `migrations/` owns versioned SQL migrations.
- `policies/` owns reviewed RLS policy artifacts.
- `seed/` owns synthetic seed data only.
- `functions/` is reserved for short, data-adjacent Edge Functions.

## Current application tables

- `public.students`

## Current private database functions

- `app_private.create_student_for_auth_user()`

## Current auth triggers

- `on_auth_user_created_create_student` on `auth.users`

## Boundaries

This directory is not a pnpm workspace member.

This directory must not contain production-derived seed data.

This directory must not contain secret values.

Every student-scoped table must have deny-by-default RLS and negative-authorisation harness coverage in the same change that introduces the table.

Permissive `ALL` policies are prohibited on student-scoped tables.

Authentication is owned by Supabase Auth. Avora application packages must not implement credential handling, session issuance, or token verification.