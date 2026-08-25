import type {
  DbRetrievalChunkRecord,
  SearchRetrievalChunksHybridInput,
} from "@avora/db/repositories/chunks";
import type { ResourceId, StudentId } from "@avora/core/identity";

import {
  createHybridRetrievalSearch,
} from "../HybridRetrievalSearch.js";
import { RetrievalSearchError } from "../RetrievalSearchError.js";
import type { ScopedSearchInput } from "../../scope/index.js";

class HybridRetrievalSearchTestFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "HybridRetrievalSearchTestFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new HybridRetrievalSearchTestFailure(caseId, reason);
  }
}

const studentId = "00000000-0000-4000-8000-000000030001" as StudentId;
const resourceId = "00000000-0000-4000-8000-000000030101" as ResourceId;

function buildScopedSearchInput(
  overrides: Partial<ScopedSearchInput> = {},
): ScopedSearchInput {
  return {
    studentId,
    query: "what is reciprocal rank fusion",
    scope: {
      termId: null,
      subjectId: null,
      structureUnitId: null,
      resourceId,
    },
    limits: {
      maxChunks: 4,
    },
    insufficiency: {
      minChunkCount: 1,
    },
    ...overrides,
  };
}

function buildChunkRecord(
  chunkId: string,
): DbRetrievalChunkRecord {
  return {
    chunkId: chunkId as DbRetrievalChunkRecord["chunkId"],
    studentId,
    resourceId,
    extractionDocumentId:
      "00000000-0000-4000-8000-000000030201" as DbRetrievalChunkRecord["extractionDocumentId"],
    sourceBlockIds: [
      "00000000-0000-4000-8000-000000030301" as DbRetrievalChunkRecord["sourceBlockIds"][number],
    ],
    scope: {
      termId: null,
      subjectId: null,
      structureUnitId: null,
      resourceId,
    },
    contentKind: "paragraph",
    text: "Reciprocal rank fusion merges vector and keyword rankings.",
    tokenEstimate: 12,
    sanitisation: {
      status: "sanitised",
      strategyVersion: "sanitiser.v1" as DbRetrievalChunkRecord["sanitisation"]["strategyVersion"],
      warnings: [],
    },
    locator: {
      kind: "document_page",
      pageNumber: 1,
      slideNumber: null,
      boundingBox: null,
      textSpan: null,
      timeRange: null,
      label: null,
    },
    sourceContentHash: "sha256:test",
    chunkingStrategyVersion: "chunker.v1" as DbRetrievalChunkRecord["chunkingStrategyVersion"],
    status: "ready",
    sortOrder: 0,
    createdAt: "2026-08-25T00:00:00.000Z" as DbRetrievalChunkRecord["createdAt"],
    updatedAt: "2026-08-25T00:00:00.000Z" as DbRetrievalChunkRecord["updatedAt"],
  };
}

async function runSufficientResultCase(): Promise<void> {
  const caseId = "hybrid-search-sufficient-result";

  let observedInput: SearchRetrievalChunksHybridInput | undefined;
  let observedQueryText: string | undefined;

  const search = createHybridRetrievalSearch({
    embeddingStrategyVersion: "gemini-embedding-001.1536d.v1",
    embedQueryText: async (input) => {
      observedQueryText = input.queryText;
      return [0.1, 0.2, 0.3];
    },
    retrievalChunkRepository: {
      searchRetrievalChunksHybrid: async (input) => {
        observedInput = input;
        return [
          { chunk: buildChunkRecord("00000000-0000-4000-8000-000000030601"), fusedScore: 0.9 },
          { chunk: buildChunkRecord("00000000-0000-4000-8000-000000030602"), fusedScore: 0.5 },
        ];
      },
    },
  });

  const result = await search.search(buildScopedSearchInput());

  assert(observedQueryText === "what is reciprocal rank fusion", caseId, "query text was not normalised and forwarded to embedQueryText");

  const forwardedInput = observedInput;

  assert(forwardedInput !== undefined, caseId, "repository was not called");
  assert(forwardedInput!.studentId === studentId, caseId, "studentId was not forwarded");
  assert(forwardedInput!.resourceId === resourceId, caseId, "resource scope was not forwarded");
  assert(forwardedInput!.matchCount === 4, caseId, "matchCount did not use limits.maxChunks");
  assert(
    forwardedInput!.embeddingStrategyVersion === "gemini-embedding-001.1536d.v1",
    caseId,
    "embeddingStrategyVersion was not forwarded",
  );
  assert(
    forwardedInput!.queryEmbedding.length === 3,
    caseId,
    "embedded query vector was not forwarded",
  );

  assert(result.sufficiency.insufficient === false, caseId, "expected a sufficient result");
  assert(result.results.length === 2, caseId, "expected two ranked results");
  assert(result.results[0]!.rank === 1, caseId, "first result must have rank 1");
  assert(result.results[1]!.rank === 2, caseId, "second result must have rank 2");
  assert(
    result.sufficiency.availableChunkCount === 2,
    caseId,
    "availableChunkCount must equal the number of ranked results returned",
  );
}

