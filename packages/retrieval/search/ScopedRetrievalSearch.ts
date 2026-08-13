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

export type CreateScopedRetrievalSearchInput = Readonly<{
  retrievalChunkRepository: Pick<
    RetrievalChunkRepository,
    "listRetrievalChunksByScope"
  >;
}>;

export function createScopedRetrievalSearch(
  input: CreateScopedRetrievalSearchInput,
): RetrievalSearchPort {
  return {
    search: async (
      searchInput: ScopedSearchInput,
    ): Promise<ScopedSearchResult> => {
      assertValidScopedSearchInput(searchInput);

      const predicate = resolveScopedSearchPredicate(searchInput);

      let scopedChunks: readonly DbRetrievalChunkRecord[];

      try {
        scopedChunks =
          await input.retrievalChunkRepository.listRetrievalChunksByScope(
            predicate,
          );
      } catch (error) {
        throw new RetrievalSearchError(
          "retrieval_search_repository_failed",
          "Scoped retrieval search failed to read scoped retrieval chunks.",
          { cause: error },
        );
      }

      const limitedChunks = scopedChunks.slice(0, searchInput.limits.maxChunks);
      const results = limitedChunks.map(
        (chunk, index): RetrievalSearchResult => ({
          rank: index + 1,
          chunk,
        }),
      );

      if (scopedChunks.length === 0) {
        return {
          input: searchInput,
          results,
          sufficiency: createRetrievalInsufficiency({
            reason: "no_scoped_context",
            studentId: searchInput.studentId,
            query: normalizeQuery(searchInput.query),
            scope: searchInput.scope,
            availableChunkCount: 0,
            requiredChunkCount: searchInput.insufficiency.minChunkCount,
          }),
        };
      }

      if (scopedChunks.length < searchInput.insufficiency.minChunkCount) {
        return {
          input: searchInput,
          results,
          sufficiency: createRetrievalInsufficiency({
            reason: "insufficient_scoped_context",
            studentId: searchInput.studentId,
            query: normalizeQuery(searchInput.query),
            scope: searchInput.scope,
            availableChunkCount: scopedChunks.length,
            requiredChunkCount: searchInput.insufficiency.minChunkCount,
          }),
        };
      }

      return {
        input: searchInput,
        results,
        sufficiency: createRetrievalSufficiency({
          studentId: searchInput.studentId,
          query: normalizeQuery(searchInput.query),
          scope: searchInput.scope,
          availableChunkCount: scopedChunks.length,
        }),
      };
    },
  };
}

function assertValidScopedSearchInput(input: ScopedSearchInput): void {
  if (normalizeQuery(input.query).length === 0) {
    throw new RetrievalSearchError(
      "retrieval_search_invalid_input",
      "Scoped retrieval search requires a non-empty query.",
    );
  }

  if (
    !Number.isSafeInteger(input.limits.maxChunks)
    || input.limits.maxChunks <= 0
  ) {
    throw new RetrievalSearchError(
      "retrieval_search_invalid_input",
      "Scoped retrieval search maxChunks must be a positive safe integer.",
    );
  }

  if (
    !Number.isSafeInteger(input.insufficiency.minChunkCount)
    || input.insufficiency.minChunkCount <= 0
  ) {
    throw new RetrievalSearchError(
      "retrieval_search_invalid_input",
      "Scoped retrieval search minChunkCount must be a positive safe integer.",
    );
  }
}

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}