import type {
  ResourceId,
  StudentId,
} from "@avora/core/identity";
import type {
  AcademicTermId,
  PlacementConfidenceLevel,
  PlacementConfidenceSource,
  StructureUnitId,
  SubjectId,
} from "@avora/domain/academic";
import type {
  GetPlacementCandidateByIdInput,
  GetResourcePlacementByIdInput,
  GetResourcePlacementByResourceInput,
  ListPlacementCandidatesByResourceInput,
  ListPlacementCorrectionsByResourceInput,
  ListResourcePlacementsByAcademicUnitInput,
  PlacementCandidate,
  PlacementCandidateId,
  PlacementCorrection,
  PlacementCorrectionId,
  RecordPlacementCorrectionInput,
  ReplaceResourcePlacementInput,
  ResourcePlacement,
  ResourcePlacementId,
  ResourcePlacementRepositoryPort,
  ResourcePlacementTarget,
  SaveResourcePlacementInput,
} from "@avora/domain/resources";
import type {
  DbPlacementCandidateId,
  DbPlacementCandidateRecord,
  DbPlacementCorrectionId,
  DbPlacementCorrectionRecord,
  DbResourcePlacementId,
  DbResourcePlacementRecord,
  DbResourcePlacementTarget,
  GetPlacementCandidateByIdInput as DbGetPlacementCandidateByIdInput,
  ListResourcePlacementsByAcademicUnitInput as DbListResourcePlacementsByAcademicUnitInput,
  ResourcePlacementRepository,
} from "@avora/db/repositories/placement";
import type {
  DbAcademicTermId,
  DbStructureUnitId,
  DbSubjectId,
} from "@avora/db/repositories/academic";

export type CreateResourcePlacementRepositoryPortAdapterInput = Readonly<{
  repository: ResourcePlacementRepository;
}>;

export function createResourcePlacementRepositoryPortAdapter(
  input: CreateResourcePlacementRepositoryPortAdapterInput,
): ResourcePlacementRepositoryPort {
  return {
    savePlacement: async (
      placementInput: SaveResourcePlacementInput,
    ): Promise<ResourcePlacement> => {
      const saved = await input.repository.upsertResourcePlacement({
        placementId: placementInput.placement.placementId as unknown as DbResourcePlacementId,
        studentId: placementInput.placement.studentId,
        resourceId: placementInput.placement.resourceId,
        target: mapDomainTargetToDb(placementInput.placement.target),
        confidence: placementInput.placement.confidence,
        status: placementInput.placement.status,
        candidateId:
          placementInput.candidate === null
            ? null
            : placementInput.candidate.candidateId as unknown as DbPlacementCandidateId,
        candidateProvenance: placementInput.candidate?.provenance ?? null,
        placementReason: placementInput.placementReason,
        createdAt: placementInput.placement.createdAt,
        updatedAt: placementInput.placement.updatedAt,
      });

      return mapDbPlacementToDomain(saved);
    },

    getPlacementByResource: async (
      lookup: GetResourcePlacementByResourceInput,
    ): Promise<ResourcePlacement | null> => {
      const placement = await input.repository.getResourcePlacementByResource({
        studentId: lookup.studentId,
        resourceId: lookup.resourceId,
      });

      return placement === null ? null : mapDbPlacementToDomain(placement);
    },

    getPlacementById: async (
      lookup: GetResourcePlacementByIdInput,
    ): Promise<ResourcePlacement | null> => {
      const placement = await input.repository.getResourcePlacementById({
        studentId: lookup.studentId,
        placementId: lookup.placementId as unknown as DbResourcePlacementId,
      });

      return placement === null ? null : mapDbPlacementToDomain(placement);
    },

    replacePlacement: async (
      placementInput: ReplaceResourcePlacementInput,
    ): Promise<ResourcePlacement> => {
      const saved = await input.repository.upsertResourcePlacement({
        placementId: placementInput.placement.placementId as unknown as DbResourcePlacementId,
        studentId: placementInput.placement.studentId,
        resourceId: placementInput.placement.resourceId,
        target: mapDomainTargetToDb(placementInput.placement.target),
        confidence: placementInput.placement.confidence,
        status: placementInput.placement.status,
        candidateId:
          placementInput.candidate === null
            ? null
            : placementInput.candidate.candidateId as unknown as DbPlacementCandidateId,
        candidateProvenance: placementInput.candidate?.provenance ?? null,
        placementReason: placementInput.placementReason,
        createdAt: placementInput.placement.createdAt,
        updatedAt: placementInput.placement.updatedAt,
      });

      return mapDbPlacementToDomain(saved);
    },

    getPlacementCandidateById: async (
      lookup: GetPlacementCandidateByIdInput,
    ): Promise<PlacementCandidate | null> => {
      const candidate = await input.repository.getPlacementCandidateById(
        mapGetPlacementCandidateByIdInputToDb(lookup),
      );

      return candidate === null ? null : mapDbCandidateToDomain(candidate);
    },

    listPlacementCandidatesByResource: async (
      lookup: ListPlacementCandidatesByResourceInput,
    ): Promise<readonly PlacementCandidate[]> => {
      const candidates = await input.repository.listPlacementCandidatesByResource({
        studentId: lookup.studentId,
        resourceId: lookup.resourceId,
      });

      return candidates.map(mapDbCandidateToDomain);
    },

    recordCorrection: async (
      correctionInput: RecordPlacementCorrectionInput,
    ): Promise<PlacementCorrection> => {
      const correction = await input.repository.createPlacementCorrection({
        correctionId: correctionInput.correction.correctionId as unknown as DbPlacementCorrectionId,
        studentId: correctionInput.correction.studentId,
        resourceId: correctionInput.correction.resourceId,
        previousTarget:
          correctionInput.correction.previousTarget === null
            ? null
            : mapDomainTargetToDb(correctionInput.correction.previousTarget),
        correctedTarget: mapDomainTargetToDb(correctionInput.correction.correctedTarget),
        reason: correctionInput.correction.reason,
        correctedAt: correctionInput.correction.correctedAt,
      });

      return mapDbCorrectionToDomain(correction);
    },

    listCorrectionsByResource: async (
      lookup: ListPlacementCorrectionsByResourceInput,
    ): Promise<readonly PlacementCorrection[]> => {
      const corrections = await input.repository.listPlacementCorrectionsByResource({
        studentId: lookup.studentId,
        resourceId: lookup.resourceId,
      });

      return corrections.map(mapDbCorrectionToDomain);
    },

    listResourcePlacementsByAcademicUnit: async (
      lookup: ListResourcePlacementsByAcademicUnitInput,
    ): Promise<readonly ResourcePlacement[]> => {
      const placements = await input.repository.listResourcePlacementsByAcademicUnit(
        mapListResourcePlacementsByAcademicUnitInputToDb(lookup),
      );

      return placements.map(mapDbPlacementToDomain);
    },
  };
}

function mapDbCandidateToDomain(
  candidate: DbPlacementCandidateRecord,
): PlacementCandidate {
  return {
    candidateId: candidate.candidateId as unknown as PlacementCandidateId,
    studentId: candidate.studentId as StudentId,
    resourceId: candidate.resourceId as ResourceId,
    target: mapDbTargetToDomain(candidate.target),
    confidence: {
      level: candidate.confidence.level as PlacementConfidenceLevel,
      source: candidate.confidence.source as PlacementConfidenceSource,
      reason: candidate.confidence.reason,
    },
    provenance: candidate.provenance,
    reason: candidate.reason,
    createdAt: candidate.createdAt,
  };
}

function mapDbPlacementToDomain(
  placement: DbResourcePlacementRecord,
): ResourcePlacement {
  return {
    placementId: placement.placementId as unknown as ResourcePlacementId,
    studentId: placement.studentId as StudentId,
    resourceId: placement.resourceId as ResourceId,
    target: mapDbTargetToDomain(placement.target),
    confidence: {
      level: placement.confidence.level as PlacementConfidenceLevel,
      source: placement.confidence.source as PlacementConfidenceSource,
      reason: placement.confidence.reason,
    },
    status: placement.status,
    createdAt: placement.createdAt,
    updatedAt: placement.updatedAt,
  };
}

function mapDbCorrectionToDomain(
  correction: DbPlacementCorrectionRecord,
): PlacementCorrection {
  return {
    correctionId: correction.correctionId as unknown as PlacementCorrectionId,
    studentId: correction.studentId as StudentId,
    resourceId: correction.resourceId as ResourceId,
    previousTarget:
      correction.previousTarget === null
        ? null
        : mapDbTargetToDomain(correction.previousTarget),
    correctedTarget: mapDbTargetToDomain(correction.correctedTarget),
    reason: correction.reason,
    correctedAt: correction.correctedAt,
  };
}

function mapDomainTargetToDb(
  target: ResourcePlacementTarget,
): DbResourcePlacementTarget {
  return {
    termId: target.termId as unknown as DbAcademicTermId,
    subjectId: target.subjectId as unknown as DbSubjectId,
    structureUnitId:
      target.structureUnitId === null
        ? null
        : target.structureUnitId as unknown as DbStructureUnitId,
  };
}

function mapDbTargetToDomain(
  target: DbResourcePlacementTarget,
): ResourcePlacementTarget {
  return {
    termId: target.termId as unknown as AcademicTermId,
    subjectId: target.subjectId as unknown as SubjectId,
    structureUnitId:
      target.structureUnitId === null
        ? null
        : target.structureUnitId as unknown as StructureUnitId,
  };
}

function mapGetPlacementCandidateByIdInputToDb(
  input: GetPlacementCandidateByIdInput,
): DbGetPlacementCandidateByIdInput {
  return {
    studentId: input.studentId,
    candidateId: input.candidateId as unknown as DbPlacementCandidateId,
  };
}

function mapListResourcePlacementsByAcademicUnitInputToDb(
  input: ListResourcePlacementsByAcademicUnitInput,
): DbListResourcePlacementsByAcademicUnitInput {
  return {
    studentId: input.studentId,
    target: {
      termId: input.target.termId as unknown as DbAcademicTermId,
      subjectId:
        input.target.subjectId === null
          ? null
          : input.target.subjectId as unknown as DbSubjectId,
      structureUnitId:
        input.target.structureUnitId === null
          ? null
          : input.target.structureUnitId as unknown as DbStructureUnitId,
    },
  };
}