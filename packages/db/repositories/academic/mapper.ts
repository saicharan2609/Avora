import type { StudentId } from "@avora/core/identity";
import type { IsoDateTimeString } from "@avora/core/time";

import type { Database } from "../../generated/database.types.js";
import {
  AcademicGraphRepositoryError,
} from "./errors.js";
import type {
  DbAcademicDateString,
  DbAcademicStructureTree,
  DbAcademicTermId,
  DbAcademicTermRecord,
  DbAcademicTermStructureTree,
  DbStructureUnitId,
  DbStructureUnitNode,
  DbStructureUnitRecord,
  DbSubjectId,
  DbSubjectRecord,
  DbSubjectStructureTree,
} from "./contracts.js";

export function mapAcademicTermRow(
  row: Database["public"]["Tables"]["academic_terms"]["Row"],
): DbAcademicTermRecord {
  return {
    termId: row.term_id as DbAcademicTermId,
    studentId: row.student_id as StudentId,
    label: row.label,
    institutionName: row.institution_name,
    startsOn: row.starts_on as DbAcademicDateString | null,
    endsOn: row.ends_on as DbAcademicDateString | null,
    lifecycleState: row.lifecycle_state,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

export function mapSubjectRow(
  row: Database["public"]["Tables"]["subjects"]["Row"],
): DbSubjectRecord {
  return {
    subjectId: row.subject_id as DbSubjectId,
    studentId: row.student_id as StudentId,
    termId: row.term_id as DbAcademicTermId,
    displayName: row.display_name,
    subjectCode: row.subject_code,
    description: row.description,
    lifecycleState: row.lifecycle_state,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

export function mapStructureUnitRow(
  row: Database["public"]["Tables"]["structure_units"]["Row"],
): DbStructureUnitRecord {
  return {
    structureUnitId: row.structure_unit_id as DbStructureUnitId,
    studentId: row.student_id as StudentId,
    termId: row.term_id as DbAcademicTermId,
    subjectId: row.subject_id as DbSubjectId,
    parentUnitId: row.parent_unit_id as DbStructureUnitId | null,
    title: row.title,
    description: row.description,
    unitKind: row.unit_kind,
    source: row.source,
    sortOrder: row.sort_order,
    createdAt: row.created_at as IsoDateTimeString,
    updatedAt: row.updated_at as IsoDateTimeString,
  };
}

export function buildAcademicStructureTree(input: Readonly<{
  terms: readonly DbAcademicTermRecord[];
  subjects: readonly DbSubjectRecord[];
  structureUnits: readonly DbStructureUnitRecord[];
}>): DbAcademicStructureTree {
  const subjectsByTerm = groupSubjectsByTerm(input.subjects);
  const unitsBySubject = groupUnitsBySubject(input.structureUnits);

  return {
    terms: [...input.terms]
      .sort(compareTerms)
      .map((term): DbAcademicTermStructureTree => {
        const subjects = subjectsByTerm.get(term.termId) ?? [];

        return {
          term,
          subjects: [...subjects]
            .sort(compareSubjects)
            .map((subject): DbSubjectStructureTree => ({
              subject,
              units: buildStructureUnitTree(unitsBySubject.get(subject.subjectId) ?? []),
            })),
        };
      }),
  };
}

function groupSubjectsByTerm(
  subjects: readonly DbSubjectRecord[],
): Map<DbAcademicTermId, DbSubjectRecord[]> {
  const grouped = new Map<DbAcademicTermId, DbSubjectRecord[]>();

  for (const subject of subjects) {
    const existing = grouped.get(subject.termId) ?? [];
    existing.push(subject);
    grouped.set(subject.termId, existing);
  }

  return grouped;
}

function groupUnitsBySubject(
  units: readonly DbStructureUnitRecord[],
): Map<DbSubjectId, DbStructureUnitRecord[]> {
  const grouped = new Map<DbSubjectId, DbStructureUnitRecord[]>();

  for (const unit of units) {
    const existing = grouped.get(unit.subjectId) ?? [];
    existing.push(unit);
    grouped.set(unit.subjectId, existing);
  }

  return grouped;
}

function buildStructureUnitTree(
  units: readonly DbStructureUnitRecord[],
): readonly DbStructureUnitNode[] {
  const nodesById = new Map<DbStructureUnitId, MutableStructureUnitNode>();
  const roots: MutableStructureUnitNode[] = [];

  for (const unit of units) {
    nodesById.set(unit.structureUnitId, {
      unit,
      children: [],
    });
  }

  for (const unit of units) {
    const node = nodesById.get(unit.structureUnitId);

    if (node === undefined) {
      throw new AcademicGraphRepositoryError(
        "academic_graph_repository_invalid_tree",
        "Structure unit tree builder could not find a created node.",
      );
    }

    if (unit.parentUnitId === null) {
      roots.push(node);
      continue;
    }

    const parent = nodesById.get(unit.parentUnitId);

    if (parent === undefined) {
      throw new AcademicGraphRepositoryError(
        "academic_graph_repository_invalid_tree",
        "Structure unit tree contains a missing parent reference.",
      );
    }

    parent.children.push(node);
  }

  sortNodes(roots);

  return freezeNodes(roots);
}

type MutableStructureUnitNode = {
  unit: DbStructureUnitRecord;
  children: MutableStructureUnitNode[];
};

function sortNodes(nodes: MutableStructureUnitNode[]): void {
  nodes.sort(compareStructureUnitNodes);

  for (const node of nodes) {
    sortNodes(node.children);
  }
}

function freezeNodes(
  nodes: readonly MutableStructureUnitNode[],
): readonly DbStructureUnitNode[] {
  return nodes.map((node): DbStructureUnitNode => ({
    unit: node.unit,
    children: freezeNodes(node.children),
  }));
}

function compareTerms(
  left: DbAcademicTermRecord,
  right: DbAcademicTermRecord,
): number {
  const startsOnComparison = compareNullableStrings(left.startsOn, right.startsOn);

  if (startsOnComparison !== 0) {
    return startsOnComparison;
  }

  return left.label.localeCompare(right.label);
}

function compareSubjects(
  left: DbSubjectRecord,
  right: DbSubjectRecord,
): number {
  return left.displayName.localeCompare(right.displayName);
}

function compareStructureUnitNodes(
  left: MutableStructureUnitNode,
  right: MutableStructureUnitNode,
): number {
  if (left.unit.sortOrder !== right.unit.sortOrder) {
    return left.unit.sortOrder - right.unit.sortOrder;
  }

  return left.unit.title.localeCompare(right.unit.title);
}

function compareNullableStrings(
  left: string | null,
  right: string | null,
): number {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left.localeCompare(right);
}