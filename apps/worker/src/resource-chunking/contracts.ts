import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  CreateRetrievalChunksInput,
  DbRetrievalChunkRecord,
  RetrievalChunkRepository,
} from "@avora/db/repositories/chunks";
import type {
  ChunkingStrategy,
  ResourceChunker,
  ResourceChunkerExtractedContentBlock,
  ResourceChunkerExtractionDocument,
} from "@avora/retrieval/chunking";

export type ResourceChunkingWorkerInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: ResourceChunkerExtractionDocument["extractionDocumentId"];
  sourceContentHash: string;
  chunkingStrategyVersion: ChunkingStrategy["chunkingStrategyVersion"];
  sanitisationStrategyVersion: ChunkingStrategy["sanitisationStrategyVersion"];
  termId: string | null;
  subjectId: string | null;
  structureUnitId: string | null;
}>;

export type ResourceChunkingWorkerResult = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  extractionDocumentId: ResourceChunkingWorkerInput["extractionDocumentId"];
  chunkCount: number;
  chunkIds: readonly DbRetrievalChunkRecord["chunkId"][];
  chunkingStrategyVersion: ChunkingStrategy["chunkingStrategyVersion"];
}>;

export type ResourceChunkingExtractionRepository = Readonly<{
  getResourceExtractionDocumentById: (
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
      extractionDocumentId: ResourceChunkingWorkerInput["extractionDocumentId"];
    }>,
  ) => Promise<ResourceChunkerExtractionDocument | null>;

  listResourceExtractedContentBlocks: (
    input: Readonly<{
      studentId: StudentId;
      resourceId: ResourceId;
      extractionDocumentId: ResourceChunkingWorkerInput["extractionDocumentId"];
    }>,
  ) => Promise<readonly ResourceChunkerExtractedContentBlock[]>;
}>;

export type ResourceChunkingWorkerDependencies = Readonly<{
  extractionRepository: ResourceChunkingExtractionRepository;
  retrievalChunkRepository: Pick<
    RetrievalChunkRepository,
    "createRetrievalChunks"
  >;
  resourceChunker: ResourceChunker;
}>;

export type PersistRetrievalChunksInput = CreateRetrievalChunksInput;