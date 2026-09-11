import { startClaimLoop, toClaimLoopEntries } from "../claim-loop.js";
import type { ClaimLoopWorkerEntry } from "../claim-loop.js";
import type { WorkerRuntime } from "../createWorkerRuntime.js";

class ClaimLoopUnitFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ClaimLoopUnitFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ClaimLoopUnitFailure(caseId, reason);
  }
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

// A sleep double that never resolves on its own — the test advances it
// explicitly, one pending call at a time, giving deterministic control over
// how many "idle backoff" iterations the loop performs before the test
// inspects state or calls stop(). This is what lets the test prove the loop
// backs off on idle without a real (or unboundedly fast) delay.
function createControllableSleep(): {
  sleep: (durationMs: number) => Promise<void>;
  callCount: () => number;
  releaseNext: () => void;
} {
  const pendingResolvers: Array<() => void> = [];
  let calls = 0;

  return {
    sleep: (): Promise<void> => {
      calls += 1;

      return new Promise((resolve) => {
        pendingResolvers.push(resolve);
      });
    },
    callCount: () => calls,
    releaseNext: () => {
      const resolve = pendingResolvers.shift();

      if (resolve !== undefined) {
        resolve();
      }
    },
  };
}

// Requirement 1 + 3: the loop actually invokes a worker's runOnce(), and
// backs off (via the injected sleep) rather than spinning when idle.
async function runInvokesWorkerAndBacksOffOnIdleCase(): Promise<void> {
  const caseId = "claim-loop-invokes-worker-and-backs-off-on-idle";
  let runOnceCallCount = 0;

  const entry: ClaimLoopWorkerEntry = {
    name: "fake-worker",
    runOnce: async () => {
      runOnceCallCount += 1;
      return "idle";
    },
  };

  const controllableSleep = createControllableSleep();
  const controller = startClaimLoop([entry], { sleep: controllableSleep.sleep });

  await flushMicrotasks();

  assert(runOnceCallCount === 1, caseId, "expected exactly one runOnce() call before the loop backs off");
  assert(controllableSleep.callCount() === 1, caseId, "expected the loop to back off via sleep after an idle result");

  await controller.stop();
}

// Requirement 2: independent worker types are each polled, without one
// worker's schedule depending on another's.
async function runOrchestratesMultipleWorkerTypesCase(): Promise<void> {
  const caseId = "claim-loop-orchestrates-multiple-worker-types";
  let firstWorkerCalls = 0;
  let secondWorkerCalls = 0;

  const firstEntry: ClaimLoopWorkerEntry = {
    name: "first-worker",
    runOnce: async () => {
      firstWorkerCalls += 1;
      return "idle";
    },
  };

  const secondEntry: ClaimLoopWorkerEntry = {
    name: "second-worker",
    runOnce: async () => {
      secondWorkerCalls += 1;
      return "idle";
    },
  };

  const controllableSleep = createControllableSleep();
  const controller = startClaimLoop([firstEntry, secondEntry], {
    sleep: controllableSleep.sleep,
  });

  await flushMicrotasks();

  assert(firstWorkerCalls === 1, caseId, "expected the first worker to be polled once");
  assert(secondWorkerCalls === 1, caseId, "expected the second worker to be polled independently once");

  await controller.stop();
}

// Requirement 1 (drain behaviour): a "claimed" result loops again
// immediately without waiting, so a backlog drains without idle delay
// between claims.
async function runDrainsBacklogWithoutWaitingBetweenClaimsCase(): Promise<void> {
  const caseId = "claim-loop-drains-backlog-without-waiting-between-claims";
  let runOnceCallCount = 0;

  const entry: ClaimLoopWorkerEntry = {
    name: "fake-worker",
    runOnce: async () => {
      runOnceCallCount += 1;
      return runOnceCallCount < 3 ? "claimed" : "idle";
    },
  };

  const controllableSleep = createControllableSleep();
  const controller = startClaimLoop([entry], { sleep: controllableSleep.sleep });

  await flushMicrotasks();

  assert(
    runOnceCallCount === 3,
    caseId,
    `expected three runOnce() calls to drain the backlog before backing off, got ${runOnceCallCount}`,
  );
  assert(
    controllableSleep.callCount() === 1,
    caseId,
    "expected exactly one backoff wait, only after the backlog drained to idle",
  );

  await controller.stop();
}

// Requirement 4: stop() prevents any further runOnce() calls, and resolves
// promptly even while a worker is mid-backoff (an unreleased sleep) —
// shutdown is not bounded by waiting out the full poll interval.
async function runShutdownStopsFuturePollingCase(): Promise<void> {
  const caseId = "claim-loop-shutdown-stops-future-polling";
  let runOnceCallCount = 0;

  const entry: ClaimLoopWorkerEntry = {
    name: "fake-worker",
    runOnce: async () => {
      runOnceCallCount += 1;
      return "idle";
    },
  };

  const controllableSleep = createControllableSleep();
  const controller = startClaimLoop([entry], { sleep: controllableSleep.sleep });

  await flushMicrotasks();
  assert(runOnceCallCount === 1, caseId, "expected one runOnce() call before stop");

  // The worker is now blocked on an unreleased backoff sleep. stop() must
  // still resolve without the test ever releasing it.
  await controller.stop();

  const callCountAfterStop = runOnceCallCount;

  await flushMicrotasks();

  assert(
    runOnceCallCount === callCountAfterStop,
    caseId,
    "expected no further runOnce() calls after stop() resolved",
  );
}

