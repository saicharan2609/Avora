import { z } from "zod";

export const workerEnvironmentSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  WORKER_QUEUE_DATABASE_URL: z.string().min(1),
  AI_GATEWAY_ROUTING_POLICY_ENVIRONMENT: z.string().min(1)
});

export type WorkerEnvironment = z.infer<typeof workerEnvironmentSchema>;

export function parseWorkerEnvironment(input: NodeJS.ProcessEnv): WorkerEnvironment {
  return workerEnvironmentSchema.parse(input);
}