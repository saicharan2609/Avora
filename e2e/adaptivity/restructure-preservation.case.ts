import { restructuredAdaptivityFixture } from "../fixtures/restructured-adaptivity.fixture.js";
import type { AdaptivityCase } from "./suite-contract.js";
import { assertAdaptivityCondition } from "./suite-contract.js";

const caseName = "AD-41 restructure preserves resources";

export const restructurePreservationCase: AdaptivityCase = {
  name: caseName,
  run: () => {
    const beforeResourceIds = new Set(
      restructuredAdaptivityFixture.before.resources.map((resource) => resource.resourceId),
    );

    const afterResourceIds = new Set(
      restructuredAdaptivityFixture.after.resources.map((resource) => resource.resourceId),
    );

    assertAdaptivityCondition(
      caseName,
      beforeResourceIds.size === afterResourceIds.size,
      "resource count changed during restructure",
    );

    for (const resourceId of beforeResourceIds) {
      assertAdaptivityCondition(
        caseName,
        afterResourceIds.has(resourceId),
        `resource ${resourceId} was not preserved during restructure`,
      );
    }
  },
};