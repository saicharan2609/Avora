import { z } from "zod";

export const mobileEnvironmentSchema = z.object({
  EXPO_PUBLIC_AVORA_API_BASE_URL: z.string().url()
});

export type MobileEnvironment = z.infer<typeof mobileEnvironmentSchema>;

export function parseMobileEnvironment(
  input: Record<string, string | undefined>
): MobileEnvironment {
  return mobileEnvironmentSchema.parse(input);
}
