import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type {
  AcademicGraphRepository,
} from "@avora/db/repositories/academic";
import type {
  RetrievalChunkRepository,
} from "@avora/db/repositories/chunks";
import type {
  PlacementCandidateId,
  ResourceClassificationService,
  ResourcePlacementService,
  ResourceRepositoryPort,
} from "@avora/domain/resources";
import type {
  RetrievalSearchPort,
} from "@avora/retrieval/search";

export type ResourceClassificationWorkerInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  classificationStrategyVersion: string;
  placementPolicyVersion: string;
  requestedAt: IsoDateTimeString;
}>;

export const resourceClassificationWorkerOutcomes = [
  "placed",
  "needs_review",
  "insufficient_evidence",
] as const;

export type ResourceClassificationWorkerOutcome =
  (typeof resourceClassificationWorkerOutcomes)[number];

export type ResourceClassificationWorkerResult = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  outcome: ResourceClassificationWorkerOutcome;
  candidateId: PlacementCandidateId | null;
}>;

export type ResourceClassificationWorkerDependencies = Readonly<{
  resourcesRepository: Pick<ResourceRepositoryPort, "getById">;
  retrievalChunkRepository: Pick<
    RetrievalChunkRepository,
    "listRetrievalChunksByResource"
  >;
  academicGraphRepository: Pick<
    AcademicGraphRepository,
    "getAcademicStructureTree"
  >;
  placementService: Pick<
    ResourcePlacementService,
    | "savePlacementCandidate"
    | "placeResourceCandidate"
    | "listPlacementCorrectionsByStudent"
  >;
  // architecture.md 19.4: "extracted content similarity to existing subject
  // corpora" — the strongest classification signal once a workspace has
  // material. Optional dependency: when omitted (e.g. a test double, or a
  // deployment where the AI Gateway invocation gate is closed), the worker
  // degrades to lexical-only signals rather than failing the job (EP-06 —
  // degrade a feature, never the corpus).
  retrievalSearch?: Pick<RetrievalSearchPort, "search">;
  classificationService: ResourceClassificationService;
}>;
