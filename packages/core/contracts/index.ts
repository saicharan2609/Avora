export type RequestContract<RequestBody, ResponseBody> = Readonly<{
  requestBody: RequestBody;
  responseBody: ResponseBody;
}>;

export type EmptyRequestBody = Readonly<Record<string, never>>;

export type EmptyResponseBody = Readonly<Record<string, never>>;

export type * from "./resources/index.js";
export type * from "./tutor/index.js";

export * from "./resources/index.js";
export * from "./tutor/index.js";