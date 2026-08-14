import type { DatabaseClient } from "../../client/index.js";
import type {
  CreatePlacementCorrectionInput,
  DbPlacementCandidateRecord,
  DbPlacementCorrectionRecord,
  DbResourcePlacementRecord,
  GetPlacementCandidateByIdInput,
  GetResourcePlacementByIdInput,
  GetResourcePlacementByResourceInput,
  ListPlacementCandidatesByResourceInput,
  ListPlacementCorrectionsByResourceInput,
  ListResourcePlacementsByAcademicUnitInput,
  ResourcePlacementRepository,
  UpsertPlacementCandidateInput,
  UpsertResourcePlacementInput,
} from "./contracts.js";
import {
  ResourcePlacementRepositoryError,
} from "./errors.js";
import {
  assertValidAcademicUnitListInput,
  mapCreatePlacementCorrectionInputToInsert,
  mapPlacementCandidateRow,
  mapPlacementCorrectionRow,
  mapResourcePlacementRow,
  mapUpsertPlacementCandidateInputToInsert,
  mapUpsertPlacementCandidateInputToUpdate,
  mapUpsertPlacementInputToInsert,
  mapUpsertPlacementInputToUpdate,
  placementCandidateSelectColumns,
  placementCorrectionSelectColumns,
  resourcePlacementSelectColumns,
} from "./mapper.js";

export type CreateResourcePlacementRepositoryInput = Readonly<{
  client: DatabaseClient;
}>;

export function createResourcePlacementRepository(
  input: CreateResourcePlacementRepositoryInput,
): ResourcePlacementRepository {
  return {
    upsertPlacementCandidate: async (
      candidate: UpsertPlacementCandidateInput,
    ): Promise<DbPlacementCandidateRecord> => {
      const existing = await getPlacementCandidateById(input, {
        studentId: candidate.studentId,
        candidateId: candidate.candidateId,
      });

      if (existing === null) {
        const { data, error } = await input.client
          .from("resource_placement_candidates")
          .insert(mapUpsertPlacementCandidateInputToInsert(candidate))
          .select(placementCandidateSelectColumns)
          .single();

        if (error !== null) {
          throw new ResourcePlacementRepositoryError(
            "resource_placement_repository_create_failed",
            error.message,
          );
        }

        return mapPlacementCandidateRow(data);
      }

      const { data, error } = await input.client
        .from("resource_placement_candidates")
        .update(mapUpsertPlacementCandidateInputToUpdate(candidate))
        .eq("student_id", candidate.studentId)
        .eq("candidate_id", candidate.candidateId)
        .select(placementCandidateSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourcePlacementRepositoryError(
          "resource_placement_repository_update_failed",
          error.message,
        );
      }

      return mapPlacementCandidateRow(data);
    },

    getPlacementCandidateById: async (
      lookup: GetPlacementCandidateByIdInput,
    ): Promise<DbPlacementCandidateRecord | null> =>
      getPlacementCandidateById(input, lookup),

    listPlacementCandidatesByResource: async (
      lookup: ListPlacementCandidatesByResourceInput,
    ): Promise<readonly DbPlacementCandidateRecord[]> => {
      const { data, error } = await input.client
        .from("resource_placement_candidates")
        .select(placementCandidateSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("resource_id", lookup.resourceId)
        .order("created_at", { ascending: false })
        .order("candidate_id", { ascending: true });

      if (error !== null) {
        throw new ResourcePlacementRepositoryError(
          "resource_placement_repository_read_failed",
          error.message,
        );
      }

      return data.map(mapPlacementCandidateRow);
    },

    upsertResourcePlacement: async (
      placement: UpsertResourcePlacementInput,
    ): Promise<DbResourcePlacementRecord> => {
      const existing = await getPlacementByResource(input, {
        studentId: placement.studentId,
        resourceId: placement.resourceId,
      });

      if (existing === null) {
        const { data, error } = await input.client
          .from("resource_placements")
          .insert(mapUpsertPlacementInputToInsert(placement))
          .select(resourcePlacementSelectColumns)
          .single();

        if (error !== null) {
          throw new ResourcePlacementRepositoryError(
            "resource_placement_repository_create_failed",
            error.message,
          );
        }

        return mapResourcePlacementRow(data);
      }

      const { data, error } = await input.client
        .from("resource_placements")
        .update(mapUpsertPlacementInputToUpdate(placement))
        .eq("student_id", placement.studentId)
        .eq("resource_id", placement.resourceId)
        .select(resourcePlacementSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourcePlacementRepositoryError(
          "resource_placement_repository_update_failed",
          error.message,
        );
      }

      return mapResourcePlacementRow(data);
    },

    getResourcePlacementByResource: async (
      lookup: GetResourcePlacementByResourceInput,
    ): Promise<DbResourcePlacementRecord | null> =>
      getPlacementByResource(input, lookup),

    getResourcePlacementById: async (
      lookup: GetResourcePlacementByIdInput,
    ): Promise<DbResourcePlacementRecord | null> => {
      const { data, error } = await input.client
        .from("resource_placements")
        .select(resourcePlacementSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("placement_id", lookup.placementId)
        .maybeSingle();

      if (error !== null) {
        throw new ResourcePlacementRepositoryError(
          "resource_placement_repository_read_failed",
          error.message,
        );
      }

      return data === null ? null : mapResourcePlacementRow(data);
    },

    createPlacementCorrection: async (
      correction: CreatePlacementCorrectionInput,
    ): Promise<DbPlacementCorrectionRecord> => {
      const { data, error } = await input.client
        .from("resource_placement_corrections")
        .insert(mapCreatePlacementCorrectionInputToInsert(correction))
        .select(placementCorrectionSelectColumns)
        .single();

      if (error !== null) {
        throw new ResourcePlacementRepositoryError(
          "resource_placement_repository_create_failed",
          error.message,
        );
      }

      return mapPlacementCorrectionRow(data);
    },

    listPlacementCorrectionsByResource: async (
      lookup: ListPlacementCorrectionsByResourceInput,
    ): Promise<readonly DbPlacementCorrectionRecord[]> => {
      const { data, error } = await input.client
        .from("resource_placement_corrections")
        .select(placementCorrectionSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("resource_id", lookup.resourceId)
        .order("corrected_at", { ascending: false })
        .order("correction_id", { ascending: true });

      if (error !== null) {
        throw new ResourcePlacementRepositoryError(
          "resource_placement_repository_read_failed",
          error.message,
        );
      }

      return data.map(mapPlacementCorrectionRow);
    },

    listResourcePlacementsByAcademicUnit: async (
      lookup: ListResourcePlacementsByAcademicUnitInput,
    ): Promise<readonly DbResourcePlacementRecord[]> => {
      assertValidAcademicUnitListInput(lookup);

      let query = input.client
        .from("resource_placements")
        .select(resourcePlacementSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("term_id", lookup.target.termId);

      if (lookup.target.subjectId !== null) {
        query = query.eq("subject_id", lookup.target.subjectId);
      }

      if (lookup.target.structureUnitId !== null) {
        query = query.eq("structure_unit_id", lookup.target.structureUnitId);
      }

      const { data, error } = await query
        .order("updated_at", { ascending: false })
        .order("resource_id", { ascending: true });

      if (error !== null) {
        throw new ResourcePlacementRepositoryError(
          "resource_placement_repository_read_failed",
          error.message,
        );
      }

      return data.map(mapResourcePlacementRow);
    },
  };
}

async function getPlacementCandidateById(
  input: CreateResourcePlacementRepositoryInput,
  lookup: GetPlacementCandidateByIdInput,
): Promise<DbPlacementCandidateRecord | null> {
  const { data, error } = await input.client
    .from("resource_placement_candidates")
    .select(placementCandidateSelectColumns)
    .eq("student_id", lookup.studentId)
    .eq("candidate_id", lookup.candidateId)
    .maybeSingle();

  if (error !== null) {
    throw new ResourcePlacementRepositoryError(
      "resource_placement_repository_read_failed",
      error.message,
    );
  }

  return data === null ? null : mapPlacementCandidateRow(data);
}

async function getPlacementByResource(
  input: CreateResourcePlacementRepositoryInput,
  lookup: GetResourcePlacementByResourceInput,
): Promise<DbResourcePlacementRecord | null> {
  const { data, error } = await input.client
    .from("resource_placements")
    .select(resourcePlacementSelectColumns)
    .eq("student_id", lookup.studentId)
    .eq("resource_id", lookup.resourceId)
    .maybeSingle();

  if (error !== null) {
    throw new ResourcePlacementRepositoryError(
      "resource_placement_repository_read_failed",
      error.message,
    );
  }

  return data === null ? null : mapResourcePlacementRow(data);
}