import type { Provider } from "@supabase/supabase-js";

import type { SupabaseStartOAuthInput } from "./contracts.js";

export function mapSupabaseAuthMethodToProvider(method: SupabaseStartOAuthInput["method"]): Provider {
  if (method === "google_oauth") {
    return "google";
  }

  return "apple";
}