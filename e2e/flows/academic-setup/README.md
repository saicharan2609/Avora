# academic-setup flow

Owner: @avora/qa  
Domain owner: @avora/academic  
Web owner: @avora/web

## Purpose

This directory owns the Stage 8 academic setup flow plan.

Stage 8 Group 7 closes the academic setup foundation by defining the cross-cutting flow that proves:

- an authenticated student can create an academic term;
- an authenticated student can create a subject inside that term;
- an authenticated student can create recursive structure units inside that subject;
- setup progress moves from `not_started` to `in_progress` to `complete`;
- the academic structure tree returns the created term, subject, and nested units;
- another student cannot access or mutate the first student's academic graph.

## Public surface

This directory has no runtime package export.

## Test data

Only synthetic fixtures may be used.

No production data, real student academic material, production credentials, or service-role credentials may be used by this e2e flow.

## Current flow plans

- `academic-setup.flow-plan.json`

## Boundaries

This directory must not import `@avora/db`.

This directory must not use service-role database access.

This directory must not use production data.

This directory must not implement runtime behavior, UI components, mobile screens, worker logic, AI behavior, retrieval behavior, or route handlers.

This directory documents and later drives black-box flow validation only.