import { createClient } from "@supabase/supabase-js";

import type {
  SupabaseCreateSignedReadUrlInput,
  SupabaseCreateSignedReadUrlResult,
  SupabaseCreateUploadTicketInput,
  SupabaseCreateUploadTicketResult,
  SupabaseDeleteObjectInput,
  SupabasePromoteObjectInput,
  SupabaseStorageAdapter,
  SupabaseStorageConnection,
} from "./contracts.js";
import { SupabaseStorageAdapterError } from "./errors.js";
import {
  assertSafeObjectPath,
  assertStoragePathBelongsToStudent,
} from "./path.js";
import type { IsoDateTimeString } from "@avora/core/time";

const signedUploadUrlLifetimeSeconds = 7200;

function createIsoExpiry(secondsFromNow: number): IsoDateTimeString {
  if (!Number.isInteger(secondsFromNow) || secondsFromNow <= 0) {
    throw new SupabaseStorageAdapterError(
      "storage_invalid_expiry",
      "Storage signed URL expiry must be a positive integer number of seconds",
    );
  }

  return new Date(
  Date.now() + secondsFromNow * 1000,
   ).toISOString() as IsoDateTimeString;
}

export function createSupabaseStorageAdapter(
  connection: SupabaseStorageConnection,
): SupabaseStorageAdapter {
  const client = createClient(connection.supabaseUrl, connection.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return {
    createUploadTicket: async (
      input: SupabaseCreateUploadTicketInput,
    ): Promise<SupabaseCreateUploadTicketResult> => {
      const storage = {
        bucket: input.bucket,
        objectPath: input.objectPath,
        version: 1,
      } as const;

      assertStoragePathBelongsToStudent({
        studentId: input.studentId,
        storage,
      });

      const { data, error } = await client.storage
        .from(input.bucket)
        .createSignedUploadUrl(input.objectPath);

      if (error !== null) {
        throw new SupabaseStorageAdapterError(
          "storage_signed_upload_url_failed",
          error.message,
        );
      }

      if (data.signedUrl.length === 0) {
        throw new SupabaseStorageAdapterError(
          "storage_signed_upload_url_missing",
          "Supabase Storage did not return a signed upload URL",
        );
      }

      return {
        storage,
        uploadUrl: data.signedUrl,
        expiresAt: createIsoExpiry(signedUploadUrlLifetimeSeconds),
      };
    },

    createSignedReadUrl: async (
      input: SupabaseCreateSignedReadUrlInput,
    ): Promise<SupabaseCreateSignedReadUrlResult> => {
      assertStoragePathBelongsToStudent({
        studentId: input.studentId,
        storage: input.storage,
      });

      const { data, error } = await client.storage
        .from(input.storage.bucket)
        .createSignedUrl(input.storage.objectPath, input.expiresInSeconds);

      if (error !== null) {
        throw new SupabaseStorageAdapterError(
          "storage_signed_read_url_failed",
          error.message,
        );
      }

      if (data.signedUrl.length === 0) {
        throw new SupabaseStorageAdapterError(
          "storage_signed_read_url_missing",
          "Supabase Storage did not return a signed read URL",
        );
      }

      return {
        readUrl: data.signedUrl,
        expiresAt: createIsoExpiry(input.expiresInSeconds),
      };
    },

    promoteObject: async (input: SupabasePromoteObjectInput): Promise<void> => {
      assertStoragePathBelongsToStudent({
        studentId: input.studentId,
        storage: input.from,
      });
      assertStoragePathBelongsToStudent({
        studentId: input.studentId,
        storage: input.to,
      });
      assertSafeObjectPath(input.to.objectPath);

      const { error } = await client.storage.from(input.from.bucket).move(
        input.from.objectPath,
        input.to.objectPath,
        {
          destinationBucket: input.to.bucket,
        },
      );

      if (error !== null) {
        throw new SupabaseStorageAdapterError("storage_promote_object_failed", error.message);
      }
    },

    deleteObject: async (input: SupabaseDeleteObjectInput): Promise<void> => {
      assertStoragePathBelongsToStudent({
        studentId: input.studentId,
        storage: input.storage,
      });

      const { error } = await client.storage
        .from(input.storage.bucket)
        .remove([input.storage.objectPath]);

      if (error !== null) {
        throw new SupabaseStorageAdapterError("storage_delete_object_failed", error.message);
      }
    },
  };
}