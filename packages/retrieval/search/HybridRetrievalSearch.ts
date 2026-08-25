import type {
  DbRetrievalChunkRecord,
  RetrievalChunkRepository,
} from "@avora/db/repositories/chunks";

import {
  createRetrievalInsufficiency,
  createRetrievalSufficiency,
} from "../insufficiency/index.js";
import {
  resolveScopedSearchPredicate,
} from "../scope/index.js";
import type {
  ScopedSearchInput,
} from "../scope/index.js";
import {
  RetrievalSearchError,
} from "./RetrievalSearchError.js";
import type {
  RetrievalSearchPort,
  RetrievalSearchResult,
  ScopedSearchResult,
} from "./RetrievalSearchPort.js";

export type EmbedQueryTextInput = Readonly<{
  queryText: string;
}>;

// A minimal, structurally-typed embedding seam. @avora/retrieval must not
// import @avora/ai or a provider SDK (NN-02, package README boundary), so
// this is not @avora/ai's EmbeddingPort type — the composition root adapts
// the concrete EmbeddingPort (packages/ai/embeddings/EmbeddingPort.ts) to
// this shape.
export type EmbedQueryText = (
  input: EmbedQueryTextInput,
) => Promise<readonly number[]>;

export type CreateHybridRetrievalSearchInput = Readonly<{
  retrievalChunkRepository: Pick<
    RetrievalChunkRepository,
    "searchRetrievalChunksHybrid"
  >;
  embedQueryText: EmbedQueryText;
  embeddingStrategyVersion: string;
}>;

export function createHybridRetrievalSearch(
  input: CreateHybridRetrievalSearchInput,
): RetrievalSearchPort {
  return {
    search: async (
      searchInput: ScopedSearchInput,
    ): Promise<ScopedSearchResult> => {
      assertValidScopedSearchInput(searchInput);

      const normalizedQuery = normalizeQuery(searchInput.query);
      const predicate = resolveScopedSearchPredicate(searchInput);

      let queryEmbedding: readonly number[];

      try {
        queryEmbedding = await input.embedQueryText({
          queryText: normalizedQuery,
        });
      } catch (error) {
        throw new RetrievalSearchError(
          "retrieval_search_query_embedding_failed",
          "Hybrid retrieval search failed to embed the query text.",
          { cause: error },
        );
      }

      let hybridResults: readonly Readonly<{
        chunk: DbRetrievalChunkRecord;
        fusedScore: number;
      }>[];

      try {
        hybridResults =
          await input.retrievalChunkRepository.searchRetrievalChunksHybrid({
            studentId: predicate.studentId,
            termId: predicate.termId,
            subjectId: predicate.subjectId,
            structureUnitId: predicate.structureUnitId,
            resourceId: predicate.resourceId,
            status: predicate.status,
            queryText: normalizedQuery,
            queryEmbedding,
            embeddingStrategyVersion: input.embeddingStrategyVersion,
            matchCount: searchInput.limits.maxChunks,
          });
      } catch (error) {
        throw new RetrievalSearchError(
          "retrieval_search_repository_failed",
          "Hybrid retrieval search failed to read ranked retrieval chunks.",
          { cause: error },
        );
      }

      const results = hybridResults.map(
        (hybridResult, index): RetrievalSearchResult => ({
          rank: index + 1,
          chunk: hybridResult.chunk,
        }),
      );

      const availableChunkCount = results.length;

      if (availableChunkCount === 0) {
        return {
          input: searchInput,
          results,
          sufficiency: createRetrievalInsufficiency({
            reason: "no_scoped_context",
            studentId: searchInput.studentId,
            query: normalizedQuery,
            scope: searchInput.scope,
            availableChunkCount: 0,
            requiredChunkCount: searchInput.insufficiency.minChunkCount,
          }),
        };
      }

      if (availableChunkCount < searchInput.insufficiency.minChunkCount) {
        return {
          input: searchInput,
          results,
          sufficiency: createRetrievalInsufficiency({
            reason: "insufficient_scoped_context",
            studentId: searchInput.studentId,
            query: normalizedQuery,
            scope: searchInput.scope,
            availableChunkCount,
            requiredChunkCount: searchInput.insufficiency.minChunkCount,
          }),
        };
      }

      return {
        input: searchInput,
        results,
        sufficiency: createRetrievalSufficiency({
          studentId: searchInput.studentId,
          query: normalizedQuery,
          scope: searchInput.scope,
          availableChunkCount,
        }),
      };
    },
  };
}

function assertValidScopedSearchInput(input: ScopedSearchInput): void {
  if (normalizeQuery(input.query).length === 0) {
    throw new RetrievalSearchError(
      "retrieval_search_invalid_input",
      "Hybrid retrieval search requires a non-empty query.",
    );
  }

  if (
    !Number.isSafeInteger(input.limits.maxChunks)
    || input.limits.maxChunks <= 0
  ) {
    throw new RetrievalSearchError(
      "retrieval_search_invalid_input",
      "Hybrid retrieval search maxChunks must be a positive safe integer.",
    );
  }

  if (
    !Number.isSafeInteger(input.insufficiency.minChunkCount)
    || input.insufficiency.minChunkCount <= 0
  ) {
    throw new RetrievalSearchError(
      "retrieval_search_invalid_input",
      "Hybrid retrieval search minChunkCount must be a positive safe integer.",
    );
  }
}

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}