async function runEmptyResultIsInsufficientCase(): Promise<void> {
  const caseId = "hybrid-search-empty-result-is-insufficient";

  const search = createHybridRetrievalSearch({
    embeddingStrategyVersion: "gemini-embedding-001.1536d.v1",
    embedQueryText: async () => [0.1],
    retrievalChunkRepository: {
      searchRetrievalChunksHybrid: async () => [],
    },
  });

  const result = await search.search(buildScopedSearchInput());

  assert(result.sufficiency.insufficient === true, caseId, "expected an insufficient result");
  assert(
    result.sufficiency.insufficient && result.sufficiency.reason === "no_scoped_context",
    caseId,
    "expected reason no_scoped_context for zero ranked results",
  );
}

async function runBelowMinimumIsInsufficientCase(): Promise<void> {
  const caseId = "hybrid-search-below-minimum-is-insufficient";

  const search = createHybridRetrievalSearch({
    embeddingStrategyVersion: "gemini-embedding-001.1536d.v1",
    embedQueryText: async () => [0.1],
    retrievalChunkRepository: {
      searchRetrievalChunksHybrid: async () => [
        { chunk: buildChunkRecord("00000000-0000-4000-8000-000000030601"), fusedScore: 0.2 },
      ],
    },
  });

  const result = await search.search(
    buildScopedSearchInput({ insufficiency: { minChunkCount: 2 } }),
  );

  assert(result.sufficiency.insufficient === true, caseId, "expected an insufficient result");
  assert(
    result.sufficiency.insufficient && result.sufficiency.reason === "insufficient_scoped_context",
    caseId,
    "expected reason insufficient_scoped_context when below minChunkCount",
  );
}

async function runEmbeddingFailureSurfacesAsTypedErrorCase(): Promise<void> {
  const caseId = "hybrid-search-embedding-failure-surfaces-as-typed-error";

  const search = createHybridRetrievalSearch({
    embeddingStrategyVersion: "gemini-embedding-001.1536d.v1",
    embedQueryText: async () => {
      throw new Error("provider unavailable");
    },
    retrievalChunkRepository: {
      searchRetrievalChunksHybrid: async () => {
        throw new HybridRetrievalSearchTestFailure(caseId, "repository must not be called after embedding failure");
      },
    },
  });

  try {
    await search.search(buildScopedSearchInput());
  } catch (error) {
    assert(
      error instanceof RetrievalSearchError
        && error.code === "retrieval_search_query_embedding_failed",
      caseId,
      "expected a typed RetrievalSearchError with code retrieval_search_query_embedding_failed",
    );
    return;
  }

  throw new HybridRetrievalSearchTestFailure(caseId, "expected search to throw");
}

async function runEmptyQueryIsRejectedCase(): Promise<void> {
  const caseId = "hybrid-search-empty-query-is-rejected";

  const search = createHybridRetrievalSearch({
    embeddingStrategyVersion: "gemini-embedding-001.1536d.v1",
    embedQueryText: async () => {
      throw new HybridRetrievalSearchTestFailure(caseId, "embedQueryText must not be called for an invalid input");
    },
    retrievalChunkRepository: {
      searchRetrievalChunksHybrid: async () => {
        throw new HybridRetrievalSearchTestFailure(caseId, "repository must not be called for an invalid input");
      },
    },
  });

  try {
    await search.search(buildScopedSearchInput({ query: "   " }));
  } catch (error) {
    assert(
      error instanceof RetrievalSearchError
        && error.code === "retrieval_search_invalid_input",
      caseId,
      "expected a typed RetrievalSearchError with code retrieval_search_invalid_input",
    );
    return;
  }

  throw new HybridRetrievalSearchTestFailure(caseId, "expected search to throw");
}

export async function runHybridRetrievalSearchUnitSuite(): Promise<void> {
  await runSufficientResultCase();
  await runEmptyResultIsInsufficientCase();
  await runBelowMinimumIsInsufficientCase();
  await runEmbeddingFailureSurfacesAsTypedErrorCase();
  await runEmptyQueryIsRejectedCase();
}

await runHybridRetrievalSearchUnitSuite();
