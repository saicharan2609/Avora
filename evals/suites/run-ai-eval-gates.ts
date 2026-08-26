import { citationValidityCases } from "./citation-validity.fixture.js";
import { runCitationValidityGate } from "./citation-validity.gate.js";
import {
  tutorGroundingEvalCases,
} from "./tutor-grounding.fixture.js";
import {
  runTutorGroundingGate,
} from "./tutor-grounding.gate.js";
import {
  summaryGroundingEvalCases,
} from "./summary-grounding.fixture.js";
import {
  runSummaryGroundingGate,
} from "./summary-grounding.gate.js";

runCitationValidityGate(citationValidityCases);
await runTutorGroundingGate(tutorGroundingEvalCases);
await runSummaryGroundingGate(summaryGroundingEvalCases);

console.log(
  `AI evaluation gates passed: ${citationValidityCases.length} citation cases, ${tutorGroundingEvalCases.length} tutor grounding cases, ${summaryGroundingEvalCases.length} summary grounding cases`,
);