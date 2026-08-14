export type * from "../client/index.js";
export type * from "../generated/index.js";
export type * from "../repositories/index.js";

export {
  createServiceRoleDatabaseClient,
  createStudentDatabaseClient,
} from "../client/index.js";
export {
  createAcademicGraphRepository,
  AcademicGraphRepositoryError,
  createResourceExtractionRepository,
  ResourceExtractionRepositoryError,
  createResourceIngestionJobsRepository,
  ResourceIngestionJobsRepositoryError,
  createResourcePlacementRepository,
  ResourcePlacementRepositoryError,
  createResourcesRepository,
  ResourcesRepositoryError,
} from "../repositories/index.js";