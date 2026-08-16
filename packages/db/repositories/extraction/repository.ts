import type { DatabaseClient } from "../../client/index.js";
import type { Json } from "../../generated/database.types.js";
import type {
  CreateResourceExtractedContentBlockInput,
  CreateResourceExtractedPageInput,
  CreateResourceExtractionDocumentCheckpointInput,
  CreateResourceExtractionDocumentInput,
  CreateResourceExtractionDocumentWithBlocksInput,
  CreateResourceExtractionFailureInput,
  CreateResourceExtractionProvenanceInput,
  DbResourceExtractedContentBlockRecord,
  DbResourceExtractedPageRecord,
  DbResourceExtractionDocumentRecord,
  DbResourceExtractionDocumentTree,
  DbResourceExtractionDocumentWithBlocks,
  DbResourceExtractionFailureRecord,
  DbResourceExtractionProvenanceRecord,
  GetResourceExtractionDocumentByIdInput,
  ListResourceExtractedContentBlocksInput,
  ListResourceExtractedPagesInput,
  ListResourceExtractionDocumentsByResourceInput,
  ListResourceExtractionFailuresInput,
  ListResourceExtractionProvenanceInput,
  ResourceExtractionRepository,
} from "./contracts.js";
import {
  ResourceExtractionRepositoryError,
} from "./errors.js";
import {
  buildResourceExtractedContentBlockTree,
  mapResourceExtractedContentBlockRow,
  mapResourceExtractedPageRow,
  mapResourceExtractionDocumentRow,
  mapResourceExtractionFailureRow,
  mapResourceExtractionProvenanceRow,
} from "./mapper.js";

export type CreateResourceExtractionRepositoryInput = Readonly<{
  client: DatabaseClient;
}>;

const resourceExtractionDocumentSelectColumns =
  "extraction_document_id,student_id,resource_id,status,extraction_strategy_version,chunking_strategy_version,extracted_at,created_at,updated_at" as const;

const resourceExtractedContentBlockSelectColumns =
  "block_id,extraction_document_id,student_id,resource_id,kind,text,locator,sort_order,parent_block_id,confidence,created_at,updated_at" as const;

const resourceExtractionProvenanceSelectColumns =
  "provenance_id,extraction_document_id,student_id,resource_id,page_number,source,strategy_version,extracted_at,notes,created_at" as const;

const resourceExtractedPageSelectColumns =
  "page_id,extraction_document_id,student_id,resource_id,provenance_id,page_number,text,locator,confidence,created_at,updated_at" as const;

const resourceExtractionFailureSelectColumns =
  "failure_id,extraction_document_id,student_id,resource_id,provenance_id,code,page_number,message,created_at" as const;

