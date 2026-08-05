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

## Current Stage 6 Group 2 state

Stage 6 Group 2 introduces the first student-scoped table:

- `public.students`

The checked-in generated type artifact reflects this schema baseline.

When future application tables are introduced, the generated type artifact must be regenerated in the same change.