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

## Current Stage 6 Group 1 state

Stage 6 Group 1 does not introduce application tables. The checked-in generated type artifact therefore represents the empty application schema baseline.

When the first application table is introduced, the generated type artifact must be regenerated in the same change.
