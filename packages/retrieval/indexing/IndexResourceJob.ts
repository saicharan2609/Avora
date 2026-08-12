import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";

export const indexResourceJobName = "retrieval.index.resource" as const;

export type RetrievalEmbeddingStrategyVersion = string & {
  readonly __brand: "RetrievalEmbeddingStrategyVersion";
};

export type IndexResourceJobReason =
  | "resource_chunking_succeeded"
  | "manual_reindex_requested"
  | "embedding_strategy_backfill";

export type IndexResourceJobPriority =
  | "interactive"
  | "normal"
  | "backfill";

export type IndexResourceJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  embeddingStrategyVersion: RetrievalEmbeddingStrategyVersion;
  requestedAt: string;
  reason: IndexResourceJobReason;
  priority: IndexResourceJobPriority;
  chunkingStrategyVersion: string | null;
  sourceContentHash: string | null;
}>;

export type IndexResourceJob = Readonly<{
  name: typeof indexResourceJobName;
  payload: IndexResourceJobPayload;
}>;