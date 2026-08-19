import {
  runResourceExtractionE2eHarness,
} from "./resource-extraction.e2e.js";

const results = await runResourceExtractionE2eHarness();

if (results.length === 0) {
  throw new Error("Stage 10 Group 7 resource extraction e2e harness has no cases");
}

console.log(
  `Stage 10 Group 7 resource extraction e2e harness passed: ${results.length} cases`,
);

for (const result of results) {
  console.log(`- ${result.name}: ${result.scenario}`);
}