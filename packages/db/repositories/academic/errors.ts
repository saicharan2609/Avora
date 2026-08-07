export type AcademicGraphRepositoryErrorCode =
  | "academic_graph_repository_create_term_failed"
  | "academic_graph_repository_read_terms_failed"
  | "academic_graph_repository_create_subject_failed"
  | "academic_graph_repository_read_subjects_failed"
  | "academic_graph_repository_create_structure_unit_failed"
  | "academic_graph_repository_read_structure_units_failed"
  | "academic_graph_repository_invalid_tree";

export class AcademicGraphRepositoryError extends Error {
  public readonly code: AcademicGraphRepositoryErrorCode;

  public constructor(code: AcademicGraphRepositoryErrorCode, message: string) {
    super(message);
    this.name = "AcademicGraphRepositoryError";
    this.code = code;
  }
}