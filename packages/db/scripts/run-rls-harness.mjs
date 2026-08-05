import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repositoryRoot = new URL("../../..", import.meta.url).pathname;
const rlsPlansDirectory = join(repositoryRoot, "packages", "db", "rls", "__tests__");

if (!existsSync(rlsPlansDirectory)) {
  throw new Error("Missing RLS harness plan directory: packages/db/rls/__tests__");
}

const planFiles = readdirSync(rlsPlansDirectory).filter((fileName) =>
  fileName.endsWith(".rls-plan.json"),
);

if (planFiles.length === 0) {
  throw new Error("RLS harness has no plans and must fail closed");
}

for (const planFile of planFiles) {
  const planPath = join(rlsPlansDirectory, planFile);
  const plan = JSON.parse(readFileSync(planPath, "utf8"));

  if (!Array.isArray(plan.tables) || !Array.isArray(plan.cases)) {
    throw new Error(`Invalid RLS harness plan shape: ${planFile}`);
  }

  for (const table of plan.tables) {
    if (table.studentScoped !== true) {
      continue;
    }

    if (!Array.isArray(table.operations) || table.operations.length === 0) {
      throw new Error(
        `Student-scoped table ${table.tableName} must declare operation coverage in ${planFile}`,
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
        throw new Error(
          `Student-scoped table ${table.tableName} is missing deny case for ${operation} in ${planFile}`,
        );
      }
    }
  }
}

console.log(`RLS harness wiring passed: ${planFiles.length} plan file(s)`);