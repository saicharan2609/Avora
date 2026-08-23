import globals from "globals";

export default [
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ["**/*.{mjs,cjs}"],
    rules: {
      "no-console": "off"
    }
  }
];