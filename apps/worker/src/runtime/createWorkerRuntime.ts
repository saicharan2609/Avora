import {
  createSupabaseStorageAdapter,
  createSupabaseStorageInspectionAdapter,
} from "@avora/adapters/supabase/storage";
import {
  createGeminiEmbeddingPort,
  createGoogleGenAIEmbeddingClient,
} from "@avora/ai/adapters/google";
import {
  createContentAddressedEmbeddingPort,
} from "@avora/ai/embeddings";
import type { EmbeddingCacheEntry, EmbeddingCachePort } from "@avora/ai/embeddings";
import { createServiceRoleDatabaseClient } from "@avora/db/client";
import { createResourceIngestionJobsRepository } from "@avora/db/repositories/jobs";
import { createResourceExtractionJobsRepository } from "@avora/db/repositories/resource-extraction-jobs";
import { createResourceChunkingJobsRepository } from "@avora/db/repositories/resource-chunking-jobs";
import { createResourceIndexingJobsRepository } from "@avora/db/repositories/resource-indexing-jobs";
import { createResourceUploadTicketJobsRepository } from "@avora/db/repositories/resource-upload-ticket-jobs";
import { createResourceExtractionRepository } from "@avora/db/repositories/extraction";
import type { ResourceExtractionRepository } from "@avora/db/repositories/extraction";
import { createRetrievalChunkRepository } from "@avora/db/repositories/chunks";
import { createChunkEmbeddingsRepository } from "@avora/db/repositories/chunk-embeddings";
import { createEmbeddingCacheRepository } from "@avora/db/repositories/embedding-cache";
import type { DbEmbeddingCacheStrategyVersion } from "@avora/db/repositories/embedding-cache";
import { createResourcesRepository } from "@avora/db/repositories/resources";
import {
  createResourceIngestionValidationService,
  createResourceExtractionService,
} from "@avora/domain/resources";
import {
  createCompositeResourceExtractionAdapter,
  createPdfExtractionAdapter,
} from "@avora/adapters/extraction";
import { createResourceChunker } from "@avora/retrieval/chunking";

import type {
  ResourceChunkerExtractedContentBlock,
  ResourceChunkerExtractionDocument,
} from "@avora/retrieval/chunking";

import { createResourceIngestionValidationHandler } from "../resource-ingestion/ResourceIngestionValidationHandler.js";
import {
  createResourceIngestionWorker,
  type ResourceIngestionWorker,
} from "../resource-ingestion/ResourceIngestionWorker.js";
import {
  createResourceExtractionJobHandlerAdapter,
  createResourceExtractionWorker,
  createResourceExtractionWorkerHandler,
  type ResourceExtractionWorker,
} from "../resource-extraction/index.js";
import {
  createResourceChunkingJobHandlerAdapter,
  createResourceChunkingWorker,
  createResourceChunkingWorkerHandler,
  type ResourceChunkingExtractionRepository,
  type ResourceChunkingWorker,
} from "../resource-chunking/index.js";
import {
  createResourceIndexingJobHandlerAdapter,
  createResourceIndexingWorker,
  createResourceIndexingWorkerHandler,
  createSupabaseEmbeddingIndexWriter,
  type ResourceIndexingWorker,
} from "../resource-indexing/index.js";
import {
  createResourceUploadTicketWorker,
  type ResourceUploadTicketWorker,
} from "../resource-upload-ticket/index.js";

export type WorkerRuntimeEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  geminiApiKey: string;
  workerId: string;
}>;

export type WorkerRuntime = Readonly<{
  resourceIngestionWorker: ResourceIngestionWorker;
  resourceExtractionWorker: ResourceExtractionWorker;
  resourceChunkingWorker: ResourceChunkingWorker;
  resourceIndexingWorker: ResourceIndexingWorker;
  resourceUploadTicketWorker: ResourceUploadTicketWorker;
}>;

export function readWorkerRuntimeEnvironment(): WorkerRuntimeEnvironment {
  return {
    supabaseUrl: readRequiredEnvironmentValue("SUPABASE_URL"),
    supabaseServiceRoleKey: readRequiredEnvironmentValue(
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
    geminiApiKey: readRequiredEnvironmentValue("GEMINI_API_KEY"),
    workerId: process.env["AVORA_WORKER_ID"] ?? `worker-${process.pid}`,
  };
}

export function createWorkerRuntime(
  environment: WorkerRuntimeEnvironment,
): WorkerRuntime {
  const database = createServiceRoleDatabaseClient({
    supabaseUrl: environment.supabaseUrl,
    supabaseServiceRoleKey: environment.supabaseServiceRoleKey,
  });

  const resourcesRepository = createResourcesRepository({
    client: database.client,
  });

  const resourceIngestionJobsRepository = createResourceIngestionJobsRepository(
    {
      client: database.client,
    },
  );

  const resourceExtractionJobsRepository =
    createResourceExtractionJobsRepository({
      client: database.client,
    });

  const resourceChunkingJobsRepository = createResourceChunkingJobsRepository({
    client: database.client,
  });

  const resourceIndexingJobsRepository = createResourceIndexingJobsRepository({
    client: database.client,
  });

  const resourceUploadTicketJobsRepository =
    createResourceUploadTicketJobsRepository({
      client: database.client,
    });

  const extractionRepository = createResourceExtractionRepository({
    client: database.client,
  });

  const retrievalChunkRepository = createRetrievalChunkRepository({
    client: database.client,
  });

  const chunkEmbeddingsRepository = createChunkEmbeddingsRepository({
    client: database.client,
  });

  const embeddingCacheRepository = createEmbeddingCacheRepository({
    client: database.client,
  });

  const storageInspection = createSupabaseStorageInspectionAdapter({
    supabaseUrl: environment.supabaseUrl,
    supabaseServiceRoleKey: environment.supabaseServiceRoleKey,
  });

  // Worker-tier only (SEC-005, AD-11): apps/web never constructs this client.
  const uploadBlobStore = createSupabaseStorageAdapter({
    supabaseUrl: environment.supabaseUrl,
    supabaseServiceRoleKey: environment.supabaseServiceRoleKey,
  });

  const validationService = createResourceIngestionValidationService({
    repository: resourcesRepository,
    objectInspection: storageInspection,
  });

  const pdfExtractionAdapter = createPdfExtractionAdapter();
  const compositeExtractionAdapter = createCompositeResourceExtractionAdapter({
    pdfAdapter: pdfExtractionAdapter,
  });

  const extractionService = createResourceExtractionService({
    extractor: compositeExtractionAdapter,
  });

  const extractionWorkerHandler = createResourceExtractionWorkerHandler({
    extractionService,
    extractionRepository,
    resourcesRepository,
  });

  const chunkingWorkerHandler = createResourceChunkingWorkerHandler({
    extractionRepository: createResourceChunkingExtractionRepositoryAdapter({
      extractionRepository,
    }),
    retrievalChunkRepository,
    resourceChunker: createResourceChunker(),
  });

  const geminiEmbeddingPort = createGeminiEmbeddingPort({
    client: createGoogleGenAIEmbeddingClient({
      apiKey: environment.geminiApiKey,
    }),
    // Fails closed by design (AiProviderInvocationGate): no worker-tier
    // configuration surface for this gate exists yet, so it must not default
    // to "enabled". This mirrors the tutor-answer path's composition root,
    // which likewise does not wire a live invocation-gate state.
    invocationGateState: undefined,
  });

  // Wraps the Gemini port with the AD-30 / ENG-238 content-addressed cache:
  // identical chunk text at the same embedding strategy version is embedded
  // once, never once per student circulating an identical resource.
  const embeddingPort = createContentAddressedEmbeddingPort({
    inner: geminiEmbeddingPort,
    cache: createEmbeddingCachePortAdapter({ embeddingCacheRepository }),
  });

  const indexingWorkerHandler = createResourceIndexingWorkerHandler({
    retrievalChunkRepository,
    embeddingPort,
    embeddingIndexWriter: createSupabaseEmbeddingIndexWriter({
      chunkEmbeddingsRepository,
    }),
  });

  return {
    resourceIngestionWorker: createResourceIngestionWorker({
      repository: resourceIngestionJobsRepository,
      handler: createResourceIngestionValidationHandler({
        validationService,
      }),
      workerId: environment.workerId,
    }),
    resourceExtractionWorker: createResourceExtractionWorker({
      repository: resourceExtractionJobsRepository,
      handler: createResourceExtractionJobHandlerAdapter({
        extractionWorkerHandler,
      }),
      workerId: environment.workerId,
    }),
    resourceChunkingWorker: createResourceChunkingWorker({
      repository: resourceChunkingJobsRepository,
      handler: createResourceChunkingJobHandlerAdapter({
        chunkingWorkerHandler,
      }),
      workerId: environment.workerId,
    }),
    resourceIndexingWorker: createResourceIndexingWorker({
      repository: resourceIndexingJobsRepository,
      handler: createResourceIndexingJobHandlerAdapter({
        indexingWorkerHandler,
      }),
      workerId: environment.workerId,
    }),
    resourceUploadTicketWorker: createResourceUploadTicketWorker({
      repository: resourceUploadTicketJobsRepository,
      blobStore: uploadBlobStore,
      workerId: environment.workerId,
    }),
  };
}

type CreateResourceChunkingExtractionRepositoryAdapterInput = Readonly<{
  extractionRepository: ResourceExtractionRepository;
}>;

function createResourceChunkingExtractionRepositoryAdapter(
  input: CreateResourceChunkingExtractionRepositoryAdapterInput,
): ResourceChunkingExtractionRepository {
  return {
    getResourceExtractionDocumentById: async (lookup) => {
      const document =
        await input.extractionRepository.getResourceExtractionDocumentById({
          studentId: lookup.studentId,
          extractionDocumentId:
            lookup.extractionDocumentId as unknown as Parameters<
              ResourceExtractionRepository["getResourceExtractionDocumentById"]
            >[0]["extractionDocumentId"],
        });

      if (document === null) {
        return null;
      }

      const mapped: ResourceChunkerExtractionDocument = {
        studentId: document.studentId,
        resourceId: document.resourceId,
        extractionDocumentId:
          document.extractionDocumentId as unknown as ResourceChunkerExtractionDocument["extractionDocumentId"],
        status: document.status,
      };

      return mapped;
    },

    listResourceExtractedContentBlocks: async (lookup) => {
      const blocks =
        await input.extractionRepository.listResourceExtractedContentBlocks({
          studentId: lookup.studentId,
          extractionDocumentId:
            lookup.extractionDocumentId as unknown as Parameters<
              ResourceExtractionRepository["listResourceExtractedContentBlocks"]
            >[0]["extractionDocumentId"],
        });

      return blocks.map((block): ResourceChunkerExtractedContentBlock => ({
        blockId:
          block.blockId as unknown as ResourceChunkerExtractedContentBlock["blockId"],
        extractionDocumentId:
          block.extractionDocumentId as unknown as ResourceChunkerExtractedContentBlock["extractionDocumentId"],
        studentId: block.studentId,
        resourceId: block.resourceId,
        kind: block.kind as unknown as ResourceChunkerExtractedContentBlock["kind"],
        text: block.text,
        locator:
          block.locator as unknown as ResourceChunkerExtractedContentBlock["locator"],
        sortOrder: block.sortOrder,
        parentBlockId: block.parentBlockId,
        confidence: block.confidence,
      }));
    },
  };
}

type CreateEmbeddingCachePortAdapterInput = Readonly<{
  embeddingCacheRepository: ReturnType<typeof createEmbeddingCacheRepository>;
}>;

function createEmbeddingCachePortAdapter(
  input: CreateEmbeddingCachePortAdapterInput,
): EmbeddingCachePort {
  return {
    getCachedEmbeddings: async (lookup) => {
      const result = await input.embeddingCacheRepository.getCachedEmbeddings({
        keys: lookup.keys.map((key) => ({
          contentHash: key.contentHash,
          embeddingStrategyVersion:
            key.embeddingStrategyVersion as unknown as DbEmbeddingCacheStrategyVersion,
        })),
      });

      return {
        entries: result.entries.map((entry) => ({
          contentHash: entry.contentHash,
          embeddingStrategyVersion:
            entry.embeddingStrategyVersion as unknown as EmbeddingCacheEntry["embeddingStrategyVersion"],
          vector: entry.vector,
          dimensions: entry.dimensions,
        })),
      };
    },
    putCachedEmbeddings: async (write) => {
      await input.embeddingCacheRepository.putCachedEmbeddings({
        entries: write.entries.map((entry) => ({
          contentHash: entry.contentHash,
          embeddingStrategyVersion:
            entry.embeddingStrategyVersion as unknown as DbEmbeddingCacheStrategyVersion,
          vector: entry.vector,
          dimensions: entry.dimensions,
        })),
      });
    },
  };
}

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required worker environment variable: ${name}`);
  }

  return value;
}
