export type {
  ResourceClassificationWorkerDependencies,
  ResourceClassificationWorkerInput,
  ResourceClassificationWorkerOutcome,
  ResourceClassificationWorkerResult,
} from "./contracts.js";

export {
  resourceClassificationWorkerOutcomes,
} from "./contracts.js";

export {
  ResourceClassificationWorkerError,
} from "./errors.js";
export type { ResourceClassificationWorkerErrorCode } from "./errors.js";

export {
  createResourceClassificationWorkerHandler,
  resourceClassificationWorkerHandlerName,
} from "./handler.js";
export type { ResourceClassificationWorkerHandler } from "./handler.js";

export {
  buildSimilarityQueryText,
  deriveDeterministicCandidateId,
  mapChunkToContentSignal,
  mapDbAcademicStructureTreeToDomain,
  mapSearchResultsToSimilaritySignals,
} from "./mapper.js";

export {
  createResourceClassificationJobHandlerAdapter,
} from "./ResourceClassificationJobHandlerAdapter.js";
export type {
  CreateResourceClassificationJobHandlerAdapterInput,
} from "./ResourceClassificationJobHandlerAdapter.js";

export {
  createResourceClassificationWorker,
} from "./ResourceClassificationWorker.js";
export type {
  ResourceClassificationJobHandler,
  ResourceClassificationJobHandlerResult,
  ResourceClassificationWorker,
} from "./ResourceClassificationWorker.js";