export function createResourceExtractionRepository(
  input: CreateResourceExtractionRepositoryInput,
): ResourceExtractionRepository {
  return {
    createResourceExtractionProvenance: async (
      provenance: CreateResourceExtractionProvenanceInput,
    ): Promise<DbResourceExtractionProvenanceRecord> => {
      assertValidProvenanceInput(provenance);

      const { data, error } = await input.client
        .from("resource_extraction_provenance")
        .insert({
          provenance_id: provenance.provenanceId,
          extraction_document_id: provenance.extractionDocumentId,
          student_id: provenance.studentId,
          resource_id: provenance.resourceId,
          page_number: provenance.pageNumber,
          source: provenance.source,
          strategy_version: provenance.strategyVersion,
          extracted_at: provenance.extractedAt,
          notes: provenance.notes,
        })
        .select(resourceExtractionProvenanceSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_create_document_failed",
          error.message,
        );
      }

      return mapResourceExtractionProvenanceRow(data);
    },

    createResourceExtractedPages: async (
      pages: readonly CreateResourceExtractedPageInput[],
    ): Promise<readonly DbResourceExtractedPageRecord[]> => {
      for (const page of pages) {
        assertValidPageInput(page);
      }

      if (pages.length === 0) {
        return [];
      }

      const { data, error } = await input.client
        .from("resource_extracted_pages")
        .insert(
          pages.map((page) => ({
            page_id: page.pageId,
            extraction_document_id: page.extractionDocumentId,
            student_id: page.studentId,
            resource_id: page.resourceId,
            provenance_id: page.provenanceId,
            page_number: page.pageNumber,
            text: page.text,
            locator: page.locator as unknown as Json,
            confidence: page.confidence,
          })),
        )
        .select(resourceExtractedPageSelectColumns);

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_create_blocks_failed",
          error.message,
        );
      }

      return data.map(mapResourceExtractedPageRow);
    },

    createResourceExtractionFailures: async (
      failures: readonly CreateResourceExtractionFailureInput[],
    ): Promise<readonly DbResourceExtractionFailureRecord[]> => {
      for (const failure of failures) {
        assertValidFailureInput(failure);
      }

      if (failures.length === 0) {
        return [];
      }

      const { data, error } = await input.client
        .from("resource_extraction_failures")
        .insert(
          failures.map((failure) => ({
            failure_id: failure.failureId,
            extraction_document_id: failure.extractionDocumentId,
            student_id: failure.studentId,
            resource_id: failure.resourceId,
            provenance_id: failure.provenanceId,
            code: failure.code,
            page_number: failure.pageNumber,
            message: failure.message,
          })),
        )
        .select(resourceExtractionFailureSelectColumns);

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_create_blocks_failed",
          error.message,
        );
      }

      return data.map(mapResourceExtractionFailureRow);
    },

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

    createResourceExtractionDocumentCheckpoint: async (
      document: CreateResourceExtractionDocumentCheckpointInput,
    ): Promise<DbResourceExtractionDocumentRecord> => {
      assertValidDocumentInput(document);

      const checkpoint = {
        studentId: document.studentId,
        resourceId: document.resourceId,
        extractionStrategyVersion: document.extractionStrategyVersion,
        chunkingStrategyVersion: document.chunkingStrategyVersion,
      } as const;

      const { data, error } = await input.client
        .from("resource_extraction_documents")
        .upsert(
          {
            extraction_document_id: document.extractionDocumentId,
            student_id: document.studentId,
            resource_id: document.resourceId,
            status: document.status,
            extraction_strategy_version: document.extractionStrategyVersion,
            chunking_strategy_version: document.chunkingStrategyVersion,
            extracted_at: document.extractedAt,
          },
          {
            onConflict:
              "student_id,resource_id,extraction_strategy_version,chunking_strategy_version",
            ignoreDuplicates: true,
          },
        )
        .select(resourceExtractionDocumentSelectColumns)
        .maybeSingle();

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_create_document_failed",
          error.message,
        );
      }

      if (data !== null) {
        return mapResourceExtractionDocumentRow(data);
      }

      return readResourceExtractionDocumentCheckpoint({
        client: input.client,
        checkpoint,
      });
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

    listResourceExtractionProvenance: async (
      lookup: ListResourceExtractionProvenanceInput,
    ): Promise<readonly DbResourceExtractionProvenanceRecord[]> => {
      const { data, error } = await input.client
        .from("resource_extraction_provenance")
        .select(resourceExtractionProvenanceSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("extraction_document_id", lookup.extractionDocumentId)
        .order("page_number", { ascending: true, nullsFirst: true })
        .order("created_at", { ascending: true })
        .order("provenance_id", { ascending: true });

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_read_documents_failed",
          error.message,
        );
      }

      return data.map(mapResourceExtractionProvenanceRow);
    },

    listResourceExtractedPages: async (
      lookup: ListResourceExtractedPagesInput,
    ): Promise<readonly DbResourceExtractedPageRecord[]> => {
      const { data, error } = await input.client
        .from("resource_extracted_pages")
        .select(resourceExtractedPageSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("extraction_document_id", lookup.extractionDocumentId)
        .order("page_number", { ascending: true })
        .order("page_id", { ascending: true });

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_read_blocks_failed",
          error.message,
        );
      }

      return data.map(mapResourceExtractedPageRow);
    },

    listResourceExtractionFailures: async (
      lookup: ListResourceExtractionFailuresInput,
    ): Promise<readonly DbResourceExtractionFailureRecord[]> => {
      const { data, error } = await input.client
        .from("resource_extraction_failures")
        .select(resourceExtractionFailureSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("extraction_document_id", lookup.extractionDocumentId)
        .order("page_number", { ascending: true, nullsFirst: true })
        .order("created_at", { ascending: true })
        .order("failure_id", { ascending: true });

      if (error !== null) {
        throw new ResourceExtractionRepositoryError(
          "resource_extraction_repository_read_blocks_failed",
          error.message,
        );
      }

      return data.map(mapResourceExtractionFailureRow);
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

async function readResourceExtractionDocumentCheckpoint(input: Readonly<{
  client: DatabaseClient;
  checkpoint: Readonly<{
    studentId: CreateResourceExtractionDocumentCheckpointInput["studentId"];
    resourceId: CreateResourceExtractionDocumentCheckpointInput["resourceId"];
    extractionStrategyVersion: CreateResourceExtractionDocumentCheckpointInput["extractionStrategyVersion"];
    chunkingStrategyVersion: CreateResourceExtractionDocumentCheckpointInput["chunkingStrategyVersion"];
  }>;
}>): Promise<DbResourceExtractionDocumentRecord> {
  const { data, error } = await input.client
    .from("resource_extraction_documents")
    .select(resourceExtractionDocumentSelectColumns)
    .eq("student_id", input.checkpoint.studentId)
    .eq("resource_id", input.checkpoint.resourceId)
    .eq(
      "extraction_strategy_version",
      input.checkpoint.extractionStrategyVersion,
    )
    .eq(
      "chunking_strategy_version",
      input.checkpoint.chunkingStrategyVersion,
    )
    .single();

  if (error !== null) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_read_documents_failed",
      error.message,
    );
  }

  return mapResourceExtractionDocumentRow(data);
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

function assertValidProvenanceInput(
  input: CreateResourceExtractionProvenanceInput,
): void {
  if (
    input.pageNumber !== null
    && (!Number.isSafeInteger(input.pageNumber) || input.pageNumber <= 0)
  ) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_document",
      "Resource extraction provenance page number must be a positive integer.",
    );
  }

  if (input.strategyVersion.length === 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_document",
      "Resource extraction provenance requires a strategy version.",
    );
  }

  if (input.extractedAt.length === 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_document",
      "Resource extraction provenance requires an extracted-at timestamp.",
    );
  }

  if (input.notes !== null && input.notes.trim().length === 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_document",
      "Resource extraction provenance notes must not be blank.",
    );
  }
}

function assertValidPageInput(input: CreateResourceExtractedPageInput): void {
  if (!Number.isSafeInteger(input.pageNumber) || input.pageNumber <= 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_block",
      "Resource extracted page number must be a positive integer.",
    );
  }

  if (input.text.trim().length === 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_block",
      "Resource extracted page text must not be empty.",
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
      "Resource extracted page confidence must be between 0 and 1.",
    );
  }
}

function assertValidFailureInput(
  input: CreateResourceExtractionFailureInput,
): void {
  if (
    input.pageNumber !== null
    && (!Number.isSafeInteger(input.pageNumber) || input.pageNumber <= 0)
  ) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_block",
      "Resource extraction failure page number must be a positive integer.",
    );
  }

  if (input.code === "unsupported_page" && input.pageNumber === null) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_block",
      "Unsupported-page extraction failure requires a page number.",
    );
  }

  if (input.message.trim().length === 0) {
    throw new ResourceExtractionRepositoryError(
      "resource_extraction_repository_invalid_block",
      "Resource extraction failure message must not be empty.",
    );
  }
}