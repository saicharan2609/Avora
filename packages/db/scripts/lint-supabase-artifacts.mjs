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

const migrationsDirectory = join(supabaseDirectory, "migrations");
const migrationFiles = readdirSync(migrationsDirectory).filter((fileName) =>
  fileName.endsWith(".sql"),
);

const requiredMigrations = [
  "20260804174000_foundation.sql",
  "20260804234500_identity_students.sql",
  "20260805191000_identity_auth_user_trigger.sql",
  "20260805223000_resources_upload_intent.sql",
];

for (const requiredMigration of requiredMigrations) {
  const migrationPath = join(migrationsDirectory, requiredMigration);

  if (!existsSync(migrationPath)) {
    throw new Error(`Missing required migration: supabase/migrations/${requiredMigration}`);
  }
}

for (const migrationFile of migrationFiles) {
  const migrationPath = join(migrationsDirectory, migrationFile);
  const migrationContents = readFileSync(migrationPath, "utf8").toLowerCase();

  if (migrationContents.includes("create table public.students")) {
    if (!migrationContents.includes("alter table public.students enable row level security")) {
      throw new Error("public.students migration must enable RLS before exposure");
    }

    if (!migrationContents.includes("alter table public.students force row level security")) {
      throw new Error("public.students migration must force RLS");
    }
  }

  if (migrationContents.includes("create table public.resources")) {
    if (!migrationContents.includes("student_id uuid not null")) {
      throw new Error("public.resources must include a non-null student_id");
    }

    if (!migrationContents.includes("alter table public.resources enable row level security")) {
      throw new Error("public.resources migration must enable RLS before exposure");
    }

    if (!migrationContents.includes("alter table public.resources force row level security")) {
      throw new Error("public.resources migration must force RLS");
    }

    if (!migrationContents.includes("starts_with(storage_object_path, student_id::text || '/')")) {
      throw new Error("public.resources storage paths must begin with student_id");
    }
  }

  if (
    migrationContents.includes("create trigger on_auth_user_created_create_student") &&
    !migrationContents.includes("after insert on auth.users")
  ) {
    throw new Error(
      "auth-user student creation trigger must be an after-insert trigger on auth.users",
    );
  }

  if (
    migrationContents.includes("create function app_private.create_student_for_auth_user") &&
    !migrationContents.includes("security definer")
  ) {
    throw new Error("auth-user student creation function must be security definer");
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

  if (!policyContents.includes("student_id = auth.uid()")) {
    throw new Error(
      `Student-scoped policy artifact must include the ownership predicate: supabase/policies/${policyFile}`,
    );
  }
}

const requiredPolicyArtifacts = ["students.policy.sql", "resources.policy.sql"];

for (const requiredPolicyArtifact of requiredPolicyArtifacts) {
  const policyPath = join(policiesDirectory, requiredPolicyArtifact);

  if (!existsSync(policyPath)) {
    throw new Error(`Missing required policy artifact: supabase/policies/${requiredPolicyArtifact}`);
  }
}

console.log("Supabase artifact lint passed");