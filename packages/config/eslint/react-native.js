import { fixupPluginRules } from "@eslint/compat";
import reactNativePlugin from "eslint-plugin-react-native";

const reactNative = fixupPluginRules(reactNativePlugin);

export default [
  {
    files: [
      "apps/mobile/**/*.{ts,tsx}",
      "packages/ui-mobile/**/*.{ts,tsx}"
    ],

    settings: {
      "import/ignore": ["^react-native($|/)"]
    },

    plugins: {
      "react-native": reactNative
    },

    rules: {
      /*
       * Keep cycle detection for Avora's own modules, but do not traverse
       * external packages such as react-native/node_modules.
       *
       * This prevents eslint-plugin-import from asking the configured
       * parser to parse React Native's package source.
       */
      "import/no-cycle": [
        "error",
        {
          ignoreExternal: true
        }
      ],

      "react-native/no-inline-styles": "error",
      "react-native/no-color-literals": "error",
      "react-native/no-raw-text": "off"
    }
  }
];