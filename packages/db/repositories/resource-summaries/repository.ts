// provenance is always "ai" for this table (NN-07); rendered at
// presentation via AIGeneratedBadge — see
// packages/ui-web/domain-components/ResourceSummaryCard.contract.ts.
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../../generated/database.types.js";
import type {
  DbResourceSummaryRecord,
  GetLatestResourceSummaryInput,
  ResourceSummariesRepository,
  SaveResourceSummaryInput,
} from "./contracts.js";
import { ResourceSummariesRepositoryError } from "./errors.js";
import { mapResourceSummaryRow } from "./mapper.js";

export type CreateResourceSummariesRepositoryInput = Readonly<{
  client: SupabaseClient<Database>;
}>;

const resourceSummarySelectColumns =
  "resource_summary_id,student_id,resource_id,prompt_version,summary_strategy_version,model_version,body,provenance,created_at" as const;

const resourceSummaryCitationSelectColumns =
  "resource_summary_citation_id,student_id,resource_summary_id,resource_id,chunk_id,quote,created_at" as const;

export function createResourceSummariesRepository(
  input: CreateResourceSummariesRepositoryInput,
): ResourceSummariesRepository {
  return {
    saveResourceSummary: async (
      summary: SaveResourceSummaryInput,
    ): Promise<DbResourceSummaryRecord> => {
      assertValidSaveInput(summary);

      const { data: summaryRow, error: insertError } = await input.client
        .from("resource_summaries")
        .insert({
          student_id: summary.studentId,
          resource_id: summary.resourceId,
          prompt_version: summary.promptVersion,
          summary_strategy_version: summary.summaryStrategyVersion,
          model_version: summary.modelVersion,
          body: summary.body as unknown as Json,
          provenance: "ai",
        })
        .select(resourceSummarySelectColumns)
        .single();

      if (insertError !== null) {
        throw new ResourceSummariesRepositoryError(
          "resource_summaries_repository_insert_failed",
          insertError.message,
        );
      }

      const { data: citationRows, error: citationError } = await input.client
        .from("resource_summary_citations")
        .insert(
          summary.citations.map((citation) => ({
            student_id: summary.studentId,
            resource_summary_id: summaryRow.resource_summary_id,
            resource_id: summary.resourceId,
            chunk_id: citation.chunkId,
            quote: citation.quote,
          })),
        )
        .select(resourceSummaryCitationSelectColumns);

      if (citationError !== null) {
        // Compensating cleanup: this repository does not have a database
        // transaction spanning both inserts (no precedent multi-table
        // transactional write exists in this package to mirror). Removing
        // the just-created summary row on citation-persistence failure
        // ensures a retried job (ENG-193) does not collide with
        // resource_summaries_student_resource_version_uniq on its next
        // attempt, and never leaves a summary row with zero citations
        // (ENG-252 — the resource itself remains unaffected either way).
        await input.client
          .from("resource_summaries")
          .delete()
          .eq("resource_summary_id", summaryRow.resource_summary_id);

        throw new ResourceSummariesRepositoryError(
          "resource_summaries_repository_citation_persistence_failed",
          citationError.message,
        );
      }

      return mapResourceSummaryRow(summaryRow, citationRows);
    },

    getLatestResourceSummary: async (
      lookup: GetLatestResourceSummaryInput,
    ): Promise<DbResourceSummaryRecord | null> => {
      const { data: summaryRow, error: readError } = await input.client
        .from("resource_summaries")
        .select(resourceSummarySelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("resource_id", lookup.resourceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (readError !== null) {
        throw new ResourceSummariesRepositoryError(
          "resource_summaries_repository_read_failed",
          readError.message,
        );
      }

      if (summaryRow === null) {
        return null;
      }

      const { data: citationRows, error: citationReadError } = await input.client
        .from("resource_summary_citations")
        .select(resourceSummaryCitationSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("resource_summary_id", summaryRow.resource_summary_id);

      if (citationReadError !== null) {
        throw new ResourceSummariesRepositoryError(
          "resource_summaries_repository_read_failed",
          citationReadError.message,
        );
      }

      return mapResourceSummaryRow(summaryRow, citationRows);
    },
  };
}

function assertValidSaveInput(input: SaveResourceSummaryInput): void {
  if (input.promptVersion.trim().length === 0) {
    throw new ResourceSummariesRepositoryError(
      "resource_summaries_repository_invalid_input",
      "Resource summary requires a prompt version.",
    );
  }

  if (input.summaryStrategyVersion.trim().length === 0) {
    throw new ResourceSummariesRepositoryError(
      "resource_summaries_repository_invalid_input",
      "Resource summary requires a summary strategy version.",
    );
  }

  if (input.modelVersion.trim().length === 0) {
    throw new ResourceSummariesRepositoryError(
      "resource_summaries_repository_invalid_input",
      "Resource summary requires a model version (ENG-235).",
    );
  }

  if (input.body.headings.length === 0) {
    throw new ResourceSummariesRepositoryError(
      "resource_summaries_repository_invalid_input",
      "Resource summary requires at least one heading.",
    );
  }

  if (input.citations.length === 0) {
    throw new ResourceSummariesRepositoryError(
      "resource_summaries_repository_invalid_input",
      "Resource summary requires at least one citation.",
    );
  }
}
