# resource classification jobs

Owner: @avora/worker
Data owner: @avora/data
Domain owner: @avora/resources

## Purpose

This directory owns job contracts for resource classification handoff.

Completion Group C maps to authoritative Stage 9 Group 3: Classification job contract.

The job is created after ingestion validation and placement persistence exist. It hands a validated resource to later classification execution without implementing AI classification, provider calls, workers, services, APIs, UI, mobile, retrieval, or Stage 11 behavior.

## Public surface

- `@avora/jobs/resource-classification`

## Job name

- `resource.classification.requested`

## Public APIs

- `ResourceClassificationJobEnvelope`
- `createResourceClassificationJobEnvelope`
- `ResourceClassificationQueuePort`

## Boundaries

This directory must not import `@avora/db`.

This directory must not import `@avora/domain`.

This directory must not import `@avora/adapters`.

This directory must not import `@avora/ai`.

This directory must not import `@avora/retrieval`.

This directory must not import apps, UI packages, vendor SDKs, or worker runtime code.

This package defines portable job payloads and queue ports only.

It does not claim, execute, persist, classify, infer placement, call providers, embed, retrieve, summarize, route resources, expose APIs, or update UI.
