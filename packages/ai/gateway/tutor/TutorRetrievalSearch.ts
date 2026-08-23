import type {
  RetrievalChunkRepository,
} from "@avora/db/repositories/chunks";
import type {
  RetrievalSearchPort,
} from "@avora/retrieval/search";
import {
  createScopedRetrievalSearch,
} from "@avora/retrieval/search";

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
