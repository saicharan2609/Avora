import { z } from "zod";

export const workerEnvironmentSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  WORKER_QUEUE_DATABASE_URL: z.string().min(1),
  AI_GATEWAY_ROUTING_POLICY_ENVIRONMENT: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  AVORA_WORKER_ID: z.string().min(1).optional()
});

export type WorkerEnvironment = z.infer<typeof workerEnvironmentSchema>;

export function parseWorkerEnvironment(
  input: Record<string, string | undefined>
): WorkerEnvironment {
  return workerEnvironmentSchema.parse(input);
}