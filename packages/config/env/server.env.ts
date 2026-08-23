import { z } from "zod";

export const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1)
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(
  input: Record<string, string | undefined>
): ServerEnvironment {
  return serverEnvironmentSchema.parse(input);
}