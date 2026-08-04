export type RlsOperation = "select" | "insert" | "update" | "delete";

export type RlsHarnessTableContract = Readonly<{
  tableName: string;
  studentScoped: boolean;
  operations: readonly RlsOperation[];
}>;

export type RlsHarnessCase = Readonly<{
  caseName: string;
  tableName: string;
  operation: RlsOperation;
  expectedOutcome: "allow" | "deny";
}>;

export type RlsHarnessPlan = Readonly<{
  tables: readonly RlsHarnessTableContract[];
  cases: readonly RlsHarnessCase[];
}>;

export type RlsHarnessResult = Readonly<{
  caseName: string;
  outcome: "passed" | "failed";
}>;

export class RlsHarnessConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "RlsHarnessConfigurationError";
  }
}

export function assertRlsHarnessPlan(plan: RlsHarnessPlan): void {
  for (const table of plan.tables) {
    if (!table.studentScoped) {
      continue;
    }

    if (table.operations.length === 0) {
      throw new RlsHarnessConfigurationError(
        `student-scoped table ${table.tableName} must declare operation coverage`,
      );
    }

    for (const operation of table.operations) {
      const hasDenyCase = plan.cases.some(
        (testCase) =>
          testCase.tableName === table.tableName &&
          testCase.operation === operation &&
          testCase.expectedOutcome === "deny",
      );

      if (!hasDenyCase) {
        throw new RlsHarnessConfigurationError(
          `student-scoped table ${table.tableName} is missing deny case for ${operation}`,
        );
      }
    }
  }
}
