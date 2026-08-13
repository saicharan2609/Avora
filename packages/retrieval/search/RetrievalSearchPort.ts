import type {
  DbRetrievalChunkRecord,
} from "@avora/db/repositories/chunks";

import type {
  RetrievalSufficiencyDecision,
} from "../insufficiency/index.js";
import type {
  ScopedSearchInput,
} from "../scope/index.js";

export type RetrievalSearchResult = Readonly<{
  rank: number;
  chunk: DbRetrievalChunkRecord;
}>;

export type ScopedSearchResult = Readonly<{
  input: ScopedSearchInput;
  results: readonly RetrievalSearchResult[];
  sufficiency: RetrievalSufficiencyDecision;
}>;

export type RetrievalSearchPort = Readonly<{
  search: (input: ScopedSearchInput) => Promise<ScopedSearchResult>;
}>;