import type { DatabaseClient } from "../../client/index.js";
import type {
  AcademicGraphRepository,
  CreateAcademicTermInput,
  CreateStructureUnitInput,
  CreateSubjectInput,
  DbAcademicStructureTree,
  DbAcademicTermRecord,
  DbStructureUnitRecord,
  DbSubjectRecord,
  GetAcademicStructureTreeInput,
  GetAcademicTermByIdInput,
  GetSubjectByIdInput,
  ListAcademicTermsInput,
  ListStructureUnitsBySubjectInput,
  ListSubjectsByTermInput,
} from "./contracts.js";
import {
  AcademicGraphRepositoryError,
} from "./errors.js";
import {
  buildAcademicStructureTree,
  mapAcademicTermRow,
  mapStructureUnitRow,
  mapSubjectRow,
} from "./mapper.js";

export type CreateAcademicGraphRepositoryInput = Readonly<{
  client: DatabaseClient;
}>;

const academicTermSelectColumns =
  "term_id,student_id,label,institution_name,starts_on,ends_on,lifecycle_state,created_at,updated_at" as const;

const subjectSelectColumns =
  "subject_id,student_id,term_id,display_name,subject_code,description,lifecycle_state,created_at,updated_at" as const;

const structureUnitSelectColumns =
  "structure_unit_id,student_id,term_id,subject_id,parent_unit_id,title,description,unit_kind,source,sort_order,created_at,updated_at" as const;

export function createAcademicGraphRepository(
  input: CreateAcademicGraphRepositoryInput,
): AcademicGraphRepository {
  return {
    createAcademicTerm: async (
      term: CreateAcademicTermInput,
    ): Promise<DbAcademicTermRecord> => {
      const { data, error } = await input.client
        .from("academic_terms")
        .insert({
          student_id: term.studentId,
          label: term.label,
          institution_name: term.institutionName,
          starts_on: term.startsOn,
          ends_on: term.endsOn,
          lifecycle_state: "planned",
        })
        .select(academicTermSelectColumns)
        .single();

      if (error !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_create_term_failed",
          error.message,
        );
      }

      return mapAcademicTermRow(data);
    },

    listAcademicTerms: async (
      lookup: ListAcademicTermsInput,
    ): Promise<readonly DbAcademicTermRecord[]> => {
      const { data, error } = await input.client
        .from("academic_terms")
        .select(academicTermSelectColumns)
        .eq("student_id", lookup.studentId)
        .order("starts_on", { ascending: true, nullsFirst: false })
        .order("label", { ascending: true });

      if (error !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_read_terms_failed",
          error.message,
        );
      }

      return data.map(mapAcademicTermRow);
    },

    getAcademicTermById: async (
      lookup: GetAcademicTermByIdInput,
    ): Promise<DbAcademicTermRecord | null> => {
      const { data, error } = await input.client
        .from("academic_terms")
        .select(academicTermSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("term_id", lookup.termId)
        .maybeSingle();

      if (error !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_read_terms_failed",
          error.message,
        );
      }

      return data === null ? null : mapAcademicTermRow(data);
    },

    createSubject: async (
      subject: CreateSubjectInput,
    ): Promise<DbSubjectRecord> => {
      const { data, error } = await input.client
        .from("subjects")
        .insert({
          student_id: subject.studentId,
          term_id: subject.termId,
          display_name: subject.displayName,
          subject_code: subject.subjectCode,
          description: subject.description,
          lifecycle_state: "active",
        })
        .select(subjectSelectColumns)
        .single();

      if (error !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_create_subject_failed",
          error.message,
        );
      }

      return mapSubjectRow(data);
    },

    listSubjectsByTerm: async (
      lookup: ListSubjectsByTermInput,
    ): Promise<readonly DbSubjectRecord[]> => {
      const { data, error } = await input.client
        .from("subjects")
        .select(subjectSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("term_id", lookup.termId)
        .order("display_name", { ascending: true });

      if (error !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_read_subjects_failed",
          error.message,
        );
      }

      return data.map(mapSubjectRow);
    },

    getSubjectById: async (
      lookup: GetSubjectByIdInput,
    ): Promise<DbSubjectRecord | null> => {
      const { data, error } = await input.client
        .from("subjects")
        .select(subjectSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("subject_id", lookup.subjectId)
        .maybeSingle();

      if (error !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_read_subjects_failed",
          error.message,
        );
      }

      return data === null ? null : mapSubjectRow(data);
    },

    createStructureUnit: async (
      unit: CreateStructureUnitInput,
    ): Promise<DbStructureUnitRecord> => {
      const { data, error } = await input.client
        .from("structure_units")
        .insert({
          student_id: unit.studentId,
          term_id: unit.termId,
          subject_id: unit.subjectId,
          parent_unit_id: unit.parentUnitId,
          title: unit.title,
          description: unit.description,
          unit_kind: unit.unitKind,
          source: unit.source,
          sort_order: unit.sortOrder,
        })
        .select(structureUnitSelectColumns)
        .single();

      if (error !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_create_structure_unit_failed",
          error.message,
        );
      }

      return mapStructureUnitRow(data);
    },

    listStructureUnitsBySubject: async (
      lookup: ListStructureUnitsBySubjectInput,
    ): Promise<readonly DbStructureUnitRecord[]> => {
      const { data, error } = await input.client
        .from("structure_units")
        .select(structureUnitSelectColumns)
        .eq("student_id", lookup.studentId)
        .eq("subject_id", lookup.subjectId)
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });

      if (error !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_read_structure_units_failed",
          error.message,
        );
      }

      return data.map(mapStructureUnitRow);
    },

    getAcademicStructureTree: async (
      lookup: GetAcademicStructureTreeInput,
    ): Promise<DbAcademicStructureTree> => {
      const { data: termRows, error: termError } = await input.client
        .from("academic_terms")
        .select(academicTermSelectColumns)
        .eq("student_id", lookup.studentId)
        .order("starts_on", { ascending: true, nullsFirst: false })
        .order("label", { ascending: true });

      if (termError !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_read_terms_failed",
          termError.message,
        );
      }

      const { data: subjectRows, error: subjectError } = await input.client
        .from("subjects")
        .select(subjectSelectColumns)
        .eq("student_id", lookup.studentId)
        .order("display_name", { ascending: true });

      if (subjectError !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_read_subjects_failed",
          subjectError.message,
        );
      }

      const { data: structureUnitRows, error: structureUnitError } = await input.client
        .from("structure_units")
        .select(structureUnitSelectColumns)
        .eq("student_id", lookup.studentId)
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });

      if (structureUnitError !== null) {
        throw new AcademicGraphRepositoryError(
          "academic_graph_repository_read_structure_units_failed",
          structureUnitError.message,
        );
      }

      return buildAcademicStructureTree({
        terms: termRows.map(mapAcademicTermRow),
        subjects: subjectRows.map(mapSubjectRow),
        structureUnits: structureUnitRows.map(mapStructureUnitRow),
      });
    },
  };
}