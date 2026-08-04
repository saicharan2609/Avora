import type { ConfigContext, ExpoConfig } from "expo/config";

export default function createExpoConfig({ config }: ConfigContext): ExpoConfig {
  return {
    ...config,
    name: "Avora",
    slug: "avora",
    scheme: "avora",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    platforms: ["ios", "android"],
    ios: {
      ...config.ios,
      bundleIdentifier: "ai.avora.mobile"
    },
    android: {
      ...config.android,
      package: "ai.avora.mobile"
    },
    extra: {
      ...config.extra
    }
  };
}