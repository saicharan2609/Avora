import {
  resourceExtractionQualityEvalCases,
} from "./resource-extraction-quality.fixture.js";
import {
  runResourceExtractionQualityGate,
  summarizeResourceExtractionQualityGate,
} from "./resource-extraction-quality.gate.js";

runResourceExtractionQualityGate(resourceExtractionQualityEvalCases);

const reports = summarizeResourceExtractionQualityGate(
  resourceExtractionQualityEvalCases,
);

console.log(
  `Resource extraction quality gate passed: ${reports.length} synthetic cases`,
);

for (const report of reports) {
  console.log(
    `- ${report.caseId}: ${report.outcome} coverage=${report.coverageRatio.toFixed(2)} confidence=${report.averageConfidence.toFixed(2)}`,
  );
}