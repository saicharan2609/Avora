import type {
  CreateRetrievalChunkInput as DbCreateRetrievalChunkInput,
} from "@avora/db/repositories/chunks";
import type {
  CreateRetrievalChunkInput as RetrievalCreateRetrievalChunkInput,
} from "@avora/retrieval/chunking";

export function mapRetrievalChunkInputToDbCreateInput(
  input: RetrievalCreateRetrievalChunkInput,
): DbCreateRetrievalChunkInput {
  return {
   chunkId: input.chunkId as unknown as DbCreateRetrievalChunkInput["chunkId"],
    studentId: input.source.studentId,
    resourceId: input.source.resourceId,
    extractionDocumentId:
      input.source.extractionDocumentId as unknown as DbCreateRetrievalChunkInput["extractionDocumentId"],
    sourceBlockIds:
      input.source.sourceBlockIds as unknown as DbCreateRetrievalChunkInput["sourceBlockIds"],
    termId: input.scope.termId,
    subjectId: input.scope.subjectId,
    structureUnitId: input.scope.structureUnitId,
    contentKind: input.content.kind,
    text: input.content.text,
    tokenEstimate: input.content.tokenEstimate,
    sanitisationStatus: input.content.sanitisation.status,
    sanitisationStrategyVersion:
      input.content.sanitisation.strategyVersion as DbCreateRetrievalChunkInput["sanitisationStrategyVersion"],
    sanitisationWarnings: input.content.sanitisation.warnings,
    locator: input.locator,
    sourceContentHash: input.source.sourceContentHash,
    chunkingStrategyVersion:
      input.chunkingStrategyVersion as unknown as DbCreateRetrievalChunkInput["chunkingStrategyVersion"],
    sortOrder: input.sortOrder,
  };
}