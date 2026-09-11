export type ShutdownSignal = "SIGTERM" | "SIGINT";

export type ShutdownControllerOptions = Readonly<{
  closeHealthServer: () => Promise<void>;
  // Optional so existing callers/tests that only exercise the health server
  // continue to work unchanged. When provided, it is stopped before the
  // health server closes: stop scheduling new claim-loop iterations and let
  // any already-running one finish, then close the health endpoint last.
  stopWorkerOrchestration?: () => Promise<void>;
}>;

export type ShutdownController = (signal: ShutdownSignal) => Promise<void>;

export function createShutdownController(options: ShutdownControllerOptions): ShutdownController {
  let hasStartedShutdown = false;

  return async (signal: ShutdownSignal): Promise<void> => {
    if (hasStartedShutdown) {
      return;
    }

    hasStartedShutdown = true;

    console.log(`Avora worker received ${signal}; shutting down`);

    if (options.stopWorkerOrchestration !== undefined) {
      await options.stopWorkerOrchestration();
    }

    await options.closeHealthServer();

    console.log("Avora worker shutdown complete");
  };
}