import { createClient } from "@supabase/supabase-js";

import type {
  SupabaseAuthAdapter,
  SupabaseAuthConnection,
  SupabaseExchangeCodeForSessionInput,
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
    startEmailMagicLink: async (input: SupabaseStartEmailMagicLinkInput) => {
      const { data, error } = await client.auth.signInWithOtp({
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

      if (data.user === null && data.session === null) {
        return null;
      }

      return null;
    },

    startOAuth: async (input: SupabaseStartOAuthInput) => {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: mapSupabaseAuthMethodToProvider(input.method),
        options: {
          redirectTo: input.redirectTo,
        },
      });

      if (error !== null) {
        throw new SupabaseAuthAdapterError("auth_start_oauth_failed", error.message);
      }

      if (data.url === null) {
        throw new SupabaseAuthAdapterError(
          "auth_missing_redirect_url",
          "Supabase Auth did not return an OAuth redirect URL",
        );
      }

      return {
        redirectUrl: data.url,
      };
    },

    exchangeCodeForSession: async (input: SupabaseExchangeCodeForSessionInput) => {
      const { data, error } = await client.auth.exchangeCodeForSession(input.code);

      if (error !== null) {
        throw new SupabaseAuthAdapterError("auth_exchange_code_failed", error.message);
      }

      return mapSupabaseSessionToAuthSession(data.session);
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