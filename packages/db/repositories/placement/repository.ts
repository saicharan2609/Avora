import type { DatabaseClient } from "../../client/index.js";
import type {
  CreatePlacementCorrectionInput,
  DbPlacementCorrectionRecord,
  DbResourcePlacementRecord,
  GetResourcePlacementByIdInput,
  GetResourcePlacementByResourceInput,
  ListPlacementCorrectionsByResourceInput,
  ResourcePlacementRepository,
  UpsertResourcePlacementInput,
} from "./contracts.js";
import {
  ResourcePlacementRepositoryError,
} from "./errors.js";
import {
  mapCreatePlacementCorrectionInputToInsert,
  mapPlacementCorrectionRow,
  mapResourcePlacementRow,
  mapUpsertPlacementInputToInsert,
  mapUpsertPlacementInputToUpdate,
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
  };
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