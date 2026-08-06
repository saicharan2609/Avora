/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Source: supabase/
 * Stage: Stage 7 Group 4 resource repository compatibility baseline.
 *
 * This file represents the generated database type baseline after introducing
 * public.students and public.resources as student-scoped tables.
 *
 * The shape intentionally follows the Supabase generated TypeScript structure
 * expected by @supabase/supabase-js. Do not wrap the schema in deep Readonly
 * types because the typed PostgREST client expects mutable Row, Insert, Update,
 * and Relationships shapes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          student_id: string;
          display_name: string | null;
          lifecycle_status: "active" | "pending_deletion" | "deleted";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          student_id: string;
          display_name?: string | null;
          lifecycle_status?: "active" | "pending_deletion" | "deleted";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          student_id?: string;
          display_name?: string | null;
          lifecycle_status?: "active" | "pending_deletion" | "deleted";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
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
        };
        Insert: {
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
        };
        Update: {
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
        };
        Relationships: [
          {
            foreignKeyName: "resources_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  app_private: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: {
      create_student_for_auth_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};