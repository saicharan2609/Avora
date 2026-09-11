import * as SecureStore from "expo-secure-store";

import type { AuthSession } from "@avora/domain/identity";

const secureSessionStoreKey = "avora.auth.session";

export type SecureSessionStore = Readonly<{
  writeSession: (session: AuthSession) => Promise<void>;
  readSession: () => Promise<AuthSession | null>;
  clearSession: () => Promise<void>;
}>;

export function createSecureSessionStore(): SecureSessionStore {
  return {
    writeSession: async (session: AuthSession): Promise<void> => {
      await SecureStore.setItemAsync(secureSessionStoreKey, JSON.stringify(session), {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    },

    readSession: async (): Promise<AuthSession | null> => {
      const raw = await SecureStore.getItemAsync(secureSessionStoreKey);

      if (raw === null) {
        return null;
      }

      return JSON.parse(raw) as AuthSession;
    },

    clearSession: async (): Promise<void> => {
      await SecureStore.deleteItemAsync(secureSessionStoreKey);
    },
  };
}
