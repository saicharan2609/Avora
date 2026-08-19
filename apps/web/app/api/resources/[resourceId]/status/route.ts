import { NextResponse } from "next/server";
import type {
  NextRequest,
} from "next/server";

import type {
  ResourceId,
} from "@avora/core/identity";
import {
  resourceProcessingStatusPathParamsSchema,
  resourceProcessingStatusResponseBodySchema,
} from "@avora/core/contracts/resources";

import {
  resolveAuthenticatedStudent,
} from "../../_shared/authenticated-student";
import {
  createJsonResponse,
  formatZodError,
} from "../../_shared/json";
import {
  createResourceProcessingStatusInvalidRequestError,
  mapResourceProcessingStatusError,
} from "../../_shared/resource-processing-status-errors";
import {
  createResourceProcessingStatusErrorResponse,
} from "../../_shared/resource-processing-status-json";
import {
  createWebResourceProcessingStatusComposition,
  readWebResourceProcessingStatusEnvironment,
} from "../../_shared/resource-processing-status-composition";
import {
  serializeResourceProcessingStatus,
} from "../../_shared/resource-processing-status-serializer";

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
  const environment = readWebResourceProcessingStatusEnvironment();

  try {
    const params = await context.params;
    const parsedParams = resourceProcessingStatusPathParamsSchema.safeParse({
      resourceId: params.resourceId,
    });

    if (!parsedParams.success) {
      return createResourceProcessingStatusErrorResponse(
        createResourceProcessingStatusInvalidRequestError(
          formatZodError(parsedParams.error),
        ),
      );
    }

    const authenticatedStudent = await resolveAuthenticatedStudent({
      request,
      environment,
    });

    const service = createWebResourceProcessingStatusComposition({
      environment,
      authenticatedStudent,
    });

    const status = await service.getResourceProcessingStatus({
      studentId: authenticatedStudent.studentId,
      resourceId: parsedParams.data.resourceId as ResourceId,
    });

    const responseBody = serializeResourceProcessingStatus(status);
    const parsedResponseBody =
      resourceProcessingStatusResponseBodySchema.parse(responseBody);

    return createJsonResponse(parsedResponseBody, 200);
  } catch (error) {
    return createResourceProcessingStatusErrorResponse(
      mapResourceProcessingStatusError(error),
    );
  }
}