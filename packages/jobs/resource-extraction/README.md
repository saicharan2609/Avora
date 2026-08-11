# resource extraction jobs

Owner: @avora/worker  
Data owner: @avora/data  
Domain owner: @avora/resources

## Purpose

This directory owns job contracts for resource extraction handoff.

Stage 9 Group 5 adds the job-level envelope and queue port that allow validated resources to be handed from ingestion validation into extraction execution.

## Public surface

- `@avora/jobs/resource-extraction`

## Job name

- `resource.extraction.extract`

## Boundaries

This directory must not import `@avora/db`.

This directory must not import `@avora/domain`.

This directory must not import `@avora/adapters`.

This directory must not import `@avora/ai`.

This directory must not import `@avora/retrieval`.

This directory must not import apps, UI packages, vendor SDKs, or worker runtime code.

This package defines portable job payloads and queue ports only.

It does not claim, execute, persist, extract, parse, OCR, embed, index, summarize, classify, or route resources.