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

export class AcademicApiRequestError extends Error {
  public readonly status: number;

  public constructor(status: number, message: string) {
    super(message);
    this.name = "AcademicApiRequestError";
    this.status = status;
  }
}

export type AcademicClient = Readonly<{
  createAcademicTerm: (
    request: CreateAcademicTermRequest,
  ) => Promise<CreateAcademicTermResponse>;
  createSubject: (request: CreateSubjectRequest) => Promise<CreateSubjectResponse>;
  createStructureUnit: (
    request: CreateStructureUnitRequest,
  ) => Promise<CreateStructureUnitResponse>;
  getSetupProgress: () => Promise<GetAcademicSetupProgressResponse>;
  getStructureTree: () => Promise<GetAcademicStructureTreeResponse>;
}>;

export type CreateAcademicClientInput = Readonly<{
  apiBaseUrl: string;
  accessToken: string;
}>;

type JsonRequestInit = Readonly<{
  method?: "GET" | "POST";
  body?: string;
}>;

export function createAcademicClient(input: CreateAcademicClientInput): AcademicClient {
  async function requestJson<TResponse>(
    path: string,
    init?: JsonRequestInit,
  ): Promise<TResponse> {
    const response = await fetch(new URL(path, input.apiBaseUrl).toString(), {
      ...init,
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new AcademicApiRequestError(
        response.status,
        `Academic API request to ${path} failed with status ${response.status}.`,
      );
    }

    return (await response.json()) as TResponse;
  }

  return {
    createAcademicTerm: (request) =>
      requestJson("/api/academic/setup/terms", {
        method: "POST",
        body: JSON.stringify(request),
      }),

    createSubject: (request) =>
      requestJson("/api/academic/setup/subjects", {
        method: "POST",
        body: JSON.stringify(request),
      }),

    createStructureUnit: (request) =>
      requestJson("/api/academic/setup/structure-units", {
        method: "POST",
        body: JSON.stringify(request),
      }),

    getSetupProgress: () => requestJson("/api/academic/setup/progress"),

    getStructureTree: () => requestJson("/api/academic/tree"),
  };
}
