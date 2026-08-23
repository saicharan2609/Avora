import type { JobId, ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

export const resourceUploadTicketJobName = "resource.upload_ticket.create" as const;

export const resourceUploadTicketJobReasons = [
  "upload_declared",
] as const;

export type ResourceUploadTicketJobReason = (typeof resourceUploadTicketJobReasons)[number];

export const resourceUploadTicketJobPriorities = [
  "interactive",
  "normal",
  "backfill",
] as const;

export type ResourceUploadTicketJobPriority = (typeof resourceUploadTicketJobPriorities)[number];

export type ResourceUploadTicketJobPayload = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
  bucket: "quarantine";
  objectPath: string;
  version: number;
  byteSize: number;
  declaredMimeType: string;
}>;

export type ResourceUploadTicketJobRequest = Readonly<{
  name: typeof resourceUploadTicketJobName;
  reason: ResourceUploadTicketJobReason;
  priority: ResourceUploadTicketJobPriority;
  payload: ResourceUploadTicketJobPayload;
}>;

export type ResourceUploadTicketJobAccepted = Readonly<{
  jobId: JobId;
  enqueuedAt: IsoDateTimeString;
}>;
