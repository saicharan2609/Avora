import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../generated/index.js";

export type DatabaseClient = SupabaseClient<Database>;

export type SupabaseProjectConnection = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

export type SupabaseServiceRoleConnection = Readonly<{
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
}>;

export type StudentDatabaseClientOptions = SupabaseProjectConnection &
  Readonly<{
    accessToken: string;
  }>;

export type ServiceRoleDatabaseClientOptions = SupabaseServiceRoleConnection;

export type DatabaseClientRole = "student" | "service";

export type RoleScopedDatabaseClient<Role extends DatabaseClientRole> = Readonly<{
  role: Role;
  client: DatabaseClient;
}>;

export function createStudentDatabaseClient(
  options: StudentDatabaseClientOptions,
): RoleScopedDatabaseClient<"student"> {
  return {
    role: "student",
    client: createClient<Database>(options.supabaseUrl, options.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${options.accessToken}`,
        },
      },
    }),
  };
}

export function createServiceRoleDatabaseClient(
  options: ServiceRoleDatabaseClientOptions,
): RoleScopedDatabaseClient<"service"> {
  return {
    role: "service",
    client: createClient<Database>(options.supabaseUrl, options.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }),
  };
}