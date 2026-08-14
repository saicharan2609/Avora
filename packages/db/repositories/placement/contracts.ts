import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  IsoDateTimeString,
} from "@avora/core/time";

export type DbResourcePlacementId = string & {
  readonly __brand: "DbResourcePlacementId";
};

export type DbPlacementCandidateId = string & {
  readonly __brand: "DbPlacementCandidateId";
};

export type DbPlacementCorrectionId = string & {
  readonly __brand: "DbPlacementCorrectionId";
};

export type DbAcademicTermId = string & {
  readonly __brand: "DbAcademicTermId";
};

export type DbSubjectId = string & {
  readonly __brand: "DbSubjectId";
};

export type DbStructureUnitId = string & {
  readonly __brand: "DbStructureUnitId";
};

export type DbResourcePlacementStatus =
  | "accepted"
  | "tentative";

export type DbPlacementCandidateProvenance =
  | "resource_metadata"
  | "resource_content"
  | "student_declared"
  | "imported";

export type DbPlacementConfidenceLevel =
  | "student_confirmed"
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type DbPlacementConfidenceSource =
  | "student"
  | "imported"
  | "system_suggested";

export type DbPlacementConfidence = Readonly<{
  level: DbPlacementConfidenceLevel;
  source: DbPlacementConfidenceSource;
  reason: string | null;
}>;

export type DbResourcePlacementTarget = Readonly<{
  termId: DbAcademicTermId;
  subjectId: DbSubjectId;
  structureUnitId: DbStructureUnitId | null;
}>;

export type DbResourcePlacementRecord = Readonly<{
  placementId: DbResourcePlacementId;
  studentId: StudentId;
  resourceId: ResourceId;
  target: DbResourcePlacementTarget;
  confidence: DbPlacementConfidence;
  status: DbResourcePlacementStatus;
  candidateId: DbPlacementCandidateId | null;
  candidateProvenance: DbPlacementCandidateProvenance | null;
  placementReason: string | null;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type DbPlacementCorrectionRecord = Readonly<{
  correctionId: DbPlacementCorrectionId;
  studentId: StudentId;
  resourceId: ResourceId;
  previousTarget: DbResourcePlacementTarget | null;
  correctedTarget: DbResourcePlacementTarget;
  reason: string | null;
  correctedAt: IsoDateTimeString;
}>;

export type UpsertResourcePlacementInput = Readonly<{
  placementId: DbResourcePlacementId;
  studentId: StudentId;
  resourceId: ResourceId;
  target: DbResourcePlacementTarget;
  confidence: DbPlacementConfidence;
  status: DbResourcePlacementStatus;
  candidateId: DbPlacementCandidateId | null;
  candidateProvenance: DbPlacementCandidateProvenance | null;
  placementReason: string | null;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}>;

export type GetResourcePlacementByResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type GetResourcePlacementByIdInput = Readonly<{
  studentId: StudentId;
  placementId: DbResourcePlacementId;
}>;

export type CreatePlacementCorrectionInput = Readonly<{
  correctionId: DbPlacementCorrectionId;
  studentId: StudentId;
  resourceId: ResourceId;
  previousTarget: DbResourcePlacementTarget | null;
  correctedTarget: DbResourcePlacementTarget;
  reason: string | null;
  correctedAt: IsoDateTimeString;
}>;

export type ListPlacementCorrectionsByResourceInput = Readonly<{
  studentId: StudentId;
  resourceId: ResourceId;
}>;

export type ResourcePlacementRepository = Readonly<{
  upsertResourcePlacement: (
    input: UpsertResourcePlacementInput,
  ) => Promise<DbResourcePlacementRecord>;
  getResourcePlacementByResource: (
    input: GetResourcePlacementByResourceInput,
  ) => Promise<DbResourcePlacementRecord | null>;
  getResourcePlacementById: (
    input: GetResourcePlacementByIdInput,
  ) => Promise<DbResourcePlacementRecord | null>;
  createPlacementCorrection: (
    input: CreatePlacementCorrectionInput,
  ) => Promise<DbPlacementCorrectionRecord>;
  listPlacementCorrectionsByResource: (
    input: ListPlacementCorrectionsByResourceInput,
  ) => Promise<readonly DbPlacementCorrectionRecord[]>;
}>;