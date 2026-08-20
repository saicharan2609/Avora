import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const validOperations = new Set(["select", "insert", "update", "delete"]);
const validCanonicalOutcomes = new Set(["allow", "deny"]);
const validDescriptiveExpectations = new Set(["allowed", "denied"]);

const harnessDirectory = dirname(fileURLToPath(import.meta.url));
const dbPackageDirectory = join(harnessDirectory, "..", "..");
const plansDirectory = join(dbPackageDirectory, "rls", "__tests__");

class RlsHarnessConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "RlsHarnessConfigurationError";
  }
}

async function main() {
  const planFileNames = await discoverPlanFileNames();

  if (planFileNames.length === 0) {
    throw new RlsHarnessConfigurationError(
      `No RLS plan files found in ${relative(dbPackageDirectory, plansDirectory)}.`,
    );
  }

  const summaries = [];

  for (const fileName of planFileNames) {
    const filePath = join(plansDirectory, fileName);
    const rawPlan = await readJsonFile(filePath);
    const plan = normalizePlan(rawPlan, fileName);

    assertRlsHarnessPlan(plan);

    summaries.push({
      fileName,
      tableCount: plan.tables.length,
      caseCount: plan.cases.length,
    });
  }

  const totalCases = summaries.reduce(
    (sum, summary) => sum + summary.caseCount,
    0,
  );

  console.log(
    `RLS plan harness passed: ${summaries.length} plans, ${totalCases} cases.`,
  );

  for (const summary of summaries) {
    console.log(
      `- ${summary.fileName}: ${summary.tableCount} tables, ${summary.caseCount} cases`,
    );
  }
}

async function discoverPlanFileNames() {
  let entries;

  try {
    entries = await readdir(plansDirectory, {
      withFileTypes: true,
    });
  } catch (error) {
    throw new RlsHarnessConfigurationError(
      `Unable to read RLS plan directory ${relative(dbPackageDirectory, plansDirectory)}: ${formatUnknownError(error)}`,
    );
  }

  return entries
    .filter(
      (entry) =>
        entry.isFile() && entry.name.endsWith(".rls-plan.json"),
    )
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function readJsonFile(filePath) {
  let content;

  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    throw new RlsHarnessConfigurationError(
      `Unable to read ${relative(dbPackageDirectory, filePath)}: ${formatUnknownError(error)}`,
    );
  }

  try {
    return JSON.parse(content.replace(/^\uFEFF/, ""));
  } catch (error) {
    throw new RlsHarnessConfigurationError(
      `Invalid JSON in ${relative(dbPackageDirectory, filePath)}: ${formatUnknownError(error)}`,
    );
  }
}

function normalizePlan(rawPlan, fileName) {
  assertPlainObject(rawPlan, `${fileName}: plan`);

  if (isCanonicalPlan(rawPlan)) {
    return normalizeCanonicalPlan(rawPlan, fileName);
  }

  if (isDescriptivePlan(rawPlan)) {
    return normalizeDescriptivePlan(rawPlan, fileName);
  }

  if (isSingleTableDescriptivePlan(rawPlan)) {
    return normalizeSingleTableDescriptivePlan(rawPlan, fileName);
  }

  throw new RlsHarnessConfigurationError(
    `${fileName}: unsupported RLS plan shape. Expected canonical, descriptive multi-table, or single-table descriptive plan shape.`,
  );
}

function isCanonicalPlan(plan) {
  return (
    Array.isArray(plan.tables) &&
    plan.tables.every(
      (table) =>
        isPlainObject(table) &&
        typeof table.tableName === "string" &&
        typeof table.studentScoped === "boolean" &&
        Array.isArray(table.operations),
    ) &&
    Array.isArray(plan.cases)
  );
}

function normalizeCanonicalPlan(plan, fileName) {
  const tables = plan.tables.map((table, tableIndex) => ({
    tableName: requireNonEmptyString(
      table.tableName,
      `${fileName}: tables[${tableIndex}].tableName`,
    ),
    studentScoped: table.studentScoped,
    operations: normalizeOperations(
      table.operations,
      `${fileName}: tables[${tableIndex}].operations`,
    ),
  }));

  const cases = plan.cases.map((testCase, caseIndex) => {
    assertPlainObject(testCase, `${fileName}: cases[${caseIndex}]`);

    return {
      caseName: requireNonEmptyString(
        testCase.caseName,
        `${fileName}: cases[${caseIndex}].caseName`,
      ),
      tableName: requireNonEmptyString(
        testCase.tableName,
        `${fileName}: cases[${caseIndex}].tableName`,
      ),
      operation: normalizeOperation(
        testCase.operation,
        `${fileName}: cases[${caseIndex}].operation`,
      ),
      expectedOutcome: normalizeCanonicalOutcome(
        testCase.expectedOutcome,
        `${fileName}: cases[${caseIndex}].expectedOutcome`,
      ),
    };
  });

  assertCasesReferenceDeclaredTables({
    fileName,
    tables,
    cases,
  });

  return {
    tables,
    cases,
  };
}

function isDescriptivePlan(plan) {
  return (
    Array.isArray(plan.tables) &&
    plan.tables.every((table) => typeof table === "string") &&
    Array.isArray(plan.cases) &&
    plan.cases.every(
      (testCase) =>
        isPlainObject(testCase) &&
        typeof testCase.name === "string" &&
        typeof testCase.table === "string" &&
        typeof testCase.operation === "string" &&
        typeof testCase.expectation === "string",
    )
  );
}

function normalizeDescriptivePlan(plan, fileName) {
  const tableNames = plan.tables.map((tableName, tableIndex) =>
    requireNonEmptyString(tableName, `${fileName}: tables[${tableIndex}]`),
  );

  const cases = plan.cases.map((testCase, caseIndex) => ({
    caseName: requireNonEmptyString(
      testCase.name,
      `${fileName}: cases[${caseIndex}].name`,
    ),
    tableName: requireNonEmptyString(
      testCase.table,
      `${fileName}: cases[${caseIndex}].table`,
    ),
    operation: normalizeOperation(
      testCase.operation,
      `${fileName}: cases[${caseIndex}].operation`,
    ),
    expectedOutcome: normalizeDescriptiveExpectation(
      testCase.expectation,
      `${fileName}: cases[${caseIndex}].expectation`,
    ),
  }));

  const tables = tableNames.map((tableName) => ({
    tableName,
    studentScoped: true,
    operations: unique(
      cases
        .filter((testCase) => testCase.tableName === tableName)
        .map((testCase) => testCase.operation),
    ),
  }));

  assertCasesReferenceDeclaredTables({
    fileName,
    tables,
    cases,
  });

  return {
    tables,
    cases,
  };
}

function isSingleTableDescriptivePlan(plan) {
  return (
    typeof plan.table === "string" &&
    Array.isArray(plan.cases) &&
    plan.cases.every(
      (testCase) =>
        isPlainObject(testCase) &&
        typeof testCase.name === "string" &&
        typeof testCase.operation === "string" &&
        typeof testCase.expectation === "string",
    )
  );
}

function normalizeSingleTableDescriptivePlan(plan, fileName) {
  const tableName = requireNonEmptyString(
    plan.table,
    `${fileName}: table`,
  );

  const cases = plan.cases.map((testCase, caseIndex) => ({
    caseName: requireNonEmptyString(
      testCase.name,
      `${fileName}: cases[${caseIndex}].name`,
    ),
    tableName,
    operation: normalizeOperation(
      testCase.operation,
      `${fileName}: cases[${caseIndex}].operation`,
    ),
    expectedOutcome: normalizeDescriptiveExpectation(
      testCase.expectation,
      `${fileName}: cases[${caseIndex}].expectation`,
    ),
  }));

  const tables = [
    {
      tableName,
      studentScoped: true,
      operations: unique(cases.map((testCase) => testCase.operation)),
    },
  ];

  return {
    tables,
    cases,
  };
}

function assertRlsHarnessPlan(plan) {
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

function assertCasesReferenceDeclaredTables(input) {
  const declaredTableNames = new Set(
    input.tables.map((table) => table.tableName),
  );

  for (const testCase of input.cases) {
    if (!declaredTableNames.has(testCase.tableName)) {
      throw new RlsHarnessConfigurationError(
        `${input.fileName}: case ${testCase.caseName} references undeclared table ${testCase.tableName}`,
      );
    }
  }
}

function normalizeOperations(operations, label) {
  if (!Array.isArray(operations)) {
    throw new RlsHarnessConfigurationError(
      `${label} must be an array.`,
    );
  }

  return unique(
    operations.map((operation, operationIndex) =>
      normalizeOperation(
        operation,
        `${label}[${operationIndex}]`,
      ),
    ),
  );
}

function normalizeOperation(operation, label) {
  const value = requireNonEmptyString(operation, label);

  if (!validOperations.has(value)) {
    throw new RlsHarnessConfigurationError(
      `${label} must be one of ${formatSet(validOperations)}; received ${value}.`,
    );
  }

  return value;
}

function normalizeCanonicalOutcome(outcome, label) {
  const value = requireNonEmptyString(outcome, label);

  if (!validCanonicalOutcomes.has(value)) {
    throw new RlsHarnessConfigurationError(
      `${label} must be one of ${formatSet(validCanonicalOutcomes)}; received ${value}.`,
    );
  }

  return value;
}

function normalizeDescriptiveExpectation(expectation, label) {
  const value = requireNonEmptyString(expectation, label);

  if (!validDescriptiveExpectations.has(value)) {
    throw new RlsHarnessConfigurationError(
      `${label} must be one of ${formatSet(validDescriptiveExpectations)}; received ${value}.`,
    );
  }

  return value === "allowed" ? "allow" : "deny";
}

function requireNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RlsHarnessConfigurationError(
      `${label} must be a non-empty string.`,
    );
  }

  return value;
}

function assertPlainObject(value, label) {
  if (!isPlainObject(value)) {
    throw new RlsHarnessConfigurationError(
      `${label} must be an object.`,
    );
  }
}

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function unique(values) {
  return [...new Set(values)];
}

function formatSet(values) {
  return [...values].join(", ");
}

function formatUnknownError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

main().catch((error) => {
  console.error("RLS plan harness failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});