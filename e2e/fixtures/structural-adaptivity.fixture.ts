export type SyntheticResourceFixture = Readonly<{
  resourceId: string;
  subjectId: string;
  structurePath: readonly string[];
}>;

export type SyntheticSubjectFixture = Readonly<{
  subjectId: string;
  subjectLabel: string;
  structurePathExamples: readonly (readonly string[])[];
  resources: readonly SyntheticResourceFixture[];
}>;

export type StructuralAdaptivityFixture = Readonly<{
  subjects: readonly SyntheticSubjectFixture[];
}>;

export const structuralAdaptivityFixture = {
  subjects: [
    {
      subjectId: "subject-flat-foundations",
      subjectLabel: "Engineering foundations",
      structurePathExamples: [[]],
      resources: [
        {
          resourceId: "resource-flat-001",
          subjectId: "subject-flat-foundations",
          structurePath: [],
        },
      ],
    },
    {
      subjectId: "subject-single-branch",
      subjectLabel: "Signals and systems",
      structurePathExamples: [["Fourier practice"]],
      resources: [
        {
          resourceId: "resource-single-001",
          subjectId: "subject-single-branch",
          structurePath: ["Fourier practice"],
        },
      ],
    },
    {
      subjectId: "subject-lab-led",
      subjectLabel: "Digital electronics",
      structurePathExamples: [["Lab records", "Sequential circuits", "Experiment 7"]],
      resources: [
        {
          resourceId: "resource-lab-001",
          subjectId: "subject-lab-led",
          structurePath: ["Lab records", "Sequential circuits", "Experiment 7"],
        },
      ],
    },
    {
      subjectId: "subject-deep-project",
      subjectLabel: "Control systems",
      structurePathExamples: [
        ["Project work", "Prototype review", "Circuit analysis", "Oscillator build", "Bench notes"],
      ],
      resources: [
        {
          resourceId: "resource-deep-001",
          subjectId: "subject-deep-project",
          structurePath: [
            "Project work",
            "Prototype review",
            "Circuit analysis",
            "Oscillator build",
            "Bench notes",
          ],
        },
      ],
    },
  ],
} as const satisfies StructuralAdaptivityFixture;