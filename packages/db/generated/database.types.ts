/* eslint-disable */
/**
 * Generated Supabase database types.
 *
 * This file mirrors the reviewed Stage 6, Stage 7 Groups 1–8 Supabase artifacts.
 * Keep the shape compatible with @supabase/supabase-js typed PostgREST generics.
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
      resource_ingestion_jobs: {
        Row: {
          attempt_count: number;
          available_at: string;
          completed_at: string | null;
          created_at: string;
          enqueued_at: string;
          failed_at: string | null;
          heartbeat_at: string | null;
          job_id: string;
          job_name: "resources.ingestion.requested";
          last_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_ingestion_job_priority"];
          reason: Database["public"]["Enums"]["resource_ingestion_job_reason"];
          resource_id: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["resource_ingestion_job_status"];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          attempt_count?: number;
          available_at?: string;
          completed_at?: string | null;
          created_at?: string;
          enqueued_at?: string;
          failed_at?: string | null;
          heartbeat_at?: string | null;
          job_id?: string;
          job_name: "resources.ingestion.requested";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_ingestion_job_priority"];
          reason: Database["public"]["Enums"]["resource_ingestion_job_reason"];
          resource_id: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_ingestion_job_status"];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          attempt_count?: number;
          available_at?: string;
          completed_at?: string | null;
          created_at?: string;
          enqueued_at?: string;
          failed_at?: string | null;
          heartbeat_at?: string | null;
          job_id?: string;
          job_name?: "resources.ingestion.requested";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload?: Json;
          priority?: Database["public"]["Enums"]["resource_ingestion_job_priority"];
          reason?: Database["public"]["Enums"]["resource_ingestion_job_reason"];
          resource_id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_ingestion_job_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_ingestion_jobs_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["resource_id"];
          },
          {
            foreignKeyName: "resource_ingestion_jobs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };

      resources: {
  Row: {
    byte_size: number;
    content_hash: string | null;
    created_at: string;
    declared_mime_type: string;
    lifecycle_state: Database["public"]["Enums"]["resource_lifecycle_state"];
    original_filename: string;
    resource_id: string;
    resource_kind: Database["public"]["Enums"]["resource_kind"];
    storage_bucket: Database["public"]["Enums"]["resource_storage_bucket"];
    storage_object_path: string;
    storage_version: number;
    student_id: string;
    updated_at: string;
    upload_completed_at: string | null;
  };
  Insert: {
    byte_size: number;
    content_hash?: string | null;
    created_at?: string;
    declared_mime_type: string;
    lifecycle_state?: Database["public"]["Enums"]["resource_lifecycle_state"];
    original_filename: string;
    resource_id?: string;
    resource_kind: Database["public"]["Enums"]["resource_kind"];
    storage_bucket?: Database["public"]["Enums"]["resource_storage_bucket"];
    storage_object_path: string;
    storage_version?: number;
    student_id: string;
    updated_at?: string;
    upload_completed_at?: string | null;
  };
  Update: {
    byte_size?: number;
    content_hash?: string | null;
    created_at?: string;
    declared_mime_type?: string;
    lifecycle_state?: Database["public"]["Enums"]["resource_lifecycle_state"];
    original_filename?: string;
    resource_id?: string;
    resource_kind?: Database["public"]["Enums"]["resource_kind"];
    storage_bucket?: Database["public"]["Enums"]["resource_storage_bucket"];
    storage_object_path?: string;
    storage_version?: number;
    student_id?: string;
    updated_at?: string;
    upload_completed_at?: string | null;
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
},

      students: {
        Row: {
          created_at: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      resource_ingestion_job_priority: "normal" | "high";
      resource_ingestion_job_reason: "upload_completed";
      resource_ingestion_job_status:
        | "queued"
        | "claimed"
        | "running"
        | "succeeded"
        | "failed"
        | "dead_lettered"
        | "cancelled";

      resource_kind:
  | "document"
  | "image"
  | "scan"
  | "audio"
  | "video"
  | "archive"
  | "other";

resource_lifecycle_state:
  | "pending_upload"
  | "uploaded"
  | "processing"
  | "ready"
  | "rejected"
  | "failed";

resource_storage_bucket:
  | "quarantine"
  | "originals"
  | "derivatives"
  | "exports"
  | "shared";
    };
    CompositeTypes: Record<string, never>;
  };
};