import type { DatabaseClient } from "../../client/index.js";
import type { Json } from "../../generated/database.types.js";
import type {
  CreateResourceExtractedContentBlockInput,
  CreateResourceExtractionDocumentInput,
  CreateResourceExtractionDocumentWithBlocksInput,
  DbResourceExtractedContentBlockRecord,
  DbResourceExtractionDocumentRecord,
  DbResourceExtractionDocumentTree,
  DbResourceExtractionDocumentWithBlocks,
  GetResourceExtractionDocumentByIdInput,
  ListResourceExtractedContentBlocksInput,
  ListResourceExtractionDocumentsByResourceInput,
  ResourceExtractionRepository,
} from "./contracts.js";
import {
  ResourceExtractionRepositoryError,
} from "./errors.js";
import {
  buildResourceExtractedContentBlockTree,
  mapResourceExtractedContentBlockRow,
  mapResourceExtractionDocumentRow,
} from "./mapper.js";

export type CreateResourceExtractionRepositoryInput = Readonly<{
  client: DatabaseClient;
}>;

const resourceExtractionDocumentSelectColumns =
  "extraction_document_id,student_id,resource_id,status,extraction_strategy_version,chunking_strategy_version,extracted_at,created_at,updated_at" as const;

const resourceExtractedContentBlockSelectColumns =
  "block_id,extraction_document_id,student_id,resource_id,kind,text,locator,sort_order,parent_block_id,confidence,created_at,updated_at" as const;

export function createResourceExtractionRepository(
  input: CreateResourceExtractionRepositoryInput,
): ResourceExtractionRepository {
  return {
    createResourceExtractionDocument: async (
      document: CreateResourceExtractionDocumentInput,
    ): Promise<DbResourceExtractionDocumentRecord> => {
      assertValidDocumentInput(document);

      const { data, error } = await input.client
        .from("resource_extraction_documents")
        .insert({
          extraction_document_id: document.extractionDocumentId,
          student_id: document.studentId,
          resource_id: document.resourceId,
          status: document.status,
          extraction_strategy_version: document.extractionStrategyVersion,
          chunking_strategy_version: document.chunkingStrategyVersion,
          extracted_at: document.extractedAt,
        })
        .select(resourceExtractionDocumentSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_create_document_failed",
          error.message,
        );
      }

      return mapResourceExtractionDocumentRow(data);
    },

    createResourceExtractedContentBlocks: async (
      blocks: readonly CreateResourceExtractedContentBlockInput[],
    ): Promise<readonly DbResourceExtractedContentBlockRecord[]> => {
      for (const block of blocks) {
        assertValidBlockInput(block);
      }

      if (blocks.length === 0) {
        return [];
      }

      const { data, error } = await input.client
        .from("resource_extracted_content_blocks")
        .insert(
          blocks.map((block) => ({
            block_id: block.blockId,
            extraction_document_id: block.extractionDocumentId,
            student_id: block.studentId,
            resource_id: block.resourceId,
            kind: block.kind,
            text: block.text,
            locator: block.locator as unknown as Json,
            sort_order: block.sortOrder,
            parent_block_id: block.parentBlockId,
            confidence: block.confidence,
          })),
        )
        .select(resourceExtractedContentBlockSelectColumns);

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_create_blocks_failed",
          error.message,
        );
      }

      return data.map(mapResourceExtractedContentBlockRow);
    },

    createResourceExtractionDocumentWithBlocks: async (
      extraction: CreateResourceExtractionDocumentWithBlocksInput,
    ): Promise<DbResourceExtractionDocumentWithBlocks> => {
      const document = await createResourceExtractionRepository(input)
        .createResourceExtractionDocument(extraction.document);

      const blocks = await createResourceExtractionRepository(input)
        .createResourceExtractedContentBlocks(extraction.blocks);

      return {
        document,
        blocks,
      };
    },

    getResourceExtractionDocumentById: async (
      lookup: GetResourceExtractionDocumentByIdInput,
    ): Promise<DbResourceExtractionDocumentRecord | null> => {
      const { data, error } = await input.client
        .from("resource_extraction_documents")
        .select(resourceExtractionDocumentSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("extraction_document_id", lookup.extractionDocumentId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_read_documents_failed",
          error.message,
        );
      }

      return data === null ? null : mapResourceExtractionDocumentRow(data);
    },

    listResourceExtractionDocumentsByResource: async (
      lookup: ListResourceExtractionDocumentsByResourceInput,
    ): Promise<readonly DbResourceExtractionDocumentRecord[]> => {
      const { data, error } = await input.client
        .from("resource_extraction_documents")
        .select(resourceExtractionDocumentSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("resource_id", lookup.resourceId)
        .order("extracted_at", { ascending: false });

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_read_documents_failed",
          error.message,
        );
      }

      return data.map(mapResourceExtractionDocumentRow);
    },

    listResourceExtractedContentBlocks: async (
      lookup: ListResourceExtractedContentBlocksInput,
    ): Promise<readonly DbResourceExtractedContentBlockRecord[]> => {
      const { data, error } = await input.client
        .from("resource_extracted_content_blocks")
        .select(resourceExtractedContentBlockSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("extraction_document_id", lookup.extractionDocumentId)
        .order("sort_order", { ascending: true })
        .order("block_id", { ascending: true });

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_read_blocks_failed",
          error.message,
        );
      }

      return data.map(mapResourceExtractedContentBlockRow);
    },

    getResourceExtractionDocumentTree: async (
      lookup: GetResourceExtractionDocumentByIdInput,
    ): Promise<DbResourceExtractionDocumentTree | null> => {
      const document = await createResourceExtractionRepository(input)
        .getResourceExtractionDocumentById(lookup);

      if (document === null) {
        return null;
      }

      const blocks = await createResourceExtractionRepository(input)
        .listResourceExtractedContentBlocks({
          studentId: lookup.studentId,
          extractionDocumentId: lookup.extractionDocumentId,
        });

      return buildResourceExtractedContentBlockTree({
        document,
        blocks,
      });
    },
  };
}

function assertValidDocumentInput(
  input: CreateResourceExtractionDocumentInput,
): void {
  if (input.extractionStrategyVersion.length === 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_document",
      "Resource extraction document requires an extraction strategy version.",
    );
  }

  if (input.chunkingStrategyVersion.length === 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_document",
      "Resource extraction document requires a chunking strategy version.",
    );
  }

  if (input.extractedAt.length === 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_document",
      "Resource extraction document requires an extracted-at timestamp.",
    );
  }
}

function assertValidBlockInput(
  input: CreateResourceExtractedContentBlockInput,
): void {
  if (input.text.trim().length === 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_block",
      "Resource extracted content block text must not be empty.",
    );
  }

  if (!Number.isSafeInteger(input.sortOrder) || input.sortOrder < 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_block",
      "Resource extracted content block sort order must be a non-negative integer.",
    );
  }

  if (
    input.confidence !== null
    && (
      !Number.isFinite(input.confidence)
      || input.confidence < 0
      || input.confidence > 1
    )
  ) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_block",
      "Resource extracted content block confidence must be between 0 and 1.",
    );
  }

  if (
    input.parentBlockId !== null
    && input.parentBlockId === input.blockId
  ) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_block",
      "Resource extracted content block cannot be its own parent.",
    );
  }
}