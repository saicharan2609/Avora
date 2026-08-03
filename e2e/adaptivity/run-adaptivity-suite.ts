import { adaptivityCases } from "./suite.js";

if (adaptivityCases.length === 0) {
  throw new Error("AD-41 structural adaptivity suite has no cases");
}

for (const adaptivityCase of adaptivityCases) {
  adaptivityCase.run();
}

console.log(`AD-41 structural adaptivity suite passed: ${adaptivityCases.length} cases`);