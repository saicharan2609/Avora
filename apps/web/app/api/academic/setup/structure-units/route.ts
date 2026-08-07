import { NextResponse, type NextRequest } from "next/server";

import {
  academicApiInternalError,
  academicApiUnauthorized,
} from "../../_shared/academic-api-errors";
import { resolveAuthenticatedAcademicApiStudent } from "../../_shared/academic-api-auth";
import {
  parseCreateStructureUnitRequest,
  readJsonObject,
} from "../../_shared/academic-api-validation";
import { createAcademicApiComposition } from "../../_shared/academic-composition";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authenticatedStudent = await resolveAuthenticatedAcademicApiStudent(request);

    if (authenticatedStudent === null) {
      return academicApiUnauthorized();
    }

    const body = await readJsonObject(request);
    const academic = createAcademicApiComposition({
      client: authenticatedStudent.client,
    });

    const response = await academic.createStructureUnit(
      authenticatedStudent.studentId,
      parseCreateStructureUnitRequest(body),
    );

    return NextResponse.json(response, {
      status: 201,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }

    return academicApiInternalError();
  }
}