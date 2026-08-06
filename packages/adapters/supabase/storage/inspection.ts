import { createClient } from "@supabase/supabase-js";

export type SupabaseStorageInspectionAdapterErrorCode =
  | "supabase_storage_inspection_failed"
  | "supabase_storage_invalid_path";

export class SupabaseStorageInspectionAdapterError extends Error {
  public readonly code: SupabaseStorageInspectionAdapterErrorCode;

  public constructor(code: SupabaseStorageInspectionAdapterErrorCode, message: string) {
    super(message);
    this.name = "SupabaseStorageInspectionAdapterError";
    this.code = code;
  }
}

export type CreateSupabaseStorageInspectionAdapterInput = Readonly<{
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
}>;

export type SupabaseStorageInspectionAdapter = Readonly<{
  inspectResourceObject: (
    input: Readonly<{
      storage: Readonly<{
        bucket: string;
        objectPath: string;
        version: number;
      }>;
    }>,
  ) => Promise<
    | Readonly<{
        exists: true;
        byteSize: number;
        contentType: string;
      }>
    | Readonly<{
        exists: false;
      }>
  >;
}>;

export function createSupabaseStorageInspectionAdapter(
  input: CreateSupabaseStorageInspectionAdapterInput,
): SupabaseStorageInspectionAdapter {
  const client = createClient(input.supabaseUrl, input.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return {
    inspectResourceObject: async (request) => {
      const parsedPath = parseObjectPath(request.storage.objectPath);

      const { data, error } = await client.storage
        .from(request.storage.bucket)
        .list(parsedPath.directory, {
          limit: 100,
          search: parsedPath.filename,
        });

      if (error !== null) {
        throw new SupabaseStorageInspectionAdapterError(
          "supabase_storage_inspection_failed",
          error.message,
        );
      }

      const object = data.find((candidate) => candidate.name === parsedPath.filename);

      if (object === undefined) {
        return {
          exists: false,
        };
      }

      const metadata = toMetadataRecord(object.metadata);

      return {
        exists: true,
        byteSize: readMetadataNumber(metadata, "size"),
        contentType: readMetadataString(metadata, "mimetype"),
      };
    },
  };
}

function parseObjectPath(objectPath: string): Readonly<{
  directory: string;
  filename: string;
}> {
  const lastSlashIndex = objectPath.lastIndexOf("/");

  if (lastSlashIndex <= 0 || lastSlashIndex === objectPath.length - 1) {
    throw new SupabaseStorageInspectionAdapterError(
      "supabase_storage_invalid_path",
      "Supabase storage object path must include a directory and filename.",
    );
  }

  return {
    directory: objectPath.slice(0, lastSlashIndex),
    filename: objectPath.slice(lastSlashIndex + 1),
  };
}

function toMetadataRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function readMetadataNumber(metadata: Record<string, unknown>, key: string): number {
  const value = metadata[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new SupabaseStorageInspectionAdapterError(
    "supabase_storage_inspection_failed",
    `Supabase storage object metadata is missing numeric ${key}.`,
  );
}

function readMetadataString(metadata: Record<string, unknown>, key: string): string {
  const value = metadata[key];

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new SupabaseStorageInspectionAdapterError(
    "supabase_storage_inspection_failed",
    `Supabase storage object metadata is missing string ${key}.`,
  );
}