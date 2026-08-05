import type { DatabaseClient, RoleScopedDatabaseClient } from "../client/index.js";

export type DatabaseClientFactoryPort = Readonly<{
  createStudentClient: (input: Readonly<{
    accessToken: string;
  }>) => RoleScopedDatabaseClient<"student">;
  createServiceRoleClient: () => RoleScopedDatabaseClient<"service">;
}>;

export type RepositoryExecutionContext = Readonly<{
  client: DatabaseClient;
}>;