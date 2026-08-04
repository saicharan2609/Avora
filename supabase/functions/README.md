# functions

Owner: @avora/data  
Protected path: yes

## Purpose

This directory is reserved for short, data-adjacent Supabase Edge Functions.

Stage 6 Group 1 does not implement Edge Functions.

## Requirement trace

- REPO-001
- REPO-004
- SEC-005
- NN-04

## Boundaries

Edge Functions must not contain feature business logic that belongs in domain services.

Edge Functions must not contain AI provider implementation.

Edge Functions must not receive or store service-role credentials unless explicitly approved by the security architecture for a data-adjacent operation.

No Edge Function is introduced in Stage 6 Group 1.
