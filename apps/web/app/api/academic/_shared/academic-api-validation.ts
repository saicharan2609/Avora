import type {
  AcademicApiStructureUnitKind,
  AcademicApiStructureUnitSource,
  CreateAcademicTermRequest,
  CreateStructureUnitRequest,
  CreateSubjectRequest,
} from "@avora/core/api/academic";
import {
  academicApiStructureUnitKinds,
  academicApiStructureUnitSources,
} from "@avora/core/api/academic";

import { academicApiInvalidRequest } from "./academic-api-errors";

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  let value: unknown;

  try {
    value = await request.json();
  } catch {
    throw academicApiInvalidRequest("Request body must be valid JSON.");
  }

  if (!isRecord(value)) {
    throw academicApiInvalidRequest("Request body must be a JSON object.");
  }

  return value;
}

export function parseCreateAcademicTermRequest(
  value: Record<string, unknown>,
): CreateAcademicTermRequest {
  return {
    label: readRequiredString(value, "label"),
    institutionName: readNullableString(value, "institutionName"),
    startsOn: readNullableString(value, "startsOn"),
    endsOn: readNullableString(value, "endsOn"),
  };
}

export function parseCreateSubjectRequest(
  value: Record<string, unknown>,
): CreateSubjectRequest {
  return {
    termId: readRequiredString(value, "termId"),
    displayName: readRequiredString(value, "displayName"),
    subjectCode: readNullableString(value, "subjectCode"),
    description: readNullableString(value, "description"),
  };
}

export function parseCreateStructureUnitRequest(
  value: Record<string, unknown>,
): CreateStructureUnitRequest {
  const unitKind = readRequiredString(value, "unitKind");
  const source = readRequiredString(value, "source");

  if (!isAcademicApiStructureUnitKind(unitKind)) {
    throw academicApiInvalidRequest("Structure unit kind is not supported.");
  }

  if (!isAcademicApiStructureUnitSource(source)) {
    throw academicApiInvalidRequest("Structure unit source is not supported.");
  }

  return {
    termId: readRequiredString(value, "termId"),
    subjectId: readRequiredString(value, "subjectId"),
    parentUnitId: readNullableString(value, "parentUnitId"),
    title: readRequiredString(value, "title"),
    description: readNullableString(value, "description"),
    unitKind,
    source,
    sortOrder: readNonNegativeInteger(value, "sortOrder"),
  };
}

function readRequiredString(value: Record<string, unknown>, key: string): string {
  const field = value[key];

  if (typeof field !== "string" || field.trim().length === 0) {
    throw academicApiInvalidRequest(`${key} is required.`);
  }

  return field;
}

function readNullableString(value: Record<string, unknown>, key: string): string | null {
  const field = value[key];

  if (field === undefined || field === null) {
    return null;
  }

  if (typeof field !== "string") {
    throw academicApiInvalidRequest(`${key} must be a string or null.`);
  }

  const trimmed = field.trim();

  return trimmed.length === 0 ? null : field;
}

function readNonNegativeInteger(
  value: Record<string, unknown>,
  key: string,
): number {
  const field = value[key];

  if (
    typeof field !== "number" ||
    !Number.isSafeInteger(field) ||
    field < 0
  ) {
    throw academicApiInvalidRequest(
      `${key} must be a non-negative integer.`,
    );
  }

  return field;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAcademicApiStructureUnitKind(
  value: string,
): value is AcademicApiStructureUnitKind {
  return academicApiStructureUnitKinds.includes(value as AcademicApiStructureUnitKind);
}

function isAcademicApiStructureUnitSource(
  value: string,
): value is AcademicApiStructureUnitSource {
  return academicApiStructureUnitSources.includes(value as AcademicApiStructureUnitSource);
}