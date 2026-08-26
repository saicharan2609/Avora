// SEC-007 / ENG-310 structural verification for the three data destinations
// Stage 12 Group 7 introduced: public.resource_summaries,
// public.resource_summary_citations, public.resource_summary_jobs.
//
// This repository has no orchestrated multi-store deletion service yet
// (that is Stage 12 Group 11's scope — see docs/MASTER-ROADMAP.md "Group
// 11: Multi-Store Deletion Cascade"). Every existing resource-derived table
// (chunks, chunk_embeddings, resource_extraction_documents,
// resource_placements, resource_classification_jobs, resource_indexing_jobs,
// etc.) satisfies SEC-007 today purely through `on delete cascade` foreign
// keys to public.resources and public.students — there is no other
// mechanism to "join" in this codebase as it stands. This script mechanically
// verifies that each of Group 7's three new tables carries the same
// unconditional cascade linkage, mirroring the declarative,
// no-live-database verification style already used by
// packages/db/rls/harness/run-rls-plans.mjs for RLS coverage.
//
// This script does NOT verify runtime cascade behaviour (that requires a
// live Postgres instance — see this group's implementation report for a
// one-time verification run against a real Postgres+pgvector container).
// It verifies that the migration SQL text on disk still declares the
// required constraints, so a future edit to these migrations cannot
// silently drop deletion linkage without failing this check.

import { readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

class DeletionCascadeVerificationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DeletionCascadeVerificationError";
  }
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const dbPackageDirectory = join(scriptDirectory, "..");
const repositoryRoot = join(dbPackageDirectory, "..", "..");
const migrationsDirectory = join(repositoryRoot, "supabase", "migrations");

const requiredCascadeLinks = [
  {
    migrationFile: "20260826110000_resource_summaries.sql",
    tableName: "public.resource_summaries",
    requiredSubstrings: [
      "student_id uuid not null references public.students (student_id) on delete cascade",
      "resource_id uuid not null references public.resources (resource_id) on delete cascade",
    ],
  },
  {
    migrationFile: "20260826111000_resource_summary_citations.sql",
    tableName: "public.resource_summary_citations",
    requiredSubstrings: [
      "student_id uuid not null references public.students (student_id) on delete cascade",
      "resource_summary_id uuid not null references public.resource_summaries (resource_summary_id) on delete cascade",
      "references public.resources (student_id, resource_id)",
      "references public.chunks (student_id, chunk_id)",
    ],
  },
  {
    migrationFile: "20260826112000_resource_summary_jobs.sql",
    tableName: "public.resource_summary_jobs",
    requiredSubstrings: [
      "student_id uuid not null references public.students (student_id) on delete cascade",
      "resource_id uuid not null references public.resources (resource_id) on delete cascade",
    ],
  },
];

async function main() {
  let checkedTableCount = 0;
  let checkedConstraintCount = 0;

  for (const link of requiredCascadeLinks) {
    const filePath = join(migrationsDirectory, link.migrationFile);
    const sql = await readMigrationText(filePath);
    const normalizedSql = normalizeWhitespace(sql);

    for (const requiredSubstring of link.requiredSubstrings) {
      const normalizedRequired = normalizeWhitespace(requiredSubstring);

      if (!normalizedSql.includes(normalizedRequired)) {
        throw new DeletionCascadeVerificationError(
          `${link.tableName} (${link.migrationFile}) is missing the required cascade linkage: "${requiredSubstring}". SEC-007/ENG-310 requires every new student-data destination to join the deletion cascade — this table's foreign keys must include "on delete cascade".`,
        );
      }

      checkedConstraintCount += 1;
    }

    checkedTableCount += 1;
  }

  console.log(
    `Deletion cascade linkage verified: ${checkedTableCount} tables, ${checkedConstraintCount} cascade constraints confirmed present in ${relative(repositoryRoot, migrationsDirectory)}.`,
  );
}

async function readMigrationText(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    throw new DeletionCascadeVerificationError(
      `Unable to read migration file ${relative(repositoryRoot, filePath)}: ${formatUnknownError(error)}`,
    );
  }
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function formatUnknownError(error) {
  return error instanceof Error ? error.message : String(error);
}

main().catch((error) => {
  console.error("Deletion cascade verification failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
