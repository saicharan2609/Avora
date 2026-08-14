# resource jobs

Owner: @avora/resources
Runtime owner: @avora/worker

## Purpose

This directory owns domain-visible resource job contracts.

The contracts describe resource job requests and accepted job acknowledgements without binding the domain layer to a queue implementation, database repository, worker runtime, AI provider, retrieval package, web route, UI, or mobile code.

## Public surface

- `ResourceIngestionJobRequest`
- `ResourceIngestionJobAccepted`
- `ResourceClassificationJobRequest`
- `ResourceClassificationJobAccepted`

## Completion Group C — Resource classification handoff

Completion Group C maps to authoritative Stage 9 Group 3: Classification job contract.

It adds domain-visible resource classification job contracts for handing a validated resource into later placement classification execution.

This group intentionally does not implement classification execution, AI/provider logic, placement services, placement APIs, workers, UI, mobile, retrieval, Stage 10, Stage 11, or later completion groups.
