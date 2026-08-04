import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repositoryRoot = new URL("../../..", import.meta.url).pathname;
const supabaseDirectory = join(repositoryRoot, "supabase");
const requiredPaths = [
  "config.toml",
  "migrations",
  "policies",
  "seed",
  "seed/adaptivity",
  "functions",
];

for (const requiredPath of requiredPaths) {
  const absolutePath = join(supabaseDirectory, requiredPath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Missing required Supabase artifact path: supabase/${requiredPath}`);
  }
}

const policiesDirectory = join(supabaseDirectory, "policies");
const policyFiles = readdirSync(policiesDirectory).filter((fileName) =>
  fileName.endsWith(".policy.sql"),
);

for (const policyFile of policyFiles) {
  const policyPath = join(policiesDirectory, policyFile);
  const policyContents = readFileSync(policyPath, "utf8").toLowerCase();

  if (policyContents.includes("create policy") && policyContents.includes(" for all ")) {
    throw new Error(`Permissive ALL policy is prohibited: supabase/policies/${policyFile}`);
  }
}

console.log("Supabase artifact lint passed");
