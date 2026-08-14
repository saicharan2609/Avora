import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { ResourceId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type {
  AcademicTermId,
  StructureUnitId,
  SubjectId,
} from "@avora/domain/academic";
import type {
  PlacementCorrectionId,
  ResourcePlacementTarget,
} from "@avora/domain/resources";
import {
  createResourcePlacementCorrectionRequestBodySchema,
  createResourcePlacementCorrectionResponseBodySchema,
  type ResourcePlacementApiTarget,
} from "@avora/core/contracts/resources/placement";

import { resolveAuthenticatedStudent } from "../../_shared/authenticated-student";
import {
  createResourcePlacementInvalidRequestError,
  createResourcePlacementNotFoundError,
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
import {
  serializePlacementCorrectionResponse,
} from "../../_shared/resource-placement-serializer";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const environment = readWebResourcePlacementEnvironment();

  try {
    const rawBody = await readJsonBody(request);
    const parsedBody =
      createResourcePlacementCorrectionRequestBodySchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return createResourcePlacementErrorResponse(
        createResourcePlacementInvalidRequestError(formatZodError(parsedBody.error)),
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

    const resourceId = parsedBody.data.resourceId as ResourceId;

    const currentPlacement = await service.getPlacementByResource({
      studentId: authenticatedStudent.studentId,
      resourceId,
    });

    if (currentPlacement === null) {
      return createResourcePlacementErrorResponse(
        createResourcePlacementNotFoundError(
          "No resource placement matched the requested resource.",
        ),
      );
    }

    const correction = await service.recordPlacementCorrection({
      correction: {
        correctionId: randomUUID() as PlacementCorrectionId,
        studentId: authenticatedStudent.studentId,
        resourceId,
        previousTarget: currentPlacement.target,
        correctedTarget: mapApiTargetToDomain(parsedBody.data.correctedTarget),
        reason: parsedBody.data.reason ?? null,
        correctedAt: new Date().toISOString() as IsoDateTimeString,
      },
    });

    const responseBody = serializePlacementCorrectionResponse(correction);
    const parsedResponseBody =
      createResourcePlacementCorrectionResponseBodySchema.parse(responseBody);

    return createJsonResponse(parsedResponseBody, 201);
  } catch (error) {
    return createResourcePlacementErrorResponse(mapResourcePlacementError(error));
  }
}

async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function mapApiTargetToDomain(
  target: ResourcePlacementApiTarget,
): ResourcePlacementTarget {
  return {
    termId: target.termId as AcademicTermId,
    subjectId: target.subjectId as SubjectId,
    structureUnitId:
      target.structureUnitId === null
        ? null
        : target.structureUnitId as StructureUnitId,
  };
}