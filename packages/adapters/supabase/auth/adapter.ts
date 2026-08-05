import { createClient } from "@supabase/supabase-js";

import type {
  SupabaseAuthAdapter,
  SupabaseAuthConnection,
  SupabaseRefreshSessionInput,
  SupabaseStartEmailMagicLinkInput,
  SupabaseStartOAuthInput,
} from "./contracts.js";
import { SupabaseAuthAdapterError } from "./errors.js";
import { mapSupabaseAuthMethodToProvider } from "./provider.js";
import {
  mapSupabaseSessionToAuthSession,
  mapSupabaseUserToAuthIdentity,
} from "./session.js";

export function createSupabaseAuthAdapter(connection: SupabaseAuthConnection): SupabaseAuthAdapter {
  const client = createClient(connection.supabaseUrl, connection.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return {
    startEmailMagicLink: async (input: SupabaseStartEmailMagicLinkInput): Promise<void> => {
      const { error } = await client.auth.signInWithOtp({
        email: input.email,
        options: {
          emailRedirectTo: input.redirectTo,
        },
      });

      if (error !== null) {
        throw new SupabaseAuthAdapterError(
          "auth_start_email_magic_link_failed",
          error.message,
        );
      }
    },

    startOAuth: async (input: SupabaseStartOAuthInput): Promise<void> => {
      const { error } = await client.auth.signInWithOAuth({
        provider: mapSupabaseAuthMethodToProvider(input.method),
        options: {
          redirectTo: input.redirectTo,
        },
      });

      if (error !== null) {
        throw new SupabaseAuthAdapterError("auth_start_oauth_failed", error.message);
      }
    },

    refreshSession: async (input: SupabaseRefreshSessionInput) => {
      const { data, error } = await client.auth.refreshSession({
        refresh_token: input.refreshToken,
      });

      if (error !== null) {
        throw new SupabaseAuthAdapterError("auth_refresh_session_failed", error.message);
      }

      return mapSupabaseSessionToAuthSession(data.session);
    },

    getCurrentIdentity: async () => {
      const { data, error } = await client.auth.getUser();

      if (error !== null) {
        if (error.name === "AuthSessionMissingError") {
          return null;
        }

        throw new SupabaseAuthAdapterError("auth_get_identity_failed", error.message);
      }

      return mapSupabaseUserToAuthIdentity(data.user);
    },

    signOut: async (): Promise<void> => {
      const { error } = await client.auth.signOut();

      if (error !== null) {
        throw new SupabaseAuthAdapterError("auth_sign_out_failed", error.message);
      }
    },
  };
}