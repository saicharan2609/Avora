export type RequestContract<RequestBody, ResponseBody> = Readonly<{
  requestBody: RequestBody;
  responseBody: ResponseBody;
}>;

export type EmptyRequestBody = Readonly<Record<string, never>>;

export type EmptyResponseBody = Readonly<Record<string, never>>;