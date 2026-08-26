# resource-classification

Owner: @avora/platform
Domain co-owner: @avora/resources

## Purpose

This worker-local module implements Stage 12 Group 6 resource auto-classification.

It claims a durable `resource_classification_jobs` row, loads the resource's own
trusted extracted content (ready retrieval chunks) and filename, the authenticated
student's own academic structure tree, and the same student's own placement
correction history, and runs the deterministic `ResourceClassificationService`
(`@avora/domain/resources`) to produce at most one `PlacementCandidate`. The
candidate is always persisted (visible to the student for review) and is then
run through the existing, unmodified `PlacementPolicy` via
`ResourcePlacementService.placeResourceCandidate`, which decides — exactly as
it already does for any other caller — whether the result becomes an
accepted/tentative placement or stays a candidate awaiting the student's
explicit one-action accept/correct (`FR-039`, existing
`apps/web/app/api/resources/placement/**` routes, unmodified).

This module never mutates a Subject or StructureUnit. It only ever creates a
placement candidate and, through the existing policy, a placement row.

## Public surface

- `createResourceClassificationWorkerHandler`
- `resourceClassificationWorkerHandlerName`
- `ResourceClassificationWorkerInput`
- `ResourceClassificationWorkerResult`
- `ResourceClassificationWorkerDependencies`
- `createResourceClassificationJobHandlerAdapter`
- `createResourceClassificationWorker`

## Requirement trace

- FR-038
- FR-039
- AD-22
- ENG-029
- NN-01
- NN-04
- NN-06
- ENG-171
- ENG-191
- ENG-192
- ENG-193

## Data flow

```text
resource_classification_jobs (claimed row)
→ ResourceRepositoryPort.getById (student-scoped, filename only)
→ RetrievalChunkRepository.listRetrievalChunksByResource (student-scoped, ready chunks)
→ AcademicGraphRepository.getAcademicStructureTree (student-scoped)
→ ResourcePlacementService.listPlacementCorrectionsByStudent (student-scoped, AD-22 prior)
→ ResourceClassificationService.classifyResource (deterministic, pure)
→ ResourcePlacementService.savePlacementCandidate (always, if a candidate exists)
→ ResourcePlacementService.placeResourceCandidate (existing PlacementPolicy decides)
→ resource_placement_candidates / resource_placements (unchanged tables/RLS)
```

## Idempotency

The placement candidate id is derived deterministically from
`(studentId, resourceId, classificationStrategyVersion)`
(`mapper.ts:deriveDeterministicCandidateId`), not a fresh random id per
attempt. A retried job (after a transient failure and reclaim) resolves to
the same candidate row via `savePlacementCandidate`'s existing
upsert-by-`candidateId` semantics and the same placement row via
`placeResourceCandidate`'s existing upsert-by-`(student_id, resource_id)`
semantics — no duplicate rows on replay (`ENG-191`, `ENG-139`).

## Boundaries

This module must not import a provider SDK directly (`NN-02`). It uses only
existing repositories and the existing domain placement service.

This module must not write to `resource_placement_candidates` or
`resource_placements` directly; it only calls `ResourcePlacementService`.

This module must not mutate `subjects` or `structure_units`.

This module does not implement the classification job's DB persistence
(`packages/db/repositories/resource-classification-jobs`), the transactional
enqueue trigger (`supabase/migrations/20260826101000_*.sql`), the
classification algorithm itself (`packages/domain/resources/services/ResourceClassificationService.ts`),
API routes, UI, or mobile behavior — those are owned elsewhere and reused
unmodified or added as their own files.
