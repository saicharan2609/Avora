const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// `packages/ui-mobile` declares react/react-native/react-native-safe-area-
// context/react-native-svg as peerDependencies (correct — it's a library,
// not the app), but also carries them as devDependencies so its own
// standalone typecheck/lint/build can resolve types without depending on a
// consumer. Under pnpm's per-package resolution scope, that second,
// package-local install can end up as a genuinely separate physical build
// in the pnpm store from the one apps/mobile installs as its real
// dependency (confirmed via `readlink -f` on both node_modules entries —
// different content-hash directories despite identical version numbers),
// even though both are "the same version". For a module with native-side
// state exposed through a React Context (react-native-safe-area-context's
// SafeAreaProvider) or Symbol-keyed dedupe (react-native, react), two
// distinct JS module instances mean two distinct Contexts/registries: a
// Provider mounted from one instance is invisible to a hook resolved from
// the other, which can silently stall the very first render rather than
// throw. Forcing every import of these packages — regardless of which
// workspace package's file does the importing — to resolve to this app's
// own copy keeps them singleton in the bundle.
const SINGLETON_NATIVE_MODULE_NAMES = [
  "react",
  "react-native",
  "react-native-safe-area-context",
  "react-native-svg",
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...Object.fromEntries(
    SINGLETON_NATIVE_MODULE_NAMES.map((moduleName) => [
      moduleName,
      path.resolve(projectRoot, "node_modules", moduleName),
    ]),
  ),
};

module.exports = config;
