import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { ResourceId } from "@avora/core/identity";
import {
  resourcePlacementCandidatesQuerySchema,
  resourcePlacementCandidatesResponseBodySchema,
} from "@avora/core/contracts/resources/placement";

import { resolveAuthenticatedStudent } from "../../_shared/authenticated-student";
import {
  createResourcePlacementInvalidRequestError,
  mapResourcePlacementError,
} from "../../_shared/resource-placement-errors";
import { createResourcePlacementErrorResponse } from "../../_shared/resource-placement-json";
import {
  createJsonResponse,
  formatZodError,
} from "../../_shared/json";
import {
  createWebResourcePlacementService,
  readWebResourcePlacementEnvironment,
} from "../../_shared/resource-placement-composition";
import { serializePlacementCandidates } from "../../_shared/resource-placement-serializer";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const environment = readWebResourcePlacementEnvironment();

  try {
    const parsedQuery = resourcePlacementCandidatesQuerySchema.safeParse({
      resourceId: request.nextUrl.searchParams.get("resourceId") ?? undefined,
    });

    if (!parsedQuery.success) {
      return createResourcePlacementErrorResponse(
        createResourcePlacementInvalidRequestError(formatZodError(parsedQuery.error)),
      );
    }

    const authenticatedStudent = await resolveAuthenticatedStudent({
      request,
      environment,
    });

    const service = createWebResourcePlacementService({
      environment,
      authenticatedStudent,
    });

    const candidates = await service.listPlacementCandidatesByResource({
      studentId: authenticatedStudent.studentId,
      resourceId: parsedQuery.data.resourceId as ResourceId,
    });

    const responseBody = serializePlacementCandidates(candidates);
    const parsedResponseBody =
      resourcePlacementCandidatesResponseBodySchema.parse(responseBody);

    return createJsonResponse(parsedResponseBody, 200);
  } catch (error) {
    return createResourcePlacementErrorResponse(mapResourcePlacementError(error));
  }
}