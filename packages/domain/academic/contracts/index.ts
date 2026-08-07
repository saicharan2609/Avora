export type {
  AcademicDateString,
  AcademicTermId,
  StudentScopedAcademicIdentity,
  StructureUnitId,
  SubjectId,
} from "./AcademicIdentifiers.contract.js";

export type {
  AcademicTermLifecycleState,
  AcademicTermRecord,
  ArchiveAcademicTermInput,
  CreateAcademicTermInput,
  RenameAcademicTermInput,
} from "./AcademicTerm.contract.js";
export {
  academicTermLifecycleStates,
} from "./AcademicTerm.contract.js";

export type {
  ArchiveSubjectInput,
  CreateSubjectInput,
  RenameSubjectInput,
  SubjectLifecycleState,
  SubjectRecord,
} from "./Subject.contract.js";
export {
  subjectLifecycleStates,
} from "./Subject.contract.js";

export type {
  AcademicStructureUnitKind,
  CreateStructureUnitInput,
  MoveStructureUnitInput,
  RenameStructureUnitInput,
  StructureUnitRecord,
  StructureUnitSource,
} from "./StructureUnit.contract.js";
export {
  academicStructureUnitKinds,
  structureUnitSources,
} from "./StructureUnit.contract.js";

export type {
  AcademicStructurePath,
  AcademicStructurePathSegment,
  AcademicStructureTree,
  AcademicTermStructureTree,
  LocateStructureUnitInput,
  StructureUnitNode,
  SubjectStructureTree,
} from "./AcademicStructure.contract.js";

export type {
  PlacementConfidence,
  PlacementConfidenceLevel,
  PlacementConfidenceSource,
} from "./PlacementConfidence.contract.js";
export {
  placementConfidenceLevels,
  placementConfidenceSources,
} from "./PlacementConfidence.contract.js";