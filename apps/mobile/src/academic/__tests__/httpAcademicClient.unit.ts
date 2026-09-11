import { AcademicApiRequestError, createAcademicClient } from "../httpAcademicClient.js";

class HttpAcademicClientUnitFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "HttpAcademicClientUnitFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new HttpAcademicClientUnitFailure(caseId, reason);
  }
}

type CapturedRequest = Readonly<{ url: string; method: string; body: string | null; authorization: string | null }>;

async function withCapturingFetch<T>(
  respond: (request: CapturedRequest) => Response,
  run: () => Promise<T>,
): Promise<{ result: T; request: CapturedRequest }> {
  const original = globalThis.fetch;
  let captured: CapturedRequest | null = null;

  globalThis.fetch = ((...args: Parameters<typeof fetch>) => {
    const [input, init] = args;
    const request: CapturedRequest = {
      url: input.toString(),
      method: init?.method ?? "GET",
      body: (init?.body as string | undefined) ?? null,
      authorization: (init?.headers as Record<string, string> | undefined)?.["Authorization"] ?? null,
    };

    captured = request;

    return Promise.resolve(respond(request));
  }) as typeof fetch;

  try {
    const result = await run();

    if (captured === null) {
      throw new HttpAcademicClientUnitFailure("withCapturingFetch", "fetch was never called");
    }

    return { result, request: captured };
  } finally {
    globalThis.fetch = original;
  }
}

async function runCreateAcademicTermSendsAuthorizedPostCase(): Promise<void> {
  const caseId = "createAcademicTerm sends an authorized POST with the request body";
  const client = createAcademicClient({ apiBaseUrl: "https://app.avora.ai", accessToken: "token-1" });

  const { result, request } = await withCapturingFetch(
    () =>
      new Response(
        JSON.stringify({ term: { termId: "term-1", label: "Semester 1" } }),
        { status: 201 },
      ),
    () =>
      client.createAcademicTerm({
        label: "Semester 1",
        institutionName: "SNIST",
        programmeName: null,
        branchName: null,
        startsOn: null,
        endsOn: null,
      }),
  );

  assert(
    request.url === "https://app.avora.ai/api/academic/setup/terms",
    caseId,
    `unexpected url: ${request.url}`,
  );
  assert(request.method === "POST", caseId, `unexpected method: ${request.method}`);
  assert(request.authorization === "Bearer token-1", caseId, "expected the access token as a bearer header");
  assert(
    request.body !== null && JSON.parse(request.body).label === "Semester 1",
    caseId,
    "expected the request body to carry the term label",
  );
  assert((result as { term: { termId: string } }).term.termId === "term-1", caseId, "expected the parsed response body");
}

async function runCreateSubjectSendsAuthorizedPostCase(): Promise<void> {
  const caseId = "createSubject sends an authorized POST with the request body";
  const client = createAcademicClient({ apiBaseUrl: "https://app.avora.ai", accessToken: "token-1" });

  const { request } = await withCapturingFetch(
    () => new Response(JSON.stringify({ subject: { subjectId: "subject-1", displayName: "Data Structures" } }), { status: 201 }),
    () =>
      client.createSubject({
        termId: "term-1",
        displayName: "Data Structures",
        subjectCode: null,
        description: null,
      }),
  );

  assert(
    request.url === "https://app.avora.ai/api/academic/setup/subjects",
    caseId,
    `unexpected url: ${request.url}`,
  );
  assert(request.method === "POST", caseId, `unexpected method: ${request.method}`);
}

async function runGetSetupProgressSendsAuthorizedGetCase(): Promise<void> {
  const caseId = "getSetupProgress sends an authorized GET with no body";
  const client = createAcademicClient({ apiBaseUrl: "https://app.avora.ai", accessToken: "token-1" });

  const { result, request } = await withCapturingFetch(
    () =>
      new Response(
        JSON.stringify({
          progress: {
            status: "not_started",
            termCount: 0,
            activeTermCount: 0,
            subjectCount: 0,
            structureUnitCount: 0,
            hasActiveTerm: false,
            hasSubject: false,
            hasStructure: false,
          },
        }),
        { status: 200 },
      ),
    () => client.getSetupProgress(),
  );

  assert(
    request.url === "https://app.avora.ai/api/academic/setup/progress",
    caseId,
    `unexpected url: ${request.url}`,
  );
  assert(request.method === "GET", caseId, `unexpected method: ${request.method}`);
  assert(request.body === null, caseId, "a GET request must not carry a body");
  assert(request.authorization === "Bearer token-1", caseId, "expected the access token as a bearer header");
  assert(
    (result as { progress: { hasStructure: boolean } }).progress.hasStructure === false,
    caseId,
    "expected the zero-structure-valid progress state to pass through unchanged",
  );
}

async function runGetStructureTreeSendsAuthorizedGetCase(): Promise<void> {
  const caseId = "getStructureTree sends an authorized GET to the tree route";
  const client = createAcademicClient({ apiBaseUrl: "https://app.avora.ai", accessToken: "token-1" });

  const { request } = await withCapturingFetch(
    () => new Response(JSON.stringify({ tree: { terms: [] } }), { status: 200 }),
    () => client.getStructureTree(),
  );

  assert(request.url === "https://app.avora.ai/api/academic/tree", caseId, `unexpected url: ${request.url}`);
  assert(request.method === "GET", caseId, `unexpected method: ${request.method}`);
}

async function runNonOkResponseThrowsAcademicApiRequestErrorCase(): Promise<void> {
  const caseId = "a non-2xx response throws AcademicApiRequestError without leaking the response body";
  const client = createAcademicClient({ apiBaseUrl: "https://app.avora.ai", accessToken: "token-1" });

  let thrown: unknown = null;

  try {
    await withCapturingFetch(
      () => new Response(JSON.stringify({ error: "forbidden", detail: "internal reason" }), { status: 403 }),
      () => client.getSetupProgress(),
    );
  } catch (error) {
    thrown = error;
  }

  assert(thrown instanceof AcademicApiRequestError, caseId, "expected an AcademicApiRequestError");
  assert((thrown as AcademicApiRequestError).status === 403, caseId, "expected the response status to be preserved");
  assert(
    !(thrown as AcademicApiRequestError).message.includes("internal reason"),
    caseId,
    "the error message must never include the response body",
  );
}

async function main(): Promise<void> {
  await runCreateAcademicTermSendsAuthorizedPostCase();
  await runCreateSubjectSendsAuthorizedPostCase();
  await runGetSetupProgressSendsAuthorizedGetCase();
  await runGetStructureTreeSendsAuthorizedGetCase();
  await runNonOkResponseThrowsAcademicApiRequestErrorCase();
}

await main();
