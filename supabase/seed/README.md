# seed

Owner: @avora/data  
Protected path: yes

## Purpose

This directory owns synthetic seed data only.

Production-derived data is never committed to this repository and is never copied into CI.

## Requirement trace

- ENG-342
- NN-01
- NN-04
- NN-12
- SEC-230

## Seed sets

- `adaptivity/` contains synthetic data used to guard Avora's no-fixed-hierarchy invariant.

## Boundaries

Seed data must not contain real student content, real institution content, real filenames, real email addresses, credentials, tokens, or production-derived values.
