import { createSupabaseAuthAdapter } from "@avora/adapters/supabase/auth";

type WebAuthEnvironment = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

function readRequiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required web auth environment variable: ${name}`);
  }

  return value;
}

export function readWebAuthEnvironment(): WebAuthEnvironment {
  return {
    supabaseUrl: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function createWebSupabaseAuthAdapter() {
  const environment = readWebAuthEnvironment();

  return createSupabaseAuthAdapter({
    supabaseUrl: environment.supabaseUrl,
    supabaseAnonKey: environment.supabaseAnonKey,
  });
}