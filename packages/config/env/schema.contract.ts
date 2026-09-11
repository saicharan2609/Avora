export type EnvironmentTier = "client" | "server" | "worker";

export type EnvironmentOwner =
  | "@avora/architecture"
  | "@avora/security"
  | "@avora/platform"
  | "@avora/data"
  | "@avora/ai"
  | "@avora/web"
  | "@avora/mobile";

export type EnvironmentVariableContract = Readonly<{
  name: string;
  tier: EnvironmentTier;
  owner: EnvironmentOwner;
  required: boolean;
  description: string;
}>;

export const environmentVariableContracts = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    tier: "client",
    owner: "@avora/platform",
    required: true,
    description: "Client-public Supabase project URL."
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    tier: "worker",
    owner: "@avora/platform",
    required: true,
    description: "Supabase project URL, read worker-side to construct the service-role client. Not a secret; reuses the client-tier variable name rather than introducing a second name for the same value. Worker tier."
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    tier: "client",
    owner: "@avora/security",
    required: true,
    description: "Client-public Supabase anonymous key."
  },
  {
    name: "EXPO_PUBLIC_AVORA_API_BASE_URL",
    tier: "client",
    owner: "@avora/mobile",
    required: true,
    description: "Base URL of the Avora web API used by the mobile client."
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    tier: "worker",
    owner: "@avora/security",
    required: true,
    description: "Privileged Supabase service-role key. Worker tier only."
  },
  {
    name: "DATABASE_URL",
    tier: "server",
    owner: "@avora/data",
    required: true,
    description: "Server-side database connection string."
  },
  {
    name: "WORKER_QUEUE_DATABASE_URL",
    tier: "worker",
    owner: "@avora/platform",
    required: true,
    description: "Worker queue database connection string."
  },
  {
    name: "AI_GATEWAY_ROUTING_POLICY_ENVIRONMENT",
    tier: "worker",
    owner: "@avora/ai",
    required: true,
    description: "Environment selector for AI routing policy."
  },
  {
    name: "GEMINI_API_KEY",
    tier: "server",
    owner: "@avora/ai",
    required: true,
    description: "Google Gemini provider API key for AI Gateway model access. Server tier only."
  },
  {
    name: "GEMINI_API_KEY",
    tier: "worker",
    owner: "@avora/ai",
    required: true,
    description: "Google Gemini provider API key for AI Gateway model access. Worker tier only."
  },
  {
    name: "AVORA_WORKER_ID",
    tier: "worker",
    owner: "@avora/platform",
    required: false,
    description: "Optional worker instance identifier used for job claim/lease attribution. Defaults to a process-derived value when unset."
  }
] as const satisfies readonly EnvironmentVariableContract[];