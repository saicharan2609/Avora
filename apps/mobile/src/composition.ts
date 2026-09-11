import { parseMobileEnvironment } from "@avora/config/env/mobile";

import { createAcademicClient } from "./academic/httpAcademicClient";
import { createHttpAuthPort } from "./auth/httpAuthPort";
import { createSecureSessionStore } from "./auth/secureSessionStore";

function readApiBaseUrl(): string {
  return parseMobileEnvironment(process.env).EXPO_PUBLIC_AVORA_API_BASE_URL;
}

export function getAuthPort() {
  return createHttpAuthPort({ apiBaseUrl: readApiBaseUrl() });
}

export function getSecureSessionStore() {
  return createSecureSessionStore();
}

export function getAcademicClient(accessToken: string) {
  return createAcademicClient({ apiBaseUrl: readApiBaseUrl(), accessToken });
}
