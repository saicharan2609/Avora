import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  ResourceProcessingStatusApiProcessingStatus,
} from "@avora/core/contracts/resources";
import {
  createStudentDatabaseClient,
} from "@avora/db/client";
import {
  createResourceExtractionRepository,
} from "@avora/db/repositories/extraction";
import type {
  DbResourceExtractedContentBlockRecord,
  DbResourceExtractedPageRecord,
  DbResourceExtractionDocumentRecord,
  DbResourceExtractionFailureRecord,
  DbResourceExtractionProvenanceRecord,
  ResourceExtractionRepository,
} from "@avora/db/repositories/extraction";
import {
  createResourcesRepository,
} from "@avora/db/repositories/resources";
import type {
  DbResourceRecord,
  ResourcesRepository,
} from "@avora/db/repositories/resources";

import type {
  AuthenticatedStudent,
} from "./authenticated-student";
import {
  WebResourceProcessingStatusNotFoundError,
} from "./resource-processing-status-errors";

export type WebResourceProcessingStatusEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

export type WebResourceProcessingStatus = Readonly<{
  resource: DbResourceRecord;
  processing: Readonly<{
    status: ResourceProcessingStatusApiProcessingStatus;
    terminal: boolean;
  }>;
  extraction: DbResourceExtractionDocumentRecord | null;
  pages: readonly DbResourceExtractedPageRecord[];
  blocks: readonly DbResourceExtractedContentBlockRecord[];
  failures: readonly DbResourceExtractionFailureRecord[];
  provenance: readonly DbResourceExtractionProvenanceRecord[];
}>;

export type WebResourceProcessingStatusService = Readonly<{
  getResourceProcessingStatus: (
    input: GetWebResourceProcessingStatusInput,
  ) => Promise<WebResourceProcessingStatus>;
}>;

export type GetWebResourceProcessingStatusInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type CreateWebResourceProcessingStatusServiceInput = Readonly<{
  resourcesRepository: ResourcesRepository;
  extractionRepository: ResourceExtractionRepository;
}>;

export function readWebResourceProcessingStatusEnvironment():
  WebResourceProcessingStatusEnvironment {
  return {
    supabaseUrl: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function createWebResourceProcessingStatusService(
  input: CreateWebResourceProcessingStatusServiceInput,
): WebResourceProcessingStatusService {
  return {
    getResourceProcessingStatus: async (
      statusInput: GetWebResourceProcessingStatusInput,
    ): Promise<WebResourceProcessingStatus> => {
      const resource = await input.resourcesRepository.getById({
        studentId: statusInput.studentId,
        resourceId: statusInput.resourceId,
      });

      if (resource === null) {
        throw new WebResourceProcessingStatusNotFoundError(
          "Resource was not found for the authenticated student.",
        );
      }

      const extractionDocuments =
        await input.extractionRepository.listResourceExtractionDocumentsByResource({
          studentId: statusInput.studentId,
          resourceId: statusInput.resourceId,
        });

      const extraction = extractionDocuments[0] ?? null;

      if (extraction === null) {
        return {
          resource,
          processing: deriveProcessingStatus({
            resource,
            extraction: null,
          }),
          extraction: null,
          pages: [],
          blocks: [],
          failures: [],
          provenance: [],
        };
      }

      const [
        pages,
        blocks,
        failures,
        provenance,
      ] = await Promise.all([
        input.extractionRepository.listResourceExtractedPages({
          studentId: statusInput.studentId,
          extractionDocumentId: extraction.extractionDocumentId,
        }),
        input.extractionRepository.listResourceExtractedContentBlocks({
          studentId: statusInput.studentId,
          extractionDocumentId: extraction.extractionDocumentId,
        }),
        input.extractionRepository.listResourceExtractionFailures({
          studentId: statusInput.studentId,
          extractionDocumentId: extraction.extractionDocumentId,
        }),
        input.extractionRepository.listResourceExtractionProvenance({
          studentId: statusInput.studentId,
          extractionDocumentId: extraction.extractionDocumentId,
        }),
      ]);

      return {
        resource,
        processing: deriveProcessingStatus({
          resource,
          extraction,
        }),
        extraction,
        pages,
        blocks,
        failures,
        provenance,
      };
    },
  };
}

export function createWebResourceProcessingStatusComposition(
  input: Readonly<{
    environment: WebResourceProcessingStatusEnvironment;
    authenticatedStudent: AuthenticatedStudent;
  }>,
): WebResourceProcessingStatusService {
  const studentDatabase = createStudentDatabaseClient({
    supabaseUrl: input.environment.supabaseUrl,
    supabaseAnonKey: input.environment.supabaseAnonKey,
    accessToken: input.authenticatedStudent.accessToken,
  });

  return createWebResourceProcessingStatusService({
    resourcesRepository: createResourcesRepository({
      client: studentDatabase.client,
    }),
    extractionRepository: createResourceExtractionRepository({
      client: studentDatabase.client,
    }),
  });
}

function deriveProcessingStatus(
  input: Readonly<{
    resource: DbResourceRecord;
    extraction: DbResourceExtractionDocumentRecord | null;
  }>,
): WebResourceProcessingStatus["processing"] {
  if (input.resource.lifecycleState === "pending_upload") {
    return {
      status: "not_started",
      terminal: false,
    };
  }

  if (input.resource.lifecycleState === "uploaded") {
    return {
      status: "uploaded",
      terminal: false,
    };
  }

  if (input.resource.lifecycleState === "processing") {
    return {
      status: "processing",
      terminal: false,
    };
  }

  if (input.resource.lifecycleState === "rejected") {
    return {
      status: "rejected",
      terminal: true,
    };
  }

  if (input.resource.lifecycleState === "failed") {
    return {
      status: "failed",
      terminal: true,
    };
  }

  if (input.resource.lifecycleState === "ready") {
    if (input.extraction?.status === "partially_extracted") {
      return {
        status: "partially_ready",
        terminal: true,
      };
    }

    if (input.extraction?.status === "failed") {
      return {
        status: "failed",
        terminal: true,
      };
    }

    return {
      status: "ready",
      terminal: true,
    };
  }

  return {
    status: "failed",
    terminal: true,
  };
}

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(
      `Missing required web resource processing status environment variable: ${name}`,
    );
  }

  return value;
}