import { NextResponse, type NextRequest } from "next/server";

import {
  academicApiInternalError,
  academicApiUnauthorized,
} from "../_shared/academic-api-errors";
import { resolveAuthenticatedAcademicApiStudent } from "../_shared/academic-api-auth";
import { createAcademicApiComposition } from "../_shared/academic-composition";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authenticatedStudent = await resolveAuthenticatedAcademicApiStudent(request);

    if (authenticatedStudent === null) {
      return academicApiUnauthorized();
    }

    const academic = createAcademicApiComposition({
      client: authenticatedStudent.client,
    });

    const response = await academic.getStructureTree(authenticatedStudent.studentId);

    return NextResponse.json(response);
  } catch {
    return academicApiInternalError();
  }
}