import type { DatabaseClient } from "../../client/index.js";
import type { Json } from "../../generated/database.types.js";
import type {
  CreateRetrievalChunkInput,
  CreateRetrievalChunksInput,
  DbRetrievalChunkRecord,
  GetRetrievalChunkByIdInput,
  ListRetrievalChunksByExtractionDocumentInput,
  ListRetrievalChunksByResourceInput,
  ListRetrievalChunksByScopeInput,
  RetrievalChunkRepository,
} from "./contracts.js";
import {
  RetrievalChunkRepositoryError,
} from "./errors.js";
import {
  mapRetrievalChunkRow,
} from "./mapper.js";

export type CreateRetrievalChunkRepositoryInput = Readonly<{
  client: DatabaseClient;
}>;

const chunkSelectColumns =
  "chunk_id,student_id,resource_id,extraction_document_id,source_block_ids,term_id,subject_id,structure_unit_id,content_kind,text,token_estimate,sanitisation_status,sanitisation_strategy_version,sanitisation_warnings,locator,source_content_hash,chunking_strategy_version,status,sort_order,created_at,updated_at" as const;

export function createRetrievalChunkRepository(
  input: CreateRetrievalChunkRepositoryInput,
): RetrievalChunkRepository {
  return {
    createRetrievalChunk: async (
      chunk: CreateRetrievalChunkInput,
    ): Promise<DbRetrievalChunkRecord> => {
      assertValidChunkInput(chunk);

      const { data, error } = await input.client
        .from("chunks")
        .insert(mapCreateChunkInputToInsert(chunk))
        .select(chunkSelectColumns)
        .single();

      if (error !== null) {
        throw new RetrievalChunkRepositoryError(
          "retrieval_chunk_repository_create_failed",
          error.message,
        );
      }

      return mapRetrievalChunkRow(data);
    },

    createRetrievalChunks: async (
      batch: CreateRetrievalChunksInput,
    ): Promise<readonly DbRetrievalChunkRecord[]> => {
      for (const chunk of batch.chunks) {
        assertValidChunkInput(chunk);
      }

      if (batch.chunks.length === 0) {
        return [];
      }

      const { data, error } = await input.client
        .from("chunks")
        .insert(batch.chunks.map(mapCreateChunkInputToInsert))
        .select(chunkSelectColumns);

      if (error !== null) {
        throw new RetrievalChunkRepositoryError(
          "retrieval_chunk_repository_create_failed",
          error.message,
        );
      }

      return data.map(mapRetrievalChunkRow);
    },

    getRetrievalChunkById: async (
      lookup: GetRetrievalChunkByIdInput,
    ): Promise<DbRetrievalChunkRecord | null> => {
      const { data, error } = await input.client
        .from("chunks")
        .select(chunkSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("chunk_id", lookup.chunkId)
        .maybeSingle();

      if (error !== null) {
        throw new RetrievalChunkRepositoryError(
          "retrieval_chunk_repository_read_failed",
          error.message,
        );
      }

      return data === null ? null : mapRetrievalChunkRow(data);
    },

    listRetrievalChunksByResource: async (
      lookup: ListRetrievalChunksByResourceInput,
    ): Promise<readonly DbRetrievalChunkRecord[]> => {
      const { data, error } = await input.client
        .from("chunks")
        .select(chunkSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("resource_id", lookup.resourceId)
        .eq("status", lookup.status)
        .order("sort_order", { ascending: true })
        .order("chunk_id", { ascending: true });

      if (error !== null) {
        throw new RetrievalChunkRepositoryError(
          "retrieval_chunk_repository_read_failed",
          error.message,
        );
      }

      return data.map(mapRetrievalChunkRow);
    },

    listRetrievalChunksByExtractionDocument: async (
      lookup: ListRetrievalChunksByExtractionDocumentInput,
    ): Promise<readonly DbRetrievalChunkRecord[]> => {
      const { data, error } = await input.client
        .from("chunks")
        .select(chunkSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("extraction_document_id", lookup.extractionDocumentId)
        .eq("status", lookup.status)
        .order("sort_order", { ascending: true })
        .order("chunk_id", { ascending: true });

      if (error !== null) {
        throw new RetrievalChunkRepositoryError(
          "retrieval_chunk_repository_read_failed",
          error.message,
        );
      }

      return data.map(mapRetrievalChunkRow);
    },

    listRetrievalChunksByScope: async (
      lookup: ListRetrievalChunksByScopeInput,
    ): Promise<readonly DbRetrievalChunkRecord[]> => {
      let query = input.client
        .from("chunks")
        .select(chunkSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("status", lookup.status);

      if (lookup.termId === null) {
        query = query.is("term_id", null);
      } else {
        query = query.eq("term_id", lookup.termId);
      }

      if (lookup.subjectId === null) {
        query = query.is("subject_id", null);
      } else {
        query = query.eq("subject_id", lookup.subjectId);
      }

      if (lookup.structureUnitId === null) {
        query = query.is("structure_unit_id", null);
      } else {
        query = query.eq("structure_unit_id", lookup.structureUnitId);
      }

      if (lookup.resourceId !== null) {
        query = query.eq("resource_id", lookup.resourceId);
      }

      const { data, error } = await query
        .order("sort_order", { ascending: true })
        .order("chunk_id", { ascending: true });

      if (error !== null) {
        throw new RetrievalChunkRepositoryError(
          "retrieval_chunk_repository_read_failed",
          error.message,
        );
      }

      return data.map(mapRetrievalChunkRow);
    },
  };
}

function mapCreateChunkInputToInsert(
  chunk: CreateRetrievalChunkInput,
): Readonly<{
  chunk_id: string;
  student_id: string;
  resource_id: string;
  extraction_document_id: string;
  source_block_ids: string[];
  term_id: string | null;
  subject_id: string | null;
  structure_unit_id: string | null;
  content_kind: CreateRetrievalChunkInput["contentKind"];
  text: string;
  token_estimate: number;
  sanitisation_status: CreateRetrievalChunkInput["sanitisationStatus"];
  sanitisation_strategy_version: string;
  sanitisation_warnings: Json;
  locator: Json;
  source_content_hash: string;
  chunking_strategy_version: string;
  sort_order: number;
}> {
  return {
    chunk_id: chunk.chunkId,
    student_id: chunk.studentId,
    resource_id: chunk.resourceId,
    extraction_document_id: chunk.extractionDocumentId,
    source_block_ids: [...chunk.sourceBlockIds],
    term_id: chunk.termId,
    subject_id: chunk.subjectId,
    structure_unit_id: chunk.structureUnitId,
    content_kind: chunk.contentKind,
    text: chunk.text,
    token_estimate: chunk.tokenEstimate,
    sanitisation_status: chunk.sanitisationStatus,
    sanitisation_strategy_version: chunk.sanitisationStrategyVersion,
    sanitisation_warnings: [...chunk.sanitisationWarnings] as Json,
    locator: chunk.locator as unknown as Json,
    source_content_hash: chunk.sourceContentHash,
    chunking_strategy_version: chunk.chunkingStrategyVersion,
    sort_order: chunk.sortOrder,
  };
}

function assertValidChunkInput(input: CreateRetrievalChunkInput): void {
  if (input.sourceBlockIds.length === 0) {
    throw new RetrievalChunkRepositoryError(
      "retrieval_chunk_repository_invalid_chunk",
      "Retrieval chunk requires at least one source block id.",
    );
  }

  if (input.text.trim().length === 0) {
    throw new RetrievalChunkRepositoryError(
      "retrieval_chunk_repository_invalid_chunk",
      "Retrieval chunk text must not be empty.",
    );
  }

  if (!Number.isSafeInteger(input.tokenEstimate) || input.tokenEstimate < 0) {
    throw new RetrievalChunkRepositoryError(
      "retrieval_chunk_repository_invalid_chunk",
      "Retrieval chunk token estimate must be a non-negative integer.",
    );
  }

  if (input.sanitisationStrategyVersion.trim().length === 0) {
    throw new RetrievalChunkRepositoryError(
      "retrieval_chunk_repository_invalid_chunk",
      "Retrieval chunk requires a sanitisation strategy version.",
    );
  }

  if (input.sourceContentHash.trim().length === 0) {
    throw new RetrievalChunkRepositoryError(
      "retrieval_chunk_repository_invalid_chunk",
      "Retrieval chunk requires a source content hash.",
    );
  }

  if (input.chunkingStrategyVersion.trim().length === 0) {
    throw new RetrievalChunkRepositoryError(
      "retrieval_chunk_repository_invalid_chunk",
      "Retrieval chunk requires a chunking strategy version.",
    );
  }

  if (!Number.isSafeInteger(input.sortOrder) || input.sortOrder < 0) {
    throw new RetrievalChunkRepositoryError(
      "retrieval_chunk_repository_invalid_chunk",
      "Retrieval chunk sort order must be a non-negative integer.",
    );
  }
}