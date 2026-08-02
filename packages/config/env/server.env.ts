import { z } from "zod";

export const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.string().min(1)
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(input: NodeJS.ProcessEnv): ServerEnvironment {
  return serverEnvironmentSchema.parse(input);
}