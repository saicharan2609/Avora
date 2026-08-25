import type { RetrievalChunkRepository } from "@avora/db/repositories/chunks";
import type {
  CreateHybridRetrievalSearchInput,
  RetrievalSearchPort,
} from "@avora/retrieval/search";
import {
  createHybridRetrievalSearch,
  createScopedRetrievalSearch,
} from "@avora/retrieval/search";

export type { RetrievalSearchPort } from "@avora/retrieval/search";
export type CreateTutorRetrievalSearchInput = Readonly<{

  retrievalChunkRepository: Pick<
    RetrievalChunkRepository,
    "listRetrievalChunksByScope"
  >;
}>;

export function createTutorRetrievalSearch(
  input: CreateTutorRetrievalSearchInput,
): RetrievalSearchPort {
  return createScopedRetrievalSearch({
    retrievalChunkRepository: input.retrievalChunkRepository,
  });
}

export type CreateTutorHybridRetrievalSearchInput =
  CreateHybridRetrievalSearchInput;

export function createTutorHybridRetrievalSearch(
  input: CreateTutorHybridRetrievalSearchInput,
): RetrievalSearchPort {
  return createHybridRetrievalSearch(input);
}
