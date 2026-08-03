import type { SyntheticResourceFixture } from "./structural-adaptivity.fixture.js";

export type RestructureSnapshot = Readonly<{
  resources: readonly SyntheticResourceFixture[];
}>;

export type RestructuredAdaptivityFixture = Readonly<{
  before: RestructureSnapshot;
  after: RestructureSnapshot;
}>;

export const restructuredAdaptivityFixture = {
  before: {
    resources: [
      {
        resourceId: "resource-restructure-001",
        subjectId: "subject-restructure",
        structurePath: ["Workshop notes", "Bridge design"],
      },
      {
        resourceId: "resource-restructure-002",
        subjectId: "subject-restructure",
        structurePath: ["Workshop notes", "Load calculations"],
      },
    ],
  },
  after: {
    resources: [
      {
        resourceId: "resource-restructure-001",
        subjectId: "subject-restructure",
        structurePath: ["Design archive", "Bridge design"],
      },
      {
        resourceId: "resource-restructure-002",
        subjectId: "subject-restructure",
        structurePath: ["Design archive", "Load calculations"],
      },
    ],
  },
} as const satisfies RestructuredAdaptivityFixture;