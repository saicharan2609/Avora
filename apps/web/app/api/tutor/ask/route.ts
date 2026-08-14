import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  askTutorRequestBodySchema,
  askTutorResponseBodySchema,
} from "@avora/core/contracts/tutor";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

import {
  resolveAuthenticatedTutorApiStudent,
} from "../_shared/auth";
import {
  createWebTutorApiComposition,
  readWebTutorApiEnvironment,
} from "../_shared/composition";
import {
  createInvalidTutorRequestError,
  mapTutorApiError,
} from "../_shared/errors";
import {
  createJsonResponse,
  createTutorErrorResponse,
  formatZodError,
} from "../_shared/json";
import {
  mapAskTutorRequestToTutorQuery,
  serializeTutorGatewayResponse,
} from "../_shared/mapper";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const environment = readWebTutorApiEnvironment();

  try {
    const rawBody = await readJsonBody(request);
    const parsedBody = askTutorRequestBodySchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return createTutorErrorResponse(
        createInvalidTutorRequestError(formatZodError(parsedBody.error)),
      );
    }

    const authenticatedStudent = await resolveAuthenticatedTutorApiStudent({
      request,
      environment,
    });

    const composition = createWebTutorApiComposition({
      environment,
      authenticatedStudent,
    });

    const tutorQuery = mapAskTutorRequestToTutorQuery({
      body: parsedBody.data,
      studentId: authenticatedStudent.studentId,
      createdAt: new Date().toISOString() as IsoDateTimeString,
    });

    const gatewayResponse =
      await composition.tutorGateway.answerTutorQuery(tutorQuery);
    const responseBody = serializeTutorGatewayResponse(gatewayResponse);
    const parsedResponseBody = askTutorResponseBodySchema.parse(responseBody);

    return createJsonResponse(parsedResponseBody, 200);
  } catch (error) {
    return createTutorErrorResponse(mapTutorApiError(error));
  }
}

async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}