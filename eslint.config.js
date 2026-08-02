import base from "./packages/config/eslint/base.js";
import architecture from "./packages/config/eslint/architecture.js";
import node from "./packages/config/eslint/node.js";
import react from "./packages/config/eslint/react.js";
import reactNative from "./packages/config/eslint/react-native.js";

export default [
  ...base,
  ...architecture,
  ...node,
  ...react,
  ...reactNative
];