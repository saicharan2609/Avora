# supabase

Owner: @avora/data  
Protected path: yes  
Workspace member: no

## Purpose

`supabase/` contains Avora's reviewed database artifacts.

It owns local Supabase project configuration, versioned migrations, reviewed RLS policies, synthetic seed data, and short data-adjacent Edge Function locations.

Stage 6 Group 1 establishes the database repository foundation before the first application table.

## Requirement trace

- REPO-001
- REPO-004
- REPO-018
- REPO-019
- ENG-173
- ENG-174
- ENG-175
- ENG-179
- ENG-180
- ENG-342
- NN-04
- NN-12
- SEC-081
- SEC-082
- SEC-230

## Directory responsibilities

- `config.toml` owns local Supabase project configuration.
- `migrations/` owns versioned SQL migrations.
- `policies/` owns reviewed RLS policy artifacts.
- `seed/` owns synthetic seed data only.
- `functions/` is reserved for short, data-adjacent Edge Functions.

## Boundaries

This directory is not a pnpm workspace member.

This directory must not contain production-derived seed data.

This directory must not contain secret values.

Every student-scoped table must have deny-by-default RLS and negative-authorisation harness coverage in the same change that introduces the table.

Permissive `ALL` policies are prohibited on student-scoped tables.
