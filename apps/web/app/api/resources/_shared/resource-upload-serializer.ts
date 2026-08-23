import type {
  DeclareResourceUploadResponseBody,
  CompleteResourceUploadResponseBody,
  GetResourceUploadTicketResponseBody,
  ResourceUploadApiResource,
  ResourceUploadApiStorageLocation,
  ResourceUploadApiTicket,
  ResourceUploadApiTicketJobStatus,
} from "@avora/core/contracts/resources";
import type {
  DeclareResourceUploadResult,
  CompleteResourceUploadResult,
  ResourceRecord,
  ResourceStorageLocation,
  ResourceUploadTicket,
  ResourceUploadTicketJobAccepted,
} from "@avora/domain/resources";

export function serializeDeclareResourceUploadResult(
  result: DeclareResourceUploadResult,
  ticketJob: ResourceUploadTicketJobAccepted,
): DeclareResourceUploadResponseBody {
  return {
    resource: serializeResource(result.resource),
    ticketJob: {
      jobId: ticketJob.jobId,
      enqueuedAt: ticketJob.enqueuedAt,
    },
  };
}

export function serializeGetResourceUploadTicketResult(
  status: ResourceUploadApiTicketJobStatus,
  ticket: ResourceUploadTicket | null,
): GetResourceUploadTicketResponseBody {
  return {
    status,
    ticket: ticket === null ? null : serializeUploadTicket(ticket),
  };
}

export function serializeCompleteResourceUploadResult(
  result: CompleteResourceUploadResult,
): CompleteResourceUploadResponseBody {
  return {
    resource: serializeResource(result.resource),
  };
}

function serializeResource(resource: ResourceRecord): ResourceUploadApiResource {
  return {
    resourceId: resource.resourceId,
    kind: resource.kind,
    originalFilename: resource.originalFilename,
    declaredMimeType: resource.declaredMimeType,
    byteSize: resource.byteSize,
    contentHash: resource.contentHash,
    lifecycleState: resource.lifecycleState,
    storage: serializeStorageLocation(resource.storage),
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}

function serializeUploadTicket(ticket: ResourceUploadTicket): ResourceUploadApiTicket {
  return {
    resourceId: ticket.resourceId,
    storage: serializeStorageLocation(ticket.storage),
    uploadUrl: ticket.uploadUrl,
    expiresAt: ticket.expiresAt,
  };
}

function serializeStorageLocation(
  storage: ResourceStorageLocation,
): ResourceUploadApiStorageLocation {
  return {
    bucket: storage.bucket,
    objectPath: storage.objectPath,
    version: storage.version,
  };
}