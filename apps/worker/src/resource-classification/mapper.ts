import { createHash } from "node:crypto";

import type {
  DbAcademicStructureTree,
  DbStructureUnitNode,
} from "@avora/db/repositories/academic";
import type { DbRetrievalChunkRecord } from "@avora/db/repositories/chunks";
import type {
  AcademicStructureTree,
  StructureUnitNode,
  SubjectId,
} from "@avora/domain/academic";
import type {
  ClassificationContentSignal,
  ClassificationSimilaritySignal,
  PlacementCandidateId,
} from "@avora/domain/resources";
import type { ResourceId } from "@avora/core/identity";
import type { ScopedSearchResult } from "@avora/retrieval/search";

// Every content_kind other than "heading" is treated as generic content
// evidence. Chunk kind is trusted, extracted structure — never a raw byte
// interpretation and never a hierarchy label (NN-01, ENG-029): this mapping
// only distinguishes "heading" from "not heading", nothing about level or
// position is inferred.
export function mapChunkToContentSignal(
  chunk: DbRetrievalChunkRecord,
): ClassificationContentSignal {
  return {
    kind: chunk.contentKind === "heading" ? "heading" : "content",
    text: chunk.text,
  };
}

export function mapDbAcademicStructureTreeToDomain(
  tree: DbAcademicStructureTree,
): AcademicStructureTree {
  return {
    terms: tree.terms.map((termTree) => ({
      term: termTree.term as unknown as AcademicStructureTree["terms"][number]["term"],
      subjects: termTree.subjects.map((subjectTree) => ({
        subject:
          subjectTree.subject as unknown as AcademicStructureTree["terms"][number]["subjects"][number]["subject"],
        units: subjectTree.units.map(mapDbStructureUnitNodeToDomain),
      })),
    })),
  };
}

function mapDbStructureUnitNodeToDomain(
  node: DbStructureUnitNode,
): StructureUnitNode {
  return {
    unit: node.unit as unknown as StructureUnitNode["unit"],
    children: node.children.map(mapDbStructureUnitNodeToDomain),
  };
}

// A stable, deterministic candidate identity derived from the logical
// classification identity (student, resource, classification strategy
// version) rather than a fresh random id per attempt. This is required for
// idempotent retries (ENG-191, ENG-139): resource_placement_candidates has
// no unique constraint on (student_id, resource_id), only on
// (student_id, candidate_id), so a retried classification attempt must
// resolve to the *same* candidate row via savePlacementCandidate's existing
// upsert-by-candidate_id semantics, never create a duplicate.
export function deriveDeterministicCandidateId(seed: Readonly<{
  studentId: string;
  resourceId: string;
  classificationStrategyVersion: string;
}>): PlacementCandidateId {
  const digest = createHash("sha256")
    .update(`${seed.studentId}:${seed.resourceId}:${seed.classificationStrategyVersion}`)
    .digest("hex");

  const uuid = [
    digest.slice(0, 8),
    digest.slice(8, 12),
    `4${digest.slice(13, 16)}`,
    `8${digest.slice(17, 20)}`,
    digest.slice(20, 32),
  ].join("-");

  return uuid as PlacementCandidateId;
}

const SIMILARITY_QUERY_MAX_CHARACTERS = 2000;

// Builds the query text handed to RetrievalSearchPort for the corpus-
// similarity signal. Headings are the most representative summary of a
// document's subject matter and are preferred; the filename is a fallback
// only when no headings were extracted yet (e.g. classification firing
// before chunking/indexing completes for this resource — the query still
// resolves against the student's *other*, already-indexed resources).
export function buildSimilarityQueryText(input: Readonly<{
  contentSignals: readonly ClassificationContentSignal[];
  originalFilename: string;
}>): string {
  const headingText = input.contentSignals
    .filter((signal) => signal.kind === "heading")
    .map((signal) => signal.text)
    .join(" ")
    .trim();

  const queryText = headingText.length > 0 ? headingText : input.originalFilename;

  return queryText.slice(0, SIMILARITY_QUERY_MAX_CHARACTERS);
}

// architecture.md 19.4: "extracted content similarity to existing subject
// corpora." Each ranked hybrid-search hit against the student's own
// already-indexed corpus becomes one similarity signal for the subject that
// hit's chunk is scoped to. The resource currently being classified is
// excluded from its own comparison set (a resource is never evidence for
// its own placement) and chunks with no resolved subject scope (not yet
// placed) are skipped — they carry no classification evidence.
export function mapSearchResultsToSimilaritySignals(
  searchResult: ScopedSearchResult,
  excludeResourceId: ResourceId,
): readonly ClassificationSimilaritySignal[] {
  const signals: ClassificationSimilaritySignal[] = [];

  for (const result of searchResult.results) {
    if (result.chunk.resourceId === excludeResourceId) {
      continue;
    }

    const subjectId = result.chunk.scope.subjectId;

    if (subjectId === null) {
      continue;
    }

    signals.push({
      subjectId: subjectId as unknown as SubjectId,
      rank: result.rank,
    });
  }

  return signals;
}
