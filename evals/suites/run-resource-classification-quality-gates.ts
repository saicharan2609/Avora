import {
  resourceClassificationQualityCases,
} from "./resource-classification-quality.fixture.js";
import {
  runResourceClassificationQualityGate,
} from "./resource-classification-quality.gate.js";

const result = runResourceClassificationQualityGate(resourceClassificationQualityCases);

console.log(
  `Resource classification quality gate passed: ${result.correctCases}/${result.totalCases} cases correct (${(result.accuracy * 100).toFixed(1)}%)`,
);

for (const outcome of result.outcomes) {
  console.log(
    `- ${outcome.caseId}: ${outcome.correct ? "correct" : "INCORRECT"} subject=${outcome.actualSubjectId ?? "none"} unit=${outcome.actualStructureUnitId ?? "none"}`,
  );
}
