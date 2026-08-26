import {
  summaryGroundingEvalCases,
} from "./summary-grounding.fixture.js";
import {
  runSummaryGroundingGate,
} from "./summary-grounding.gate.js";

await runSummaryGroundingGate(summaryGroundingEvalCases);

console.log(
  `Summary grounding gate passed: ${summaryGroundingEvalCases.length} cases`,
);
