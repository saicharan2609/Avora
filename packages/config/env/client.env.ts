import { z } from "zod";

export const clientEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

export type ClientEnvironment = z.infer<typeof clientEnvironmentSchema>;

export function parseClientEnvironment(input: NodeJS.ProcessEnv): ClientEnvironment {
  return clientEnvironmentSchema.parse(input);
}