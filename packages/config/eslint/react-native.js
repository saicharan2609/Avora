import reactNativePlugin from "eslint-plugin-react-native";

export default [
  {
    files: ["apps/mobile/**/*.{ts,tsx}", "packages/ui-mobile/**/*.{ts,tsx}"],
    plugins: {
      "react-native": reactNativePlugin
    },
    rules: {
      "react-native/no-inline-styles": "error",
      "react-native/no-color-literals": "error",
      "react-native/no-raw-text": "off"
    }
  }
];