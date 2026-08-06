import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  declareResourceUploadRequestBodySchema,
  declareResourceUploadResponseBodySchema,
} from "@avora/core/contracts/resources";

import { resolveAuthenticatedStudent } from "../_shared/authenticated-student";
import {
  createInvalidRequestError,
  mapResourceUploadError,
} from "../_shared/errors";
import {
  createErrorResponse,
  createJsonResponse,
  formatZodError,
} from "../_shared/json";
import {
  createWebResourceUploadComposition,
  readWebResourceUploadEnvironment,
} from "../_shared/resource-upload-composition";
import { serializeDeclareResourceUploadResult } from "../_shared/resource-upload-serializer";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const environment = readWebResourceUploadEnvironment();

  try {
    const rawBody = await readJsonBody(request);
    const parsedBody = declareResourceUploadRequestBodySchema.safeParse(rawBody);

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

    const result = await service.declareUpload({
      studentId: authenticatedStudent.studentId,
      kind: parsedBody.data.kind,
      originalFilename: parsedBody.data.originalFilename,
      declaredMimeType: parsedBody.data.declaredMimeType,
      byteSize: parsedBody.data.byteSize,
    });

    const responseBody = serializeDeclareResourceUploadResult(result);
    const parsedResponseBody = declareResourceUploadResponseBodySchema.parse(responseBody);

    return createJsonResponse(parsedResponseBody, 201);
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