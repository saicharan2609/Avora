# adaptivity

Owner: @avora/data  
Architectural owner: @avora/architecture

## Purpose

This directory owns synthetic seed fixtures for structural adaptivity.

The seed set exists before the first application table so schema and RLS work can be tested against Avora's central no-fixed-hierarchy invariant.

## Requirement trace

- AD-41
- ENG-175
- ENG-342
- NN-01
- NN-04
- NN-07
- NN-12

## Fixture expectations

Synthetic adaptivity seed data must include:

- a subject with no structure;
- heterogeneous student-authored structure labels;
- a label such as `Experiment 7` as student-authored data only;
- restructured resources that preserve stable identifiers.

## Boundaries

These fixtures are synthetic only.

Student-authored labels may contain words that are prohibited as identifiers. Those words must never become table names, column names, enum members, TypeScript identifiers, constants, or hard-coded product taxonomy.
