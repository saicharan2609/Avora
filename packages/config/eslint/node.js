import globals from "globals";

export default [
  {
    files: [
      "apps/worker/**/*.{ts,js,mjs,cjs}",
      "packages/config/**/*.{ts,js,mjs,cjs}",
      ".github/**/*.js"
    ],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-process-exit": "error"
    }
  }
];