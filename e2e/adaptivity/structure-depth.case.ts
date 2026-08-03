import { structuralAdaptivityFixture } from "../fixtures/structural-adaptivity.fixture.js";
import type { AdaptivityCase } from "./suite-contract.js";
import { assertAdaptivityCondition } from "./suite-contract.js";

const caseName = "AD-41 structure depth coverage";

export const structureDepthCase: AdaptivityCase = {
  name: caseName,
  run: () => {
    const observedDepths = new Set(
      structuralAdaptivityFixture.subjects.flatMap((subject) =>
        subject.structurePathExamples.map((path) => path.length),
      ),
    );

    for (const expectedDepth of [0, 1, 3, 5]as const) {
      assertAdaptivityCondition(
        caseName,
        observedDepths.has(expectedDepth),
        `missing synthetic subject structure with depth ${expectedDepth}`,
      );
    }
  },
};