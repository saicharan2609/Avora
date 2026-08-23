import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { JobId } from "@avora/core/identity";
import {
  getResourceUploadTicketResponseBodySchema,
  resourceUploadApiResourceIdSchema,
} from "@avora/core/contracts/resources";
import { z } from "zod";

import { resolveAuthenticatedStudent } from "../../../_shared/authenticated-student";
import {
  createInvalidRequestError,
  mapResourceUploadError,
} from "../../../_shared/errors";
import {
  createErrorResponse,
  createJsonResponse,
  formatZodError,
} from "../../../_shared/json";
import {
  createWebResourceUploadComposition,
  readWebResourceUploadEnvironment,
} from "../../../_shared/resource-upload-composition";
import { serializeGetResourceUploadTicketResult } from "../../../_shared/resource-upload-serializer";

const jobIdQuerySchema = z.string().uuid();

type RouteContext = Readonly<{
  params: Promise<
    Readonly<{
      resourceId: string;
    }>
  >;
}>;

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const environment = readWebResourceUploadEnvironment();

  try {
    const params = await context.params;
    const parsedResourceId = resourceUploadApiResourceIdSchema.safeParse(params.resourceId);

    if (!parsedResourceId.success) {
      return createErrorResponse(
        createInvalidRequestError(formatZodError(parsedResourceId.error)),
      );
    }

    const rawJobId = request.nextUrl.searchParams.get("jobId");
    const parsedJobId = jobIdQuerySchema.safeParse(rawJobId);

    if (!parsedJobId.success) {
      return createErrorResponse(
        createInvalidRequestError(formatZodError(parsedJobId.error)),
      );
    }

    const authenticatedStudent = await resolveAuthenticatedStudent({
      request,
      environment,
    });

    const service = createWebResourceUploadComposition({
      environment,
      authenticatedStudent,
    });

    const result = await service.getTicket({
      studentId: authenticatedStudent.studentId,
      jobId: parsedJobId.data as JobId,
    });

    const responseBody = serializeGetResourceUploadTicketResult(result.status, result.ticket);
    const parsedResponseBody = getResourceUploadTicketResponseBodySchema.parse(responseBody);

    return createJsonResponse(parsedResponseBody, 200);
  } catch (error) {
    return createErrorResponse(mapResourceUploadError(error));
  }
}
