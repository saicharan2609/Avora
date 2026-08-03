import { structuralAdaptivityFixture } from "../fixtures/structural-adaptivity.fixture.js";
import type { AdaptivityCase } from "./suite-contract.js";
import { assertAdaptivityCondition } from "./suite-contract.js";

const caseName = "AD-41 heterogeneous student-authored labels";

export const heterogeneousLabelsCase: AdaptivityCase = {
  name: caseName,
  run: () => {
    const labels = structuralAdaptivityFixture.subjects.flatMap((subject) =>
      subject.structurePathExamples.flatMap((path) => [...path]),
    );

    assertAdaptivityCondition(
      caseName,
      labels.includes("Experiment 7"),
      "missing required synthetic student-authored label",
    );

    assertAdaptivityCondition(
      caseName,
      new Set(labels).size >= 8,
      "synthetic fixture set is too tidy to guard structural adaptivity",
    );
  },
};