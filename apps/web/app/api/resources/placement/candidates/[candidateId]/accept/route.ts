import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { PlacementCandidateId } from "@avora/domain/resources";
import {
  acceptResourcePlacementCandidatePathParamsSchema,
  acceptResourcePlacementCandidateResponseBodySchema,
} from "@avora/core/contracts/resources/placement";

import { resolveAuthenticatedStudent } from "../../../../_shared/authenticated-student";
import {
  createResourcePlacementInvalidRequestError,
  mapResourcePlacementError,
} from "../../../../_shared/resource-placement-errors";
import { createResourcePlacementErrorResponse } from "../../../../_shared/resource-placement-json";
import {
  createJsonResponse,
  formatZodError,
} from "../../../../_shared/json";
import {
  createWebResourcePlacementService,
  readWebResourcePlacementEnvironment,
} from "../../../../_shared/resource-placement-composition";
import {
  serializeAcceptPlacementCandidateResult,
} from "../../../../_shared/resource-placement-serializer";

type RouteContext = Readonly<{
  params: Promise<
    Readonly<{
      candidateId: string;
    }>
  >;
}>;

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const environment = readWebResourcePlacementEnvironment();

  try {
    const params = await context.params;
    const parsedParams =
      acceptResourcePlacementCandidatePathParamsSchema.safeParse(params);

    if (!parsedParams.success) {
      return createResourcePlacementErrorResponse(
        createResourcePlacementInvalidRequestError(formatZodError(parsedParams.error)),
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

    const result = await service.acceptPlacementCandidate({
      studentId: authenticatedStudent.studentId,
      candidateId: parsedParams.data.candidateId as PlacementCandidateId,
    });

    const responseBody = serializeAcceptPlacementCandidateResult(result);
    const parsedResponseBody =
      acceptResourcePlacementCandidateResponseBodySchema.parse(responseBody);

    return createJsonResponse(parsedResponseBody, 200);
  } catch (error) {
    return createResourcePlacementErrorResponse(mapResourcePlacementError(error));
  }
}