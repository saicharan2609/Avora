import type { ResourceId, StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";
import type { GeneratedSummary, SummaryGatewayResponse } from "@avora/ai";
import type {
  DbResourceSummaryRecord,
  SaveResourceSummaryInput,
} from "@avora/db/repositories/resource-summaries";

import { createResourceSummaryWorkerHandler } from "../handler.js";
import { ResourceSummaryWorkerError } from "../errors.js";
import type { ResourceSummaryWorkerDependencies } from "../contracts.js";

class ResourceSummaryHandlerUnitFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ResourceSummaryHandlerUnitFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ResourceSummaryHandlerUnitFailure(caseId, reason);
  }
}

const studentId = "student-1" as StudentId;
const resourceId = "resource-1" as ResourceId;
const requestedAt = "2026-01-01T00:00:00.000Z" as IsoDateTimeString;

function buildRequest() {
  return {
    studentId,
    resourceId,
    promptVersion: "summary-system-policy.v1",
    summaryStrategyVersion: "summary.generate.v1",
    requestedAt,
  };
}

function buildGeneratedSummary(): GeneratedSummary {
  return {
    status: "generated",
    query: buildRequest(),
    context: {
      version: "grounded-summary-context-envelope.v1" as never,
      query: buildRequest(),
      evidence: [],
      allowedChunkIds: [],
    },
    body: {
      headings: [
        { title: "Linked Lists", points: ["A linked list is a sequence of nodes."] },
      ],
    },
    citations: [
      {
        citationId: "citation-1" as never,
        chunkId: "chunk-1" as never,
        resourceId: resourceId as never,
        locator: {
          kind: "document_page",
          pageNumber: 1,
          slideNumber: null,
          boundingBox: null,
          textSpan: null,
          timeRange: null,
          label: null,
        },
        quote: "A linked list is a sequence of nodes.",
      },
    ],
    modelVersion: "gemini-3.6-flash",
    createdAt: requestedAt,
  };
}

function buildDependencies(overrides: Partial<{
  gatewayResponse: SummaryGatewayResponse;
  saveCalls: SaveResourceSummaryInput[];
  saveShouldFail: boolean;
}> = {}): ResourceSummaryWorkerDependencies {
  const saveCalls = overrides.saveCalls ?? [];
  const gatewayResponse = overrides.gatewayResponse ?? buildGeneratedSummary();

  return {
    summaryGateway: {
      generateResourceSummary: async () => gatewayResponse,
    },
    resourceSummariesRepository: {
      saveResourceSummary: async (input) => {
        if (overrides.saveShouldFail === true) {
          throw new Error("persistence failed");
        }

        saveCalls.push(input);

        return input as unknown as DbResourceSummaryRecord;
      },
    },
  };
}

async function runGeneratedSummaryIsPersistedCase(): Promise<void> {
  const caseId = "resource-summary-handler-generated-summary-is-persisted";
  const saveCalls: SaveResourceSummaryInput[] = [];

  const handler = createResourceSummaryWorkerHandler(buildDependencies({ saveCalls }));

  const result = await handler.generateResourceSummary(buildRequest());

  assert(result.outcome === "generated", caseId, "expected generated outcome");
  assert(saveCalls.length === 1, caseId, "expected exactly one persistence call");
  assert(
    saveCalls[0]?.citations.length === 1,
    caseId,
    "expected the persisted summary to carry through its citation",
  );
  assert(
    saveCalls[0]?.modelVersion === "gemini-3.6-flash",
    caseId,
    "expected the persisted summary to carry through its model version (ENG-235)",
  );
}

async function runInsufficientEvidenceNeverPersistsCase(): Promise<void> {
  const caseId = "resource-summary-handler-insufficient-evidence-never-persists";
  const saveCalls: SaveResourceSummaryInput[] = [];

  const handler = createResourceSummaryWorkerHandler(buildDependencies({
    saveCalls,
    gatewayResponse: {
      status: "insufficient_evidence",
      reason: "no_indexed_chunks",
      query: buildRequest(),
      message: "not enough evidence",
    },
  }));

  const result = await handler.generateResourceSummary(buildRequest());

  assert(
    result.outcome === "insufficient_evidence",
    caseId,
    "expected insufficient_evidence outcome",
  );
  assert(saveCalls.length === 0, caseId, "expected no persistence call");
}

async function runRefusalThrowsRatherThanSilentlyDroppingCase(): Promise<void> {
  const caseId = "resource-summary-handler-refusal-throws-rather-than-silently-dropping";
  const saveCalls: SaveResourceSummaryInput[] = [];

  const handler = createResourceSummaryWorkerHandler(buildDependencies({
    saveCalls,
    gatewayResponse: {
      status: "refused",
      reason: "invocation_failed",
      query: buildRequest(),
      message: "provider call failed",
    },
  }));

  let threw = false;

  try {
    await handler.generateResourceSummary(buildRequest());
  } catch (error) {
    threw = error instanceof ResourceSummaryWorkerError
      && error.code === "resource_summary_worker_generation_refused";
  }

  assert(threw, caseId, "expected a refusal to surface as a thrown error, not a silent outcome");
  assert(saveCalls.length === 0, caseId, "expected no persistence call on refusal");
}

async function runPersistenceFailureThrowsDistinctCodeCase(): Promise<void> {
  const caseId = "resource-summary-handler-persistence-failure-throws-distinct-code";

  const handler = createResourceSummaryWorkerHandler(buildDependencies({
    saveShouldFail: true,
  }));

  let threw = false;

  try {
    await handler.generateResourceSummary(buildRequest());
  } catch (error) {
    threw = error instanceof ResourceSummaryWorkerError
      && error.code === "resource_summary_worker_persistence_failed";
  }

  assert(threw, caseId, "expected a persistence failure to surface with its own error code");
}

async function main(): Promise<void> {
  await runGeneratedSummaryIsPersistedCase();
  await runInsufficientEvidenceNeverPersistsCase();
  await runRefusalThrowsRatherThanSilentlyDroppingCase();
  await runPersistenceFailureThrowsDistinctCodeCase();
}

await main();
