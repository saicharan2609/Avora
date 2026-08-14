import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

import type { Database } from "../../generated/database.types.js";
import type {
  CreatePlacementCorrectionInput,
  DbAcademicTermId,
  DbPlacementCandidateId,
  DbPlacementCandidateProvenance,
  DbPlacementCandidateRecord,
  DbPlacementConfidenceLevel,
  DbPlacementConfidenceSource,
  DbPlacementCorrectionId,
  DbPlacementCorrectionRecord,
  DbResourcePlacementId,
  DbResourcePlacementRecord,
  DbResourcePlacementStatus,
  DbResourcePlacementTarget,
  DbStructureUnitId,
  DbSubjectId,
  ListResourcePlacementsByAcademicUnitInput,
  UpsertPlacementCandidateInput,
  UpsertResourcePlacementInput,
} from "./contracts.js";
import {
  ResourcePlacementRepositoryError,
} from "./errors.js";

type ResourcePlacementRow =
  Database["public"]["Tables"]["resource_placements"]["Row"];

type ResourcePlacementInsert =
  Database["public"]["Tables"]["resource_placements"]["Insert"];

type ResourcePlacementUpdate =
  Database["public"]["Tables"]["resource_placements"]["Update"];

type PlacementCorrectionRow =
  Database["public"]["Tables"]["resource_placement_corrections"]["Row"];

type PlacementCorrectionInsert =
  Database["public"]["Tables"]["resource_placement_corrections"]["Insert"];

type PlacementCandidateRow =
  Database["public"]["Tables"]["resource_placement_candidates"]["Row"];

type PlacementCandidateInsert =
  Database["public"]["Tables"]["resource_placement_candidates"]["Insert"];

type PlacementCandidateUpdate =
  Database["public"]["Tables"]["resource_placement_candidates"]["Update"];

export const placementCandidateSelectColumns =
  "candidate_id,student_id,resource_id,term_id,subject_id,structure_unit_id,confidence_level,confidence_source,confidence_reason,provenance,reason,created_at" as const;

export const resourcePlacementSelectColumns =
  "placement_id,student_id,resource_id,term_id,subject_id,structure_unit_id,confidence_level,confidence_source,confidence_reason,status,candidate_id,candidate_provenance,placement_reason,created_at,updated_at" as const;

export const placementCorrectionSelectColumns =
  "correction_id,student_id,resource_id,previous_term_id,previous_subject_id,previous_structure_unit_id,corrected_term_id,corrected_subject_id,corrected_structure_unit_id,reason,corrected_at" as const;

export function mapPlacementCandidateRow(
  row: PlacementCandidateRow,
): DbPlacementCandidateRecord {
  assertNonEmpty(row.candidate_id, "Placement candidate row must include candidate_id.");
  assertNonEmpty(row.student_id, "Placement candidate row must include student_id.");
  assertNonEmpty(row.resource_id, "Placement candidate row must include resource_id.");
  assertNonEmpty(row.term_id, "Placement candidate row must include term_id.");
  assertNonEmpty(row.subject_id, "Placement candidate row must include subject_id.");

  return {
    candidateId: row.candidate_id as DbPlacementCandidateId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    target: {
      termId: row.term_id as DbAcademicTermId,
      subjectId: row.subject_id as DbSubjectId,
      structureUnitId:
        row.structure_unit_id === null
          ? null
          : row.structure_unit_id as DbStructureUnitId,
    },
    confidence: {
      level: row.confidence_level as DbPlacementConfidenceLevel,
      source: row.confidence_source as DbPlacementConfidenceSource,
      reason: row.confidence_reason,
    },
    provenance: row.provenance as DbPlacementCandidateProvenance,
    reason: row.reason,
    createdAt: row.created_at as IsoDateTimeString,
  };
}

export function mapResourcePlacementRow(
  row: ResourcePlacementRow,
): DbResourcePlacementRecord {
  assertNonEmpty(row.placement_id, "Placement row must include placement_id.");
  assertNonEmpty(row.student_id, "Placement row must include student_id.");
  assertNonEmpty(row.resource_id, "Placement row must include resource_id.");
  assertNonEmpty(row.term_id, "Placement row must include term_id.");
  assertNonEmpty(row.subject_id, "Placement row must include subject_id.");

  return {
    placementId: row.placement_id as DbResourcePlacementId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    target: {
      termId: row.term_id as DbAcademicTermId,
      subjectId: row.subject_id as DbSubjectId,
      structureUnitId:
        row.structure_unit_id === null
          ? null
          : row.structure_unit_id as DbStructureUnitId,
    },
    confidence: {
      level: row.confidence_level as DbPlacementConfidenceLevel,
      source: row.confidence_source as DbPlacementConfidenceSource,
      reason: row.confidence_reason,
    },
    status: row.status as DbResourcePlacementStatus,
    candidateId:
      row.candidate_id === null
        ? null
        : row.candidate_id as DbPlacementCandidateId,
    candidateProvenance:
      row.candidate_provenance === null
        ? null
        : row.candidate_provenance as DbPlacementCandidateProvenance,
    placementReason: row.placement_reason,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

export function mapPlacementCorrectionRow(
  row: PlacementCorrectionRow,
): DbPlacementCorrectionRecord {
  assertNonEmpty(row.correction_id, "Placement correction row must include correction_id.");
  assertNonEmpty(row.student_id, "Placement correction row must include student_id.");
  assertNonEmpty(row.resource_id, "Placement correction row must include resource_id.");
  assertNonEmpty(row.corrected_term_id, "Placement correction row must include corrected_term_id.");
  assertNonEmpty(row.corrected_subject_id, "Placement correction row must include corrected_subject_id.");

  return {
    correctionId: row.correction_id as DbPlacementCorrectionId,
    studentId: row.student_id as StudentId,
    resourceId: row.resource_id as ResourceId,
    previousTarget:
      row.previous_term_id === null || row.previous_subject_id === null
        ? null
        : {
            termId: row.previous_term_id as DbAcademicTermId,
            subjectId: row.previous_subject_id as DbSubjectId,
            structureUnitId:
              row.previous_structure_unit_id === null
                ? null
                : row.previous_structure_unit_id as DbStructureUnitId,
          },
    correctedTarget: {
      termId: row.corrected_term_id as DbAcademicTermId,
      subjectId: row.corrected_subject_id as DbSubjectId,
      structureUnitId:
        row.corrected_structure_unit_id === null
          ? null
          : row.corrected_structure_unit_id as DbStructureUnitId,
    },
    reason: row.reason,
    correctedAt: row.corrected_at as IsoDateTimeString,
  };
}

export function mapUpsertPlacementCandidateInputToInsert(
  input: UpsertPlacementCandidateInput,
): PlacementCandidateInsert {
  assertValidPlacementCandidateInput(input);

  return {
    candidate_id: input.candidateId,
    student_id: input.studentId,
    resource_id: input.resourceId,
    term_id: input.target.termId,
    subject_id: input.target.subjectId,
    structure_unit_id: input.target.structureUnitId,
    confidence_level: input.confidence.level,
    confidence_source: input.confidence.source,
    confidence_reason: input.confidence.reason,
    provenance: input.provenance,
    reason: input.reason,
    created_at: input.createdAt,
  };
}

export function mapUpsertPlacementCandidateInputToUpdate(
  input: UpsertPlacementCandidateInput,
): PlacementCandidateUpdate {
  assertValidPlacementCandidateInput(input);

  return {
    term_id: input.target.termId,
    subject_id: input.target.subjectId,
    structure_unit_id: input.target.structureUnitId,
    confidence_level: input.confidence.level,
    confidence_source: input.confidence.source,
    confidence_reason: input.confidence.reason,
    provenance: input.provenance,
    reason: input.reason,
  };
}

export function mapUpsertPlacementInputToInsert(
  input: UpsertResourcePlacementInput,
): ResourcePlacementInsert {
  assertValidPlacementInput(input);

  return {
    placement_id: input.placementId,
    student_id: input.studentId,
    resource_id: input.resourceId,
    term_id: input.target.termId,
    subject_id: input.target.subjectId,
    structure_unit_id: input.target.structureUnitId,
    confidence_level: input.confidence.level,
    confidence_source: input.confidence.source,
    confidence_reason: input.confidence.reason,
    status: input.status,
    candidate_id: input.candidateId,
    candidate_provenance: input.candidateProvenance,
    placement_reason: input.placementReason,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}

export function mapUpsertPlacementInputToUpdate(
  input: UpsertResourcePlacementInput,
): ResourcePlacementUpdate {
  assertValidPlacementInput(input);

  return {
    term_id: input.target.termId,
    subject_id: input.target.subjectId,
    structure_unit_id: input.target.structureUnitId,
    confidence_level: input.confidence.level,
    confidence_source: input.confidence.source,
    confidence_reason: input.confidence.reason,
    status: input.status,
    candidate_id: input.candidateId,
    candidate_provenance: input.candidateProvenance,
    placement_reason: input.placementReason,
    updated_at: input.updatedAt,
  };
}

export function mapCreatePlacementCorrectionInputToInsert(
  input: CreatePlacementCorrectionInput,
): PlacementCorrectionInsert {
  assertValidCorrectionInput(input);

  return {
    correction_id: input.correctionId,
    student_id: input.studentId,
    resource_id: input.resourceId,
    previous_term_id: input.previousTarget?.termId ?? null,
    previous_subject_id: input.previousTarget?.subjectId ?? null,
    previous_structure_unit_id: input.previousTarget?.structureUnitId ?? null,
    corrected_term_id: input.correctedTarget.termId,
    corrected_subject_id: input.correctedTarget.subjectId,
    corrected_structure_unit_id: input.correctedTarget.structureUnitId,
    reason: input.reason,
    corrected_at: input.correctedAt,
  };
}

export function assertValidAcademicUnitListInput(
  input: ListResourcePlacementsByAcademicUnitInput,
): void {
  assertNonEmpty(input.studentId, "Academic unit placement list requires a student id.");
  assertNonEmpty(input.target.termId, "Academic unit placement list requires a term id.");
}

function assertValidPlacementCandidateInput(
  input: UpsertPlacementCandidateInput,
): void {
  assertNonEmpty(input.candidateId, "Placement candidate requires a candidate id.");
  assertNonEmpty(input.studentId, "Placement candidate requires a student id.");
  assertNonEmpty(input.resourceId, "Placement candidate requires a resource id.");
  assertNonEmpty(input.target.termId, "Placement candidate requires a term id.");
  assertNonEmpty(input.target.subjectId, "Placement candidate requires a subject id.");

  if (input.confidence.reason !== null) {
    assertNonEmpty(
      input.confidence.reason,
      "Placement candidate confidence reason must not be blank.",
    );
  }

  if (input.reason !== null) {
    assertNonEmpty(
      input.reason,
      "Placement candidate reason must not be blank.",
    );
  }

  assertNonEmpty(
    input.createdAt,
    "Placement candidate requires a created-at timestamp.",
  );
}

function assertValidPlacementInput(input: UpsertResourcePlacementInput): void {
  assertNonEmpty(input.placementId, "Placement requires a placement id.");
  assertNonEmpty(input.studentId, "Placement requires a student id.");
  assertNonEmpty(input.resourceId, "Placement requires a resource id.");
  assertNonEmpty(input.target.termId, "Placement requires a term id.");
  assertNonEmpty(input.target.subjectId, "Placement requires a subject id.");

  if (input.confidence.reason !== null) {
    assertNonEmpty(
      input.confidence.reason,
      "Placement confidence reason must not be blank.",
    );
  }

  if (input.placementReason !== null) {
    assertNonEmpty(
      input.placementReason,
      "Placement reason must not be blank.",
    );
  }

  if (
    (input.candidateId === null && input.candidateProvenance !== null)
    || (input.candidateId !== null && input.candidateProvenance === null)
  ) {
    throw new ResourcePlacementRepositoryError(
      "resource_placement_repository_invalid_input",
      "Placement candidate id and provenance must both be present or both be null.",
    );
  }
}

function assertValidCorrectionInput(
  input: CreatePlacementCorrectionInput,
): void {
  assertNonEmpty(input.correctionId, "Placement correction requires a correction id.");
  assertNonEmpty(input.studentId, "Placement correction requires a student id.");
  assertNonEmpty(input.resourceId, "Placement correction requires a resource id.");
  assertNonEmpty(
    input.correctedTarget.termId,
    "Placement correction requires a corrected term id.",
  );
  assertNonEmpty(
    input.correctedTarget.subjectId,
    "Placement correction requires a corrected subject id.",
  );

  if (input.reason !== null) {
    assertNonEmpty(input.reason, "Placement correction reason must not be blank.");
  }
}

function assertNonEmpty(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new ResourcePlacementRepositoryError(
      "resource_placement_repository_invalid_input",
      message,
    );
  }
}