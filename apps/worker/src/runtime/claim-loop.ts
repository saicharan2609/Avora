// Generic worker-claim orchestration. The orchestration logic below has no
// knowledge of which job types exist — it drives whatever entry list it is
// given, so activating a new worker type never requires a change to
// startClaimLoop itself (only to toClaimLoopEntries and
// createWorkerRuntime.ts).

import type { WorkerRuntime } from "./createWorkerRuntime.js";

export type ClaimLoopWorkerEntry = Readonly<{
  name: string;
  runOnce: () => Promise<"claimed" | "idle">;
}>;

// Every WorkerRuntime worker shares the identical runOnce() shape
// (apps/worker/src/resource-*/*Worker.ts), which is what makes a single
// generic entry list possible instead of one bespoke loop per job type.
export function toClaimLoopEntries(
  runtime: WorkerRuntime,
): readonly ClaimLoopWorkerEntry[] {
  return [
    { name: "resource-ingestion", runOnce: runtime.resourceIngestionWorker.runOnce },
    { name: "resource-extraction", runOnce: runtime.resourceExtractionWorker.runOnce },
    { name: "resource-chunking", runOnce: runtime.resourceChunkingWorker.runOnce },
    { name: "resource-indexing", runOnce: runtime.resourceIndexingWorker.runOnce },
    { name: "resource-classification", runOnce: runtime.resourceClassificationWorker.runOnce },
    { name: "resource-upload-ticket", runOnce: runtime.resourceUploadTicketWorker.runOnce },
    { name: "resource-summary", runOnce: runtime.resourceSummaryWorker.runOnce },
  ];
}

export type ClaimLoopOptions = Readonly<{
  // Delay before the next runOnce() call for a given worker after it reports
  // "idle" or after an unexpected error, so an empty queue never becomes a
  // tight poll. A "claimed" result loops again immediately to drain backlog.
  pollIntervalMs?: number;
  // Injectable so tests can drive the loop without real wall-clock delays
  // (ENG-340: deterministic tests, no flaky timers).
  sleep?: (durationMs: number) => Promise<void>;
}>;

export type ClaimLoopController = Readonly<{
  // Stops scheduling further runOnce() calls and resolves once every
  // worker's in-flight call (at most one per worker, by construction) has
  // settled. Idempotent.
  stop: () => Promise<void>;
}>;

const defaultPollIntervalMs = 2000;

export function startClaimLoop(
  entries: readonly ClaimLoopWorkerEntry[],
  options?: ClaimLoopOptions,
): ClaimLoopController {
  const pollIntervalMs = options?.pollIntervalMs ?? defaultPollIntervalMs;
  const sleep = options?.sleep ?? defaultSleep;

  let stopRequested = false;
  let resolveStopSignal: () => void = () => {};
  const stopSignal = new Promise<void>((resolve) => {
    resolveStopSignal = resolve;
  });

  // Races the backoff wait against the stop signal so a worker that is
  // currently backing off after an idle/error tick wakes immediately on
  // stop(), instead of shutdown being bounded by up to a full
  // pollIntervalMs — without that, "stop future polling" would be correct
  // but "clean shutdown" would not be prompt.
  const waitForBackoffOrStop = (durationMs: number): Promise<void> =>
    Promise.race([sleep(durationMs), stopSignal]);

  // One independent sequential loop per worker: this is what guarantees a
  // given worker's runOnce() is never called again before its previous call
  // has settled, while still letting different worker types run
  // concurrently with each other (bounded by the fixed number of composed
  // workers — never unbounded).
  const workerLoops = entries.map((entry) =>
    runWorkerLoop(entry, {
      pollIntervalMs,
      waitForBackoffOrStop,
      isStopRequested: () => stopRequested,
    }),
  );

  return {
    stop: async (): Promise<void> => {
      stopRequested = true;
      resolveStopSignal();
      await Promise.all(workerLoops);
    },
  };
}

type RunWorkerLoopOptions = Readonly<{
  pollIntervalMs: number;
  waitForBackoffOrStop: (durationMs: number) => Promise<void>;
  isStopRequested: () => boolean;
}>;

async function runWorkerLoop(
  entry: ClaimLoopWorkerEntry,
  options: RunWorkerLoopOptions,
): Promise<void> {
  while (!options.isStopRequested()) {
    const outcome = await runOnceSafely(entry);

    if (options.isStopRequested()) {
      return;
    }

    if (outcome !== "claimed") {
      await options.waitForBackoffOrStop(options.pollIntervalMs);
    }
  }
}

async function runOnceSafely(
  entry: ClaimLoopWorkerEntry,
): Promise<"claimed" | "idle" | "error"> {
  try {
    return await entry.runOnce();
  } catch {
    // An error escaping runOnce() here is an infrastructure-level failure
    // (e.g. a transient database error during claim or heartbeat) — a job
    // handler failure is never one of these, because every composed worker
    // already converts a handler failure into a recorded failed-job-state
    // transition inside its own runOnce() (ENG-253). There is no sanctioned
    // logging surface at this orchestration layer today: no-console is
    // enforced everywhere in apps/worker except src/main.ts and
    // src/runtime/shutdown.ts (packages/config/eslint/base.js), and a
    // LoggerContract implementation is explicitly pending (see
    // apps/worker/README.md's "Pre-Stage-12 readiness exception"). Treating
    // this the same as an idle tick — back off, then retry on the next
    // iteration — is safe without a logger: the jobs table is the system of
    // record, and any job left mid-claim by the failure is still recovered
    // by the existing stale-claim reclaim window (staleClaimThresholdSeconds)
    // independently of this loop. Wiring real observability for this catch
    // site is a separate, out-of-scope group.
    return "error";
  }
}

function defaultSleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}
