import avora from "./rules/index.js";

const avoraArchitectureRules = Object.fromEntries(
  Object.keys(avora.rules).map((ruleName) => [
    `avora/${ruleName}`,
    "error"
  ])
);

export default [
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    plugins: {
      avora
    },
    rules: avoraArchitectureRules
  }
];