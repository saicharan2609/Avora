import { z } from "zod";

import {
  tutorApiAnsweredResponseBodySchema,
  tutorApiErrorResponseBodySchema,
  tutorApiInsufficientContextResponseBodySchema,
  tutorApiRefusedResponseBodySchema,
} from "./TutorApi.contract.js";
import type {
  TutorApiAnsweredResponseBody,
  TutorApiErrorResponseBody,
  TutorApiInsufficientContextResponseBody,
  TutorApiRefusedResponseBody,
} from "./TutorApi.contract.js";

export const tutorStreamEventNames = [
  "token",
  "answered",
  "insufficient_context",
  "refused",
  "error",
  "done",
] as const;

export type TutorStreamEventName = (typeof tutorStreamEventNames)[number];

export const tutorStreamTokenPayloadSchema = z
  .object({
    token: z.string(),
  })
  .strict();

export type TutorStreamTokenPayload = z.infer<
  typeof tutorStreamTokenPayloadSchema
>;

export const tutorStreamDonePayloadSchema = z
  .object({
    completedAt: z.string(),
  })
  .strict();

export type TutorStreamDonePayload = z.infer<
  typeof tutorStreamDonePayloadSchema
>;

export type TutorStreamEvent =
  | Readonly<{
      event: "token";
      data: TutorStreamTokenPayload;
    }>
  | Readonly<{
      event: "answered";
      data: TutorApiAnsweredResponseBody;
    }>
  | Readonly<{
      event: "insufficient_context";
      data: TutorApiInsufficientContextResponseBody;
    }>
  | Readonly<{
      event: "refused";
      data: TutorApiRefusedResponseBody;
    }>
  | Readonly<{
      event: "error";
      data: TutorApiErrorResponseBody;
    }>
  | Readonly<{
      event: "done";
      data: TutorStreamDonePayload;
    }>;

export function formatTutorSseEvent(event: TutorStreamEvent): string {
  return `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
}

function extractSseFields(lines: readonly string[]): {
  eventName: string | null;
  dataContent: string | null;
} {
  let eventName: string | null = null;
  let dataContent: string | null = null;

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }

    const field = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (field === "event") {
      eventName = value;
    } else if (field === "data") {
      dataContent = dataContent === null ? value : `${dataContent}\n${value}`;
    }
  }

  return { eventName, dataContent };
}

type EventParser = (payload: unknown) => TutorStreamEvent | null;

const eventParsers: Readonly<Record<string, EventParser>> = {
  token: (payload) => {
    const parsed = tutorStreamTokenPayloadSchema.safeParse(payload);
    return parsed.success ? { event: "token", data: parsed.data } : null;
  },
  answered: (payload) => {
    const parsed = tutorApiAnsweredResponseBodySchema.safeParse(payload);
    return parsed.success ? { event: "answered", data: parsed.data } : null;
  },
  insufficient_context: (payload) => {
    const parsed =
      tutorApiInsufficientContextResponseBodySchema.safeParse(payload);
    return parsed.success
      ? { event: "insufficient_context", data: parsed.data }
      : null;
  },
  refused: (payload) => {
    const parsed = tutorApiRefusedResponseBodySchema.safeParse(payload);
    return parsed.success ? { event: "refused", data: parsed.data } : null;
  },
  error: (payload) => {
    const parsed = tutorApiErrorResponseBodySchema.safeParse(payload);
    return parsed.success ? { event: "error", data: parsed.data } : null;
  },
  done: (payload) => {
    const parsed = tutorStreamDonePayloadSchema.safeParse(payload);
    return parsed.success ? { event: "done", data: parsed.data } : null;
  },
};

function parseTutorSseEventPayload(
  eventName: string,
  parsedJson: unknown,
): TutorStreamEvent | null {
  const parser = eventParsers[eventName];
  return parser !== undefined ? parser(parsedJson) : null;
}


export function parseTutorSseEvent(rawBlock: string): TutorStreamEvent | null {
  const trimmed = rawBlock.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const { eventName, dataContent } = extractSseFields(trimmed.split("\n"));
  if (eventName === null || dataContent === null) {
    return null;
  }

  try {
    const parsedJson: unknown = JSON.parse(dataContent);
    return parseTutorSseEventPayload(eventName, parsedJson);
  } catch {
    return null;
  }
}
