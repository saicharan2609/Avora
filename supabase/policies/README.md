# policies

Owner: @avora/data  
Protected path: yes

## Purpose

This directory owns reviewed RLS policy artifacts.

Policies are reviewed as first-class security artifacts rather than being hidden inside feature code.

## Requirement trace

- REPO-019
- ENG-173
- ENG-174
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

Stage 6 Group 1 introduces no student-scoped application tables, so it introduces no table policy files.
