import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { ResourceId } from "@avora/core/identity";
import {
  completeResourceUploadRequestBodySchema,
  completeResourceUploadResponseBodySchema,
  resourceUploadApiResourceIdSchema,
} from "@avora/core/contracts/resources";

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
import { serializeCompleteResourceUploadResult } from "../../../_shared/resource-upload-serializer";

type RouteContext = Readonly<{
  params: Promise<
    Readonly<{
      resourceId: string;
    }>
  >;
}>;

export async function POST(
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

    const rawBody = await readJsonBody(request);
    const parsedBody = completeResourceUploadRequestBodySchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return createErrorResponse(createInvalidRequestError(formatZodError(parsedBody.error)));
    }

    const authenticatedStudent = await resolveAuthenticatedStudent({
      request,
      environment,
    });

    const service = createWebResourceUploadComposition({
      environment,
      authenticatedStudent,
    });

    const result = await service.completeUpload({
      studentId: authenticatedStudent.studentId,
      resourceId: parsedResourceId.data as ResourceId,
      contentHash: parsedBody.data.contentHash,
    });

    const responseBody = serializeCompleteResourceUploadResult(result);
    const parsedResponseBody = completeResourceUploadResponseBodySchema.parse(responseBody);

    return createJsonResponse(parsedResponseBody, 200);
  } catch (error) {
    return createErrorResponse(mapResourceUploadError(error));
  }
}

async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}