import type { DatabaseClient } from "@avora/db/client";
import { createAcademicGraphRepository } from "@avora/db/repositories/academic";
import {
  createAcademicSetupService,
  type AcademicSetupRepositoryPort,
} from "@avora/domain/academic";

import {
  mapDbAcademicStructureTreeToDomain,
  mapDbAcademicTermToDomain,
  mapDbStructureUnitToDomain,
  mapDbSubjectToDomain,
  mapDomainAcademicDateToDb,
  mapDomainAcademicTermIdToDb,
  mapDomainStructureUnitIdToDb,
  mapDomainSubjectIdToDb,
} from "./academic-mapper";
import {
  createAcademicSetupOrchestrator,
  type AcademicSetupOrchestrator,
} from "./academic-setup-orchestrator";

export type CreateAcademicApiCompositionInput = Readonly<{
  client: DatabaseClient;
}>;

export function createAcademicApiComposition(
  input: CreateAcademicApiCompositionInput,
): AcademicSetupOrchestrator {
  const academicGraphRepository = createAcademicGraphRepository({
    client: input.client,
  });

  const repositoryPort: AcademicSetupRepositoryPort = {
    createAcademicTerm: async (term) =>
      mapDbAcademicTermToDomain(
        await academicGraphRepository.createAcademicTerm({
          studentId: term.studentId,
          label: term.label,
          institutionName: term.institutionName,
          startsOn: mapDomainAcademicDateToDb(term.startsOn),
          endsOn: mapDomainAcademicDateToDb(term.endsOn),
        }),
      ),

    createSubject: async (subject) =>
      mapDbSubjectToDomain(
        await academicGraphRepository.createSubject({
          studentId: subject.studentId,
          termId: mapDomainAcademicTermIdToDb(subject.termId),
          displayName: subject.displayName,
          subjectCode: subject.subjectCode,
          description: subject.description,
        }),
      ),

    createStructureUnit: async (unit) =>
      mapDbStructureUnitToDomain(
        await academicGraphRepository.createStructureUnit({
          studentId: unit.studentId,
          termId: mapDomainAcademicTermIdToDb(unit.termId),
          subjectId: mapDomainSubjectIdToDb(unit.subjectId),
          parentUnitId: mapDomainStructureUnitIdToDb(unit.parentUnitId),
          title: unit.title,
          description: unit.description,
          unitKind: unit.unitKind,
          source: unit.source,
          sortOrder: unit.sortOrder,
        }),
      ),

    getAcademicStructureTree: async (lookup) =>
      mapDbAcademicStructureTreeToDomain(
        await academicGraphRepository.getAcademicStructureTree({
          studentId: lookup.studentId,
        }),
      ),
  };

  const setupService = createAcademicSetupService({
    repository: repositoryPort,
  });

  return createAcademicSetupOrchestrator({
    setupService,
    repository: repositoryPort,
  });
}