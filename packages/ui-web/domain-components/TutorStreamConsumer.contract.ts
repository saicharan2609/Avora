import type {
  TutorApiAnsweredResponseBody,
  TutorApiErrorResponseBody,
  TutorApiInsufficientContextResponseBody,
  TutorApiRefusedResponseBody,
} from "@avora/core/contracts/tutor";
import { parseTutorSseEvent } from "@avora/core/contracts/tutor";

export const tutorStreamClientStatuses = [
  "idle",
  "streaming",
  "completed",
  "insufficient_context",
  "refused",
  "error",
] as const;

export type TutorStreamClientStatus =
  (typeof tutorStreamClientStatuses)[number];

export type TutorStreamClientState =
  | Readonly<{
      status: "idle";
    }>
  | Readonly<{
      status: "streaming";
      accumulatedText: string;
    }>
  | Readonly<{
      status: "completed";
      answer: TutorApiAnsweredResponseBody;
      accumulatedText: string;
    }>
  | Readonly<{
      status: "insufficient_context";
      response: TutorApiInsufficientContextResponseBody;
    }>
  | Readonly<{
      status: "refused";
      response: TutorApiRefusedResponseBody;
    }>
  | Readonly<{
      status: "error";
      error: TutorApiErrorResponseBody | Error;
    }>;

export type TutorStreamConsumerOptions = Readonly<{
  signal?: AbortSignal;
  onStateChange?: (state: TutorStreamClientState) => void;
  onToken?: (token: string, accumulatedText: string) => void;
}>;

type StreamParseContext = {
  accumulatedText: string;
  currentState: TutorStreamClientState;
};

function handleSseEvent(
  event: NonNullable<ReturnType<typeof parseTutorSseEvent>>,
  context: StreamParseContext,
  options: TutorStreamConsumerOptions,
): TutorStreamClientState {
  switch (event.event) {
    case "token": {
      context.accumulatedText += event.data.token;
      const nextState: TutorStreamClientState = {
        status: "streaming",
        accumulatedText: context.accumulatedText,
      };
      options.onToken?.(event.data.token, context.accumulatedText);
      return nextState;
    }
    case "answered": {
      return {
        status: "completed",
        answer: event.data,
        accumulatedText: event.data.answerText,
      };
    }
    case "insufficient_context": {
      return {
        status: "insufficient_context",
        response: event.data,
      };
    }
    case "refused": {
      return {
        status: "refused",
        response: event.data,
      };
    }
    case "error": {
      return {
        status: "error",
        error: event.data,
      };
    }
    case "done": {
      return context.currentState;
    }
  }
}

function processSseBlocks(
  blocks: readonly string[],
  context: StreamParseContext,
  options: TutorStreamConsumerOptions,
): void {
  for (const block of blocks) {
    const event = parseTutorSseEvent(block);
    if (event !== null) {
      context.currentState = handleSseEvent(event, context, options);
      options.onStateChange?.(context.currentState);
    }
  }
}

async function readStreamChunks(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  context: StreamParseContext,
  options: TutorStreamConsumerOptions,
): Promise<void> {
  let buffer = "";

  while (true) {
    if (options.signal?.aborted === true) {
      await reader.cancel();
      context.currentState = {
        status: "error",
        error: new Error("Tutor stream aborted by client."),
      };
      options.onStateChange?.(context.currentState);
      return;
    }

    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    processSseBlocks(blocks, context, options);
  }
}

export async function consumeTutorReadableStream(
  stream: ReadableStream<Uint8Array>,
  options: TutorStreamConsumerOptions = {},
): Promise<TutorStreamClientState> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const context: StreamParseContext = {
    accumulatedText: "",
    currentState: { status: "idle" },
  };

  try {
    await readStreamChunks(reader, decoder, context, options);
    return context.currentState;
  } catch (error) {
    const errorState: TutorStreamClientState = {
      status: "error",
      error: error instanceof Error ? error : new Error(String(error)),
    };
    options.onStateChange?.(errorState);
    return errorState;
  } finally {
    reader.releaseLock();
  }
}