// Requirement 5: a worker is never re-entered while its previous runOnce()
// call is still in flight.
async function runNeverOverlapsTheSameWorkerCase(): Promise<void> {
  const caseId = "claim-loop-never-overlaps-the-same-worker";
  let inFlight = false;
  let overlapDetected = false;
  let callCount = 0;
  let releaseInFlightCall: (() => void) | undefined;

  const entry: ClaimLoopWorkerEntry = {
    name: "slow-worker",
    runOnce: async () => {
      if (inFlight) {
        overlapDetected = true;
      }

      inFlight = true;
      callCount += 1;

      await new Promise<void>((resolve) => {
        releaseInFlightCall = resolve;
      });

      inFlight = false;
      return "idle";
    },
  };

  const controllableSleep = createControllableSleep();
  const controller = startClaimLoop([entry], { sleep: controllableSleep.sleep });

  await flushMicrotasks();
  assert(callCount === 1, caseId, "expected the worker's first call to have started");
  assert(inFlight, caseId, "expected the worker call to still be in flight");

  // Give the loop every opportunity to (incorrectly) start a second call
  // while the first is still pending.
  await flushMicrotasks();
  await flushMicrotasks();

  assert(!overlapDetected, caseId, "expected no overlapping runOnce() call for the same worker");
  assert(callCount === 1, caseId, "expected still only one call while the first remains in flight");

  releaseInFlightCall?.();
  await flushMicrotasks();

  await controller.stop();
}

// Robustness: an error escaping runOnce() must not crash the loop or stop
// it from continuing to poll on the next tick.
async function runSurvivesAnErrorFromRunOnceCase(): Promise<void> {
  const caseId = "claim-loop-survives-an-error-from-run-once";
  let callCount = 0;

  const entry: ClaimLoopWorkerEntry = {
    name: "flaky-worker",
    runOnce: async () => {
      callCount += 1;

      if (callCount === 1) {
        throw new Error("simulated infrastructure failure");
      }

      return "idle";
    },
  };

  const controllableSleep = createControllableSleep();
  const controller = startClaimLoop([entry], { sleep: controllableSleep.sleep });

  await flushMicrotasks();
  const callCountAfterFirstTick: number = callCount;
  assert(callCountAfterFirstTick === 1, caseId, "expected the first (throwing) call to have run");
  assert(controllableSleep.callCount() === 1, caseId, "expected the loop to back off after the error, same as idle");

  controllableSleep.releaseNext();
  await flushMicrotasks();

  const callCountAfterRetry: number = callCount;
  assert(callCountAfterRetry === 2, caseId, "expected the loop to retry on the next tick after the error");

  await controller.stop();
}

// Requirement 6: composition includes the resource summary worker, and
// toClaimLoopEntries produces one entry per composed worker.
async function runToClaimLoopEntriesIncludesResourceSummaryWorkerCase(): Promise<void> {
  const caseId = "claim-loop-to-claim-loop-entries-includes-resource-summary-worker";

  const fakeRunOnce = async (): Promise<"claimed" | "idle"> => "idle";

  const fakeRuntime: WorkerRuntime = {
    resourceIngestionWorker: { runOnce: fakeRunOnce },
    resourceExtractionWorker: { runOnce: fakeRunOnce },
    resourceChunkingWorker: { runOnce: fakeRunOnce },
    resourceIndexingWorker: { runOnce: fakeRunOnce },
    resourceClassificationWorker: { runOnce: fakeRunOnce },
    resourceUploadTicketWorker: { runOnce: fakeRunOnce },
    resourceSummaryWorker: { runOnce: fakeRunOnce },
  };

  const entries = toClaimLoopEntries(fakeRuntime);

  assert(entries.length === 7, caseId, `expected exactly 7 worker entries, got ${entries.length}`);
  assert(
    entries.some((entry) => entry.name === "resource-summary"),
    caseId,
    "expected a resource-summary entry to be present",
  );
}

async function main(): Promise<void> {
  await runInvokesWorkerAndBacksOffOnIdleCase();
  await runOrchestratesMultipleWorkerTypesCase();
  await runDrainsBacklogWithoutWaitingBetweenClaimsCase();
  await runShutdownStopsFuturePollingCase();
  await runNeverOverlapsTheSameWorkerCase();
  await runSurvivesAnErrorFromRunOnceCase();
  await runToClaimLoopEntriesIncludesResourceSummaryWorkerCase();
}

await main();
