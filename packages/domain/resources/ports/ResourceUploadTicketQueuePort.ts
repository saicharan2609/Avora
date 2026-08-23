import type {
  ResourceUploadTicketJobAccepted,
  ResourceUploadTicketJobRequest,
} from "../jobs/index.js";

export type ResourceUploadTicketEnqueueInput = ResourceUploadTicketJobRequest;

export type ResourceUploadTicketEnqueueResult = ResourceUploadTicketJobAccepted;

export type ResourceUploadTicketQueuePort = Readonly<{
  enqueueResourceUploadTicket: (
    input: ResourceUploadTicketEnqueueInput,
  ) => Promise<ResourceUploadTicketEnqueueResult>;
}>;
