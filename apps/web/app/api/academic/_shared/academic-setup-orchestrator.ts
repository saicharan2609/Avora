import type { StudentId } from "@avora/core/identity";
import type {
  CreateAcademicTermRequest,
  CreateAcademicTermResponse,
  CreateStructureUnitRequest,
  CreateStructureUnitResponse,
  CreateSubjectRequest,
  CreateSubjectResponse,
  GetAcademicSetupProgressResponse,
  GetAcademicStructureTreeResponse,
} from "@avora/core/api/academic";
import {
  serializeCreateAcademicTermResponse,
  serializeCreateStructureUnitResponse,
  serializeCreateSubjectResponse,
  serializeGetAcademicSetupProgressResponse,
  serializeGetAcademicStructureTreeResponse,
} from "@avora/core/api/academic";
import type {
  AcademicSetupRepositoryPort,
  AcademicSetupService,
} from "@avora/domain/academic";

import {
  mapAcademicSetupProgressToApi,
  mapAcademicStructureTreeToApi,
  mapAcademicTermToApi,
  mapCreateAcademicTermRequestToDomainInput,
  mapCreateStructureUnitRequestToDomainInput,
  mapCreateSubjectRequestToDomainInput,
  mapStructureUnitToApi,
  mapSubjectToApi,
} from "./academic-mapper";

export type AcademicSetupOrchestrator = Readonly<{
  createAcademicTerm: (
    studentId: StudentId,
    request: CreateAcademicTermRequest,
  ) => Promise<CreateAcademicTermResponse>;
  createSubject: (
    studentId: StudentId,
    request: CreateSubjectRequest,
  ) => Promise<CreateSubjectResponse>;
  createStructureUnit: (
    studentId: StudentId,
    request: CreateStructureUnitRequest,
  ) => Promise<CreateStructureUnitResponse>;
  getSetupProgress: (
    studentId: StudentId,
  ) => Promise<GetAcademicSetupProgressResponse>;
  getStructureTree: (
    studentId: StudentId,
  ) => Promise<GetAcademicStructureTreeResponse>;
}>;

export type CreateAcademicSetupOrchestratorInput = Readonly<{
  setupService: AcademicSetupService;
  repository: AcademicSetupRepositoryPort;
}>;

export function createAcademicSetupOrchestrator(
  input: CreateAcademicSetupOrchestratorInput,
): AcademicSetupOrchestrator {
  return {
    createAcademicTerm: async (
      studentId,
      request,
    ): Promise<CreateAcademicTermResponse> => {
      const result = await input.setupService.initializeAcademicSetup(
        mapCreateAcademicTermRequestToDomainInput(studentId, request),
      );

      return serializeCreateAcademicTermResponse({
        term: mapAcademicTermToApi(result.term),
        progress: mapAcademicSetupProgressToApi(result.progress),
      });
    },

    createSubject: async (
      studentId,
      request,
    ): Promise<CreateSubjectResponse> => {
      const result = await input.setupService.addAcademicSetupSubject(
        mapCreateSubjectRequestToDomainInput(studentId, request),
      );

      return serializeCreateSubjectResponse({
        subject: mapSubjectToApi(result.subject),
        progress: mapAcademicSetupProgressToApi(result.progress),
      });
    },

    createStructureUnit: async (
      studentId,
      request,
    ): Promise<CreateStructureUnitResponse> => {
      const result = await input.setupService.addAcademicSetupStructureUnit(
        mapCreateStructureUnitRequestToDomainInput(studentId, request),
      );

      return serializeCreateStructureUnitResponse({
        structureUnit: mapStructureUnitToApi(result.structureUnit),
        progress: mapAcademicSetupProgressToApi(result.progress),
      });
    },

    getSetupProgress: async (
      studentId,
    ): Promise<GetAcademicSetupProgressResponse> => {
      const progress = await input.setupService.getAcademicSetupProgress({
        studentId,
      });

      return serializeGetAcademicSetupProgressResponse({
        progress: mapAcademicSetupProgressToApi(progress),
      });
    },

    getStructureTree: async (
      studentId,
    ): Promise<GetAcademicStructureTreeResponse> => {
      const tree = await input.repository.getAcademicStructureTree({
        studentId,
      });

      return serializeGetAcademicStructureTreeResponse({
        tree: mapAcademicStructureTreeToApi(tree),
      });
    },
  };
}