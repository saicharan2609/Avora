export type ShutdownSignal = "SIGTERM" | "SIGINT";

export type ShutdownControllerOptions = Readonly<{
  closeHealthServer: () => Promise<void>;
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

    await options.closeHealthServer();

    console.log("Avora worker shutdown complete");
  };
}