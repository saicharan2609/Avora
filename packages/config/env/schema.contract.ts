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
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    tier: "client",
    owner: "@avora/security",
    required: true,
    description: "Client-public Supabase anonymous key."
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
  }
] as const satisfies readonly EnvironmentVariableContract[];