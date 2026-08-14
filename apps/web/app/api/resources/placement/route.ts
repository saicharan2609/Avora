import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type {
  AcademicTermId,
  StructureUnitId,
  SubjectId,
} from "@avora/domain/academic";
import {
  resourcePlacementsByAcademicUnitQuerySchema,
  resourcePlacementsByAcademicUnitResponseBodySchema,
} from "@avora/core/contracts/resources/placement";

import { resolveAuthenticatedStudent } from "../_shared/authenticated-student";
import {
  createResourcePlacementInvalidRequestError,
  mapResourcePlacementError,
} from "../_shared/resource-placement-errors";
import { createResourcePlacementErrorResponse } from "../_shared/resource-placement-json";
import {
  createJsonResponse,
  formatZodError,
} from "../_shared/json";
import {
  createWebResourcePlacementService,
  readWebResourcePlacementEnvironment,
} from "../_shared/resource-placement-composition";
import {
  serializeResourcePlacementsByAcademicUnit,
} from "../_shared/resource-placement-serializer";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const environment = readWebResourcePlacementEnvironment();

  try {
    const parsedQuery = resourcePlacementsByAcademicUnitQuerySchema.safeParse({
      termId: request.nextUrl.searchParams.get("termId") ?? undefined,
      subjectId: request.nextUrl.searchParams.get("subjectId") ?? undefined,
      structureUnitId: request.nextUrl.searchParams.get("structureUnitId") ?? undefined,
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

    const placements = await service.listResourcePlacementsByAcademicUnit({
      studentId: authenticatedStudent.studentId,
      target: {
        termId: parsedQuery.data.termId as AcademicTermId,
        subjectId:
          parsedQuery.data.subjectId === undefined
            ? null
            : parsedQuery.data.subjectId as SubjectId,
        structureUnitId:
          parsedQuery.data.structureUnitId === undefined
            ? null
            : parsedQuery.data.structureUnitId as StructureUnitId,
      },
    });

    const responseBody = serializeResourcePlacementsByAcademicUnit(placements);
    const parsedResponseBody =
      resourcePlacementsByAcademicUnitResponseBodySchema.parse(responseBody);

    return createJsonResponse(parsedResponseBody, 200);
  } catch (error) {
    return createResourcePlacementErrorResponse(mapResourcePlacementError(error));
  }
}