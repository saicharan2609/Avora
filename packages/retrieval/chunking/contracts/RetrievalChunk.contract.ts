import type { IsoDateTimeString } from "@avora/core/time";

import type {
  RetrievalChunkContent,
} from "./RetrievalChunkContent.contract.js";
import type {
  RetrievalChunkId,
  RetrievalChunkingStrategyVersion,
} from "./RetrievalChunkIdentifiers.contract.js";
import type {
  RetrievalChunkLocator,
} from "./RetrievalChunkLocator.contract.js";
import type {
  RetrievalChunkScopeFacets,
} from "./RetrievalChunkScope.contract.js";
import type {
  RetrievalChunkSource,
} from "./RetrievalChunkSource.contract.js";

export const retrievalChunkStatuses = [
  "ready",
  "superseded",
  "deleted",
] as const;

export type RetrievalChunkStatus =
  (typeof retrievalChunkStatuses)[number];

export type RetrievalChunk = Readonly<{
  chunkId: RetrievalChunkId;
  source: RetrievalChunkSource;
  scope: RetrievalChunkScopeFacets;
  content: RetrievalChunkContent;
  locator: RetrievalChunkLocator;
  chunkingStrategyVersion: RetrievalChunkingStrategyVersion;
  status: RetrievalChunkStatus;
  sortOrder: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type CreateRetrievalChunkInput = Readonly<{
  chunkId: RetrievalChunkId;
  source: RetrievalChunkSource;
  scope: RetrievalChunkScopeFacets;
  content: RetrievalChunkContent;
  locator: RetrievalChunkLocator;
  chunkingStrategyVersion: RetrievalChunkingStrategyVersion;
  sortOrder: number;
}>;

export type RetrievalChunkBatch = Readonly<{
  chunks: readonly RetrievalChunk[];
  chunkingStrategyVersion: RetrievalChunkingStrategyVersion;
}>;