import type {
  ClassificationContentSignal,
  ClassificationCorrectionSignal,
  ClassificationSimilaritySignal,
  PlacementCorrection,
} from "@avora/domain/resources";

import {
  ResourceClassificationWorkerError,
} from "./errors.js";
import {
  buildSimilarityQueryText,
  deriveDeterministicCandidateId,
  mapChunkToContentSignal,
  mapDbAcademicStructureTreeToDomain,
  mapSearchResultsToSimilaritySignals,
} from "./mapper.js";
import type {
  ResourceClassificationWorkerDependencies,
  ResourceClassificationWorkerInput,
  ResourceClassificationWorkerResult,
} from "./contracts.js";

const SIMILARITY_SEARCH_MAX_CHUNKS = 10;
const SIMILARITY_SEARCH_MIN_CHUNK_COUNT = 1;

export const resourceClassificationWorkerHandlerName =
  "resource-classification-worker-handler";

export type ResourceClassificationWorkerHandler = Readonly<{
  classifyResource: (
    input: ResourceClassificationWorkerInput,
  ) => Promise<ResourceClassificationWorkerResult>;
}>;

export function createResourceClassificationWorkerHandler(
  dependencies: ResourceClassificationWorkerDependencies,
): ResourceClassificationWorkerHandler {
  return {
    classifyResource: async (
      input: ResourceClassificationWorkerInput,
    ): Promise<ResourceClassificationWorkerResult> => {
      const resource = await dependencies.resourcesRepository.getById({
        studentId: input.studentId,
        resourceId: input.resourceId,
      });

      if (resource === null) {
        throw new ResourceClassificationWorkerError(
          "resource_classification_worker_resource_not_found",
          "Resource classification worker could not load the resource for the authenticated student.",
        );
      }

      const readyChunks =
        await dependencies.retrievalChunkRepository.listRetrievalChunksByResource({
          studentId: input.studentId,
          resourceId: input.resourceId,
          status: "ready",
        });

      const dbAcademicStructureTree =
        await dependencies.academicGraphRepository.getAcademicStructureTree({
          studentId: input.studentId,
        });

      const corrections =
        await dependencies.placementService.listPlacementCorrectionsByStudent({
          studentId: input.studentId,
        });

      const contentSignals = readyChunks.map(mapChunkToContentSignal);

      const similaritySignals = await resolveSimilaritySignals({
        dependencies,
        input,
        contentSignals,
        originalFilename: resource.originalFilename,
      });

      const { candidate } = dependencies.classificationService.classifyResource({
        studentId: input.studentId,
        resourceId: input.resourceId,
        classificationStrategyVersion: input.classificationStrategyVersion,
        originalFilename: resource.originalFilename,
        contentSignals,
        academicStructureTree: mapDbAcademicStructureTreeToDomain(dbAcademicStructureTree),
        correctionHistory: mapCorrectionsToSignals(corrections),
        similaritySignals,
      });

      if (candidate === null) {
        return {
          studentId: input.studentId,
          resourceId: input.resourceId,
          outcome: "insufficient_evidence",
          candidateId: null,
        };
      }

      const stableCandidate = {
        ...candidate,
        candidateId: deriveDeterministicCandidateId({
          studentId: input.studentId,
          resourceId: input.resourceId,
          classificationStrategyVersion: input.classificationStrategyVersion,
        }),
      };

      try {
        await dependencies.placementService.savePlacementCandidate({
          candidate: stableCandidate,
        });
      } catch (error) {
        throw new ResourceClassificationWorkerError(
          "resource_classification_worker_candidate_persistence_failed",
          "Resource classification worker failed to persist the placement candidate.",
          { cause: error },
        );
      }

      const placementResult = await dependencies.placementService.placeResourceCandidate({
        candidate: stableCandidate,
      });

      return {
        studentId: input.studentId,
        resourceId: input.resourceId,
        outcome: placementResult.outcome === "placed" ? "placed" : "needs_review",
        candidateId: stableCandidate.candidateId,
      };
    },
  };
}

function mapCorrectionsToSignals(
  corrections: readonly PlacementCorrection[],
): readonly ClassificationCorrectionSignal[] {
  return corrections.map((correction) => ({
    correctedTarget: correction.correctedTarget,
  }));
}

type ResolveSimilaritySignalsInput = Readonly<{
  dependencies: ResourceClassificationWorkerDependencies;
  input: ResourceClassificationWorkerInput;
  contentSignals: readonly ClassificationContentSignal[];
  originalFilename: string;
}>;

// architecture.md 19.4: content-similarity is an enrichment signal, never a
// blocking one (EP-06 — degrade a feature, never the corpus). No injected
// RetrievalSearchPort, no usable query text, or a search failure all
// degrade to "no similarity evidence" rather than failing the classification
// job — the lexical signals still run.
async function resolveSimilaritySignals(
  input: ResolveSimilaritySignalsInput,
): Promise<readonly ClassificationSimilaritySignal[]> {
  if (input.dependencies.retrievalSearch === undefined) {
    return [];
  }

  const queryText = buildSimilarityQueryText({
    contentSignals: input.contentSignals,
    originalFilename: input.originalFilename,
  });

  if (queryText.trim().length === 0) {
    return [];
  }

  try {
    const searchResult = await input.dependencies.retrievalSearch.search({
      studentId: input.input.studentId,
      query: queryText,
      scope: {
        termId: null,
        subjectId: null,
        structureUnitId: null,
        resourceId: null,
      },
      limits: {
        maxChunks: SIMILARITY_SEARCH_MAX_CHUNKS,
      },
      insufficiency: {
        minChunkCount: SIMILARITY_SEARCH_MIN_CHUNK_COUNT,
      },
    });

    return mapSearchResultsToSimilaritySignals(searchResult, input.input.resourceId);
  } catch {
    return [];
  }
}
