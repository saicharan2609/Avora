# resource-extraction flow

Owner: @avora/qa  
Worker owner: @avora/worker  
Domain owner: @avora/resources  
Data owner: @avora/data

## Purpose

This directory owns the resource extraction flow materials.

Stage 9 Group 7 added a documentation-first resource extraction completion flow plan. That plan is retained for historical context.

Stage 10 Group 7 supersedes the Stage 9 plan with an executable deterministic e2e harness.

The Stage 10 harness proves:

- a synthetic uploaded resource can be represented as a resource extraction job;
- the extraction job uses `resource.extraction.extract`;
- extraction reaches the domain extraction service through a deterministic extraction port;
- extraction output is persisted through e2e-local in-memory implementations of the real repository contracts;
- successful extraction persists document, page, block, and provenance records;
- successful extraction converges resource lifecycle to `ready`;
- successful extraction projects public processing status as `ready`;
- partial extraction persists usable content and unsupported-page failure metadata;
- partial extraction converges resource lifecycle to `ready`;
- partial extraction projects public processing status as `partially_ready`;
- terminal failure persists failed document/failure semantics and projects status as `failed`.

## Public surface

This directory has no runtime package export.

## Executable harness