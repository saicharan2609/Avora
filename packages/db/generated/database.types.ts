/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Source: supabase/
 * Stage: Stage 7 Group 1 resource upload-intent baseline.
 *
 * This file represents the generated database type baseline after introducing
 * public.students and public.resources as student-scoped tables.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: Json | undefined }
  | readonly Json[];

export type Database = Readonly<{
  public: Readonly<{
    Tables: Readonly<{
      students: Readonly<{
        Row: Readonly<{
          student_id: string;
          display_name: string | null;
          lifecycle_status: "active" | "pending_deletion" | "deleted";
          created_at: string;
          updated_at: string;
        }>;
        Insert: Readonly<{
          student_id: string;
          display_name?: string | null;
          lifecycle_status?: "active" | "pending_deletion" | "deleted";
          created_at?: string;
          updated_at?: string;
        }>;
        Update: Readonly<{
          student_id?: string;
          display_name?: string | null;
          lifecycle_status?: "active" | "pending_deletion" | "deleted";
          created_at?: string;
          updated_at?: string;
        }>;
        Relationships: readonly [
          Readonly<{
            foreignKeyName: "students_student_id_fkey";
            columns: readonly ["student_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: readonly ["id"];
          }>,
        ];
      }>;
      resources: Readonly<{
        Row: Readonly<{
          resource_id: string;
          student_id: string;
          resource_kind: "document" | "image" | "scan" | "audio" | "video" | "archive" | "other";
          original_filename: string;
          declared_mime_type: string;
          byte_size: number;
          content_hash: string | null;
          lifecycle_state:
            | "pending_upload"
            | "uploaded"
            | "rejected"
            | "processing"
            | "ready"
            | "failed"
            | "deleted";
          storage_bucket: "quarantine" | "originals" | "derivatives" | "exports" | "shared";
          storage_object_path: string;
          storage_version: number;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Readonly<{
          resource_id?: string;
          student_id: string;
          resource_kind: "document" | "image" | "scan" | "audio" | "video" | "archive" | "other";
          original_filename: string;
          declared_mime_type: string;
          byte_size: number;
          content_hash?: string | null;
          lifecycle_state?:
            | "pending_upload"
            | "uploaded"
            | "rejected"
            | "processing"
            | "ready"
            | "failed"
            | "deleted";
          storage_bucket?: "quarantine" | "originals" | "derivatives" | "exports" | "shared";
          storage_object_path: string;
          storage_version?: number;
          created_at?: string;
          updated_at?: string;
        }>;
        Update: Readonly<{
          resource_id?: string;
          student_id?: string;
          resource_kind?: "document" | "image" | "scan" | "audio" | "video" | "archive" | "other";
          original_filename?: string;
          declared_mime_type?: string;
          byte_size?: number;
          content_hash?: string | null;
          lifecycle_state?:
            | "pending_upload"
            | "uploaded"
            | "rejected"
            | "processing"
            | "ready"
            | "failed"
            | "deleted";
          storage_bucket?: "quarantine" | "originals" | "derivatives" | "exports" | "shared";
          storage_object_path?: string;
          storage_version?: number;
          created_at?: string;
          updated_at?: string;
        }>;
        Relationships: readonly [
          Readonly<{
            foreignKeyName: "resources_student_id_fkey";
            columns: readonly ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: readonly ["student_id"];
          }>,
        ];
      }>;
    }>;
    Views: Readonly<Record<string, never>>;
    Functions: Readonly<Record<string, never>>;
    Enums: Readonly<Record<string, never>>;
    CompositeTypes: Readonly<Record<string, never>>;
  }>;
  app_private: Readonly<{
    Tables: Readonly<Record<string, never>>;
    Views: Readonly<Record<string, never>>;
    Functions: Readonly<{
      create_student_for_auth_user: Readonly<{
        Args: Readonly<Record<string, never>>;
        Returns: unknown;
      }>;
    }>;
    Enums: Readonly<Record<string, never>>;
    CompositeTypes: Readonly<Record<string, never>>;
  }>;
}>;