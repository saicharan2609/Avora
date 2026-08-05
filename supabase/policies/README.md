# policies

Owner: @avora/data  
Protected path: yes

## Purpose

This directory owns reviewed RLS policy artifacts.

Policies are reviewed as first-class security artifacts rather than being hidden inside feature code.

## Requirement trace

- REPO-019
- ENG-172
- ENG-173
- ENG-175
- NN-04
- SEC-081
- SEC-082

## Rules

Every student-scoped table must have a policy artifact in this directory.

Policy artifacts must document:

- the table name;
- the operation;
- the threat being prevented;
- the corresponding RLS harness coverage.

Permissive `ALL` policies are prohibited on student-scoped tables.

## Current policy artifacts

- `students.policy.sql`