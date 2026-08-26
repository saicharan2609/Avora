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
      resource_extraction_jobs: {
        Row: {
          attempt_count: number;
          available_at: string;
          completed_at: string | null;
          created_at: string;
          enqueued_at: string;
          failed_at: string | null;
          heartbeat_at: string | null;
          job_id: string;
          job_name: "resource.extraction.extract";
          last_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_extraction_job_priority"];
          reason: Database["public"]["Enums"]["resource_extraction_job_reason"];
          resource_id: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["resource_extraction_job_status"];
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
          job_name: "resource.extraction.extract";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_extraction_job_priority"];
          reason: Database["public"]["Enums"]["resource_extraction_job_reason"];
          resource_id: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_extraction_job_status"];
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
          job_name?: "resource.extraction.extract";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload?: Json;
          priority?: Database["public"]["Enums"]["resource_extraction_job_priority"];
          reason?: Database["public"]["Enums"]["resource_extraction_job_reason"];
          resource_id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_extraction_job_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_extraction_jobs_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["resource_id"];
          },
          {
            foreignKeyName: "resource_extraction_jobs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };
      resource_chunking_jobs: {
        Row: {
          attempt_count: number;
          available_at: string;
          completed_at: string | null;
          created_at: string;
          enqueued_at: string;
          extraction_document_id: string;
          failed_at: string | null;
          heartbeat_at: string | null;
          job_id: string;
          job_name: "resource.chunking.chunk";
          last_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_chunking_job_priority"];
          reason: Database["public"]["Enums"]["resource_chunking_job_reason"];
          resource_id: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["resource_chunking_job_status"];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          attempt_count?: number;
          available_at?: string;
          completed_at?: string | null;
          created_at?: string;
          enqueued_at?: string;
          extraction_document_id: string;
          failed_at?: string | null;
          heartbeat_at?: string | null;
          job_id?: string;
          job_name: "resource.chunking.chunk";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_chunking_job_priority"];
          reason: Database["public"]["Enums"]["resource_chunking_job_reason"];
          resource_id: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_chunking_job_status"];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          attempt_count?: number;
          available_at?: string;
          completed_at?: string | null;
          created_at?: string;
          enqueued_at?: string;
          extraction_document_id?: string;
          failed_at?: string | null;
          heartbeat_at?: string | null;
          job_id?: string;
          job_name?: "resource.chunking.chunk";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload?: Json;
          priority?: Database["public"]["Enums"]["resource_chunking_job_priority"];
          reason?: Database["public"]["Enums"]["resource_chunking_job_reason"];
          resource_id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_chunking_job_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_chunking_jobs_extraction_document_fkey";
            columns: ["student_id", "extraction_document_id"];
            isOneToOne: false;
            referencedRelation: "resource_extraction_documents";
            referencedColumns: ["student_id", "extraction_document_id"];
          },
          {
            foreignKeyName: "resource_chunking_jobs_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["resource_id"];
          },
          {
            foreignKeyName: "resource_chunking_jobs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };
      resource_upload_ticket_jobs: {
        Row: {
          attempt_count: number;
          available_at: string;
          completed_at: string | null;
          created_at: string;
          enqueued_at: string;
          failed_at: string | null;
          heartbeat_at: string | null;
          job_id: string;
          job_name: "resource.upload_ticket.create";
          last_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_upload_ticket_job_priority"];
          reason: Database["public"]["Enums"]["resource_upload_ticket_job_reason"];
          resource_id: string;
          result: Json | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["resource_upload_ticket_job_status"];
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
          job_name: "resource.upload_ticket.create";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_upload_ticket_job_priority"];
          reason: Database["public"]["Enums"]["resource_upload_ticket_job_reason"];
          resource_id: string;
          result?: Json | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_upload_ticket_job_status"];
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
          job_name?: "resource.upload_ticket.create";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload?: Json;
          priority?: Database["public"]["Enums"]["resource_upload_ticket_job_priority"];
          reason?: Database["public"]["Enums"]["resource_upload_ticket_job_reason"];
          resource_id?: string;
          result?: Json | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_upload_ticket_job_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_upload_ticket_jobs_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["resource_id"];
          },
          {
            foreignKeyName: "resource_upload_ticket_jobs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };
      resource_indexing_jobs: {
        Row: {
          attempt_count: number;
          available_at: string;
          completed_at: string | null;
          created_at: string;
          enqueued_at: string;
          failed_at: string | null;
          heartbeat_at: string | null;
          job_id: string;
          job_name: "retrieval.index.resource";
          last_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_indexing_job_priority"];
          reason: Database["public"]["Enums"]["resource_indexing_job_reason"];
          resource_id: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["resource_indexing_job_status"];
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
          job_name: "retrieval.index.resource";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_indexing_job_priority"];
          reason: Database["public"]["Enums"]["resource_indexing_job_reason"];
          resource_id: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_indexing_job_status"];
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
          job_name?: "retrieval.index.resource";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload?: Json;
          priority?: Database["public"]["Enums"]["resource_indexing_job_priority"];
          reason?: Database["public"]["Enums"]["resource_indexing_job_reason"];
          resource_id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_indexing_job_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_indexing_jobs_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["resource_id"];
          },
          {
            foreignKeyName: "resource_indexing_jobs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };
      resource_classification_jobs: {
        Row: {
          attempt_count: number;
          available_at: string;
          completed_at: string | null;
          created_at: string;
          enqueued_at: string;
          failed_at: string | null;
          heartbeat_at: string | null;
          job_id: string;
          job_name: "resource.classification.requested";
          last_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_classification_job_priority"];
          reason: Database["public"]["Enums"]["resource_classification_job_reason"];
          resource_id: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["resource_classification_job_status"];
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
          job_name: "resource.classification.requested";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_classification_job_priority"];
          reason: Database["public"]["Enums"]["resource_classification_job_reason"];
          resource_id: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_classification_job_status"];
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
          job_name?: "resource.classification.requested";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload?: Json;
          priority?: Database["public"]["Enums"]["resource_classification_job_priority"];
          reason?: Database["public"]["Enums"]["resource_classification_job_reason"];
          resource_id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_classification_job_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_classification_jobs_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["resource_id"];
          },
          {
            foreignKeyName: "resource_classification_jobs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };
      chunks: {
        Row: {
          chunk_id: string;
          chunking_strategy_version: string;
          content_kind: Database["public"]["Enums"]["retrieval_chunk_content_kind"];
          created_at: string;
          extraction_document_id: string;
          locator: Json;
          resource_id: string;
          sanitisation_status: Database["public"]["Enums"]["retrieval_chunk_sanitisation_status"];
          sanitisation_strategy_version: string;
          sanitisation_warnings: Json;
          sort_order: number;
          source_block_ids: string[];
          source_content_hash: string;
          status: Database["public"]["Enums"]["retrieval_chunk_status"];
          structure_unit_id: string | null;
          student_id: string;
          subject_id: string | null;
          term_id: string | null;
          text: string;
          token_estimate: number;
          updated_at: string;
        };
        Insert: {
          chunk_id?: string;
          chunking_strategy_version: string;
          content_kind: Database["public"]["Enums"]["retrieval_chunk_content_kind"];
          created_at?: string;
          extraction_document_id: string;
          locator: Json;
          resource_id: string;
          sanitisation_status: Database["public"]["Enums"]["retrieval_chunk_sanitisation_status"];
          sanitisation_strategy_version: string;
          sanitisation_warnings?: Json;
          sort_order: number;
          source_block_ids: string[];
          source_content_hash: string;
          status?: Database["public"]["Enums"]["retrieval_chunk_status"];
          structure_unit_id?: string | null;
          student_id: string;
          subject_id?: string | null;
          term_id?: string | null;
          text: string;
          token_estimate: number;
          updated_at?: string;
        };
        Update: {
          chunk_id?: string;
          chunking_strategy_version?: string;
          content_kind?: Database["public"]["Enums"]["retrieval_chunk_content_kind"];
          created_at?: string;
          extraction_document_id?: string;
          locator?: Json;
          resource_id?: string;
          sanitisation_status?: Database["public"]["Enums"]["retrieval_chunk_sanitisation_status"];
          sanitisation_strategy_version?: string;
          sanitisation_warnings?: Json;
          sort_order?: number;
          source_block_ids?: string[];
          source_content_hash?: string;
          status?: Database["public"]["Enums"]["retrieval_chunk_status"];
          structure_unit_id?: string | null;
          student_id?: string;
          subject_id?: string | null;
          term_id?: string | null;
          text?: string;
          token_estimate?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chunks_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "chunks_resource_fkey";
            columns: ["student_id", "resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["student_id", "resource_id"];
          },
          {
            foreignKeyName: "chunks_extraction_document_fkey";
            columns: ["student_id", "resource_id", "extraction_document_id"];
            isOneToOne: false;
            referencedRelation: "resource_extraction_documents";
            referencedColumns: ["student_id", "resource_id", "extraction_document_id"];
          },
          {
            foreignKeyName: "chunks_term_fkey";
            columns: ["student_id", "term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["student_id", "term_id"];
          },
          {
            foreignKeyName: "chunks_subject_fkey";
            columns: ["student_id", "term_id", "subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["student_id", "term_id", "subject_id"];
          },
          {
            foreignKeyName: "chunks_structure_unit_fkey";
            columns: ["student_id", "structure_unit_id"];
            isOneToOne: false;
            referencedRelation: "structure_units";
            referencedColumns: ["student_id", "structure_unit_id"];
          },
        ];
      };
      resource_extraction_documents: {
        Row: {
          chunking_strategy_version: string;
          created_at: string;
          extracted_at: string;
          extraction_document_id: string;
          extraction_strategy_version: string;
          resource_id: string;
          status: Database["public"]["Enums"]["resource_extraction_document_status"];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          chunking_strategy_version: string;
          created_at?: string;
          extracted_at?: string;
          extraction_document_id?: string;
          extraction_strategy_version: string;
          resource_id: string;
          status: Database["public"]["Enums"]["resource_extraction_document_status"];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          chunking_strategy_version?: string;
          created_at?: string;
          extracted_at?: string;
          extraction_document_id?: string;
          extraction_strategy_version?: string;
          resource_id?: string;
          status?: Database["public"]["Enums"]["resource_extraction_document_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_extraction_documents_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "resource_extraction_documents_resource_fkey";
            columns: ["student_id", "resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["student_id", "resource_id"];
          },
        ];
      };
      resource_extracted_content_blocks: {
        Row: {
          block_id: string;
          confidence: number | null;
          created_at: string;
          extraction_document_id: string;
          kind: Database["public"]["Enums"]["resource_extracted_content_block_kind"];
          locator: Json;
          parent_block_id: string | null;
          resource_id: string;
          sort_order: number;
          student_id: string;
          text: string;
          updated_at: string;
        };
        Insert: {
          block_id?: string;
          confidence?: number | null;
          created_at?: string;
          extraction_document_id: string;
          kind: Database["public"]["Enums"]["resource_extracted_content_block_kind"];
          locator: Json;
          parent_block_id?: string | null;
          resource_id: string;
          sort_order: number;
          student_id: string;
          text: string;
          updated_at?: string;
        };
        Update: {
          block_id?: string;
          confidence?: number | null;
          created_at?: string;
          extraction_document_id?: string;
          kind?: Database["public"]["Enums"]["resource_extracted_content_block_kind"];
          locator?: Json;
          parent_block_id?: string | null;
          resource_id?: string;
          sort_order?: number;
          student_id?: string;
          text?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_extracted_content_blocks_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "resource_extracted_content_blocks_document_fkey";
            columns: ["student_id", "resource_id", "extraction_document_id"];
            isOneToOne: false;
            referencedRelation: "resource_extraction_documents";
            referencedColumns: ["student_id", "resource_id", "extraction_document_id"];
          },
          {
            foreignKeyName: "resource_extracted_content_blocks_parent_fkey";
            columns: ["student_id", "extraction_document_id", "parent_block_id"];
            isOneToOne: false;
            referencedRelation: "resource_extracted_content_blocks";
            referencedColumns: ["student_id", "extraction_document_id", "block_id"];
          },
        ];
      };
      resource_extraction_provenance: {
        Row: {
          created_at: string;
          extracted_at: string;
          extraction_document_id: string;
          notes: string | null;
          page_number: number | null;
          provenance_id: string;
          resource_id: string;
          source:
            | "document_text"
            | "ocr"
            | "scan"
            | "handwriting"
            | "manual"
            | "system";
          strategy_version: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          extracted_at: string;
          extraction_document_id: string;
          notes?: string | null;
          page_number?: number | null;
          provenance_id?: string;
          resource_id: string;
          source:
            | "document_text"
            | "ocr"
            | "scan"
            | "handwriting"
            | "manual"
            | "system";
          strategy_version: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          extracted_at?: string;
          extraction_document_id?: string;
          notes?: string | null;
          page_number?: number | null;
          provenance_id?: string;
          resource_id?: string;
          source?:
            | "document_text"
            | "ocr"
            | "scan"
            | "handwriting"
            | "manual"
            | "system";
          strategy_version?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_extraction_provenance_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "resource_extraction_provenance_document_fkey";
            columns: ["student_id", "resource_id", "extraction_document_id"];
            isOneToOne: false;
            referencedRelation: "resource_extraction_documents";
            referencedColumns: ["student_id", "resource_id", "extraction_document_id"];
          },
        ];
      };
      resource_extracted_pages: {
        Row: {
          confidence: number | null;
          created_at: string;
          extraction_document_id: string;
          locator: Json;
          page_id: string;
          page_number: number;
          provenance_id: string;
          resource_id: string;
          student_id: string;
          text: string;
          updated_at: string;
        };
        Insert: {
          confidence?: number | null;
          created_at?: string;
          extraction_document_id: string;
          locator: Json;
          page_id?: string;
          page_number: number;
          provenance_id: string;
          resource_id: string;
          student_id: string;
          text: string;
          updated_at?: string;
        };
        Update: {
          confidence?: number | null;
          created_at?: string;
          extraction_document_id?: string;
          locator?: Json;
          page_id?: string;
          page_number?: number;
          provenance_id?: string;
          resource_id?: string;
          student_id?: string;
          text?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_extracted_pages_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "resource_extracted_pages_document_fkey";
            columns: ["student_id", "resource_id", "extraction_document_id"];
            isOneToOne: false;
            referencedRelation: "resource_extraction_documents";
            referencedColumns: ["student_id", "resource_id", "extraction_document_id"];
          },
          {
            foreignKeyName: "resource_extracted_pages_provenance_fkey";
            columns: ["student_id", "extraction_document_id", "provenance_id"];
            isOneToOne: false;
            referencedRelation: "resource_extraction_provenance";
            referencedColumns: ["student_id", "extraction_document_id", "provenance_id"];
          },
        ];
      };
      resource_extraction_failures: {
        Row: {
          code:
            | "resource_not_processable"
            | "storage_object_unavailable"
            | "unsupported_mime_type"
            | "unsupported_resource_kind"
            | "unsupported_page"
            | "empty_extraction"
            | "extractor_failed";
          created_at: string;
          extraction_document_id: string;
          failure_id: string;
          message: string;
          page_number: number | null;
          provenance_id: string | null;
          resource_id: string;
          student_id: string;
        };
        Insert: {
          code:
            | "resource_not_processable"
            | "storage_object_unavailable"
            | "unsupported_mime_type"
            | "unsupported_resource_kind"
            | "unsupported_page"
            | "empty_extraction"
            | "extractor_failed";
          created_at?: string;
          extraction_document_id: string;
          failure_id?: string;
          message: string;
          page_number?: number | null;
          provenance_id?: string | null;
          resource_id: string;
          student_id: string;
        };
        Update: {
          code?:
            | "resource_not_processable"
            | "storage_object_unavailable"
            | "unsupported_mime_type"
            | "unsupported_resource_kind"
            | "unsupported_page"
            | "empty_extraction"
            | "extractor_failed";
          created_at?: string;
          extraction_document_id?: string;
          failure_id?: string;
          message?: string;
          page_number?: number | null;
          provenance_id?: string | null;
          resource_id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_extraction_failures_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "resource_extraction_failures_document_fkey";
            columns: ["student_id", "resource_id", "extraction_document_id"];
            isOneToOne: false;
            referencedRelation: "resource_extraction_documents";
            referencedColumns: ["student_id", "resource_id", "extraction_document_id"];
          },
          {
            foreignKeyName: "resource_extraction_failures_provenance_fkey";
            columns: ["student_id", "extraction_document_id", "provenance_id"];
            isOneToOne: false;
            referencedRelation: "resource_extraction_provenance";
            referencedColumns: ["student_id", "extraction_document_id", "provenance_id"];
          },
        ];
      };
      academic_terms: {
        Row: {
          created_at: string;
          ends_on: string | null;
          institution_name: string | null;
          label: string;
          lifecycle_state: Database["public"]["Enums"]["academic_term_lifecycle_state"];
          starts_on: string | null;
          student_id: string;
          term_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_on?: string | null;
          institution_name?: string | null;
          label: string;
          lifecycle_state?: Database["public"]["Enums"]["academic_term_lifecycle_state"];
          starts_on?: string | null;
          student_id: string;
          term_id?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_on?: string | null;
          institution_name?: string | null;
          label?: string;
          lifecycle_state?: Database["public"]["Enums"]["academic_term_lifecycle_state"];
          starts_on?: string | null;
          student_id?: string;
          term_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academic_terms_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };
      subjects: {
        Row: {
          created_at: string;
          description: string | null;
          display_name: string;
          lifecycle_state: Database["public"]["Enums"]["subject_lifecycle_state"];
          student_id: string;
          subject_code: string | null;
          subject_id: string;
          term_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_name: string;
          lifecycle_state?: Database["public"]["Enums"]["subject_lifecycle_state"];
          student_id: string;
          subject_code?: string | null;
          subject_id?: string;
          term_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_name?: string;
          lifecycle_state?: Database["public"]["Enums"]["subject_lifecycle_state"];
          student_id?: string;
          subject_code?: string | null;
          subject_id?: string;
          term_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subjects_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "subjects_term_fkey";
            columns: ["student_id", "term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["student_id", "term_id"];
          },
        ];
      };
      structure_units: {
        Row: {
          created_at: string;
          description: string | null;
          parent_unit_id: string | null;
          sort_order: number;
          source: Database["public"]["Enums"]["structure_unit_source"];
          structure_unit_id: string;
          student_id: string;
          subject_id: string;
          term_id: string;
          title: string;
          unit_kind: Database["public"]["Enums"]["academic_structure_unit_kind"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          parent_unit_id?: string | null;
          sort_order?: number;
          source?: Database["public"]["Enums"]["structure_unit_source"];
          structure_unit_id?: string;
          student_id: string;
          subject_id: string;
          term_id: string;
          title: string;
          unit_kind: Database["public"]["Enums"]["academic_structure_unit_kind"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          parent_unit_id?: string | null;
          sort_order?: number;
          source?: Database["public"]["Enums"]["structure_unit_source"];
          structure_unit_id?: string;
          student_id?: string;
          subject_id?: string;
          term_id?: string;
          title?: string;
          unit_kind?: Database["public"]["Enums"]["academic_structure_unit_kind"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "structure_units_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "structure_units_term_fkey";
            columns: ["student_id", "term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["student_id", "term_id"];
          },
          {
            foreignKeyName: "structure_units_subject_fkey";
            columns: ["student_id", "term_id", "subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["student_id", "term_id", "subject_id"];
          },
          {
            foreignKeyName: "structure_units_parent_fkey";
            columns: ["student_id", "parent_unit_id"];
            isOneToOne: false;
            referencedRelation: "structure_units";
            referencedColumns: ["student_id", "structure_unit_id"];
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
      };
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
      resource_placements: {
        Row: {
          placement_id: string;
          student_id: string;
          resource_id: string;
          term_id: string;
          subject_id: string;
          structure_unit_id: string | null;
          confidence_level:
            | "student_confirmed"
            | "high"
            | "medium"
            | "low"
            | "unknown";
          confidence_source:
            | "student"
            | "imported"
            | "system_suggested";
          confidence_reason: string | null;
          status: "accepted" | "tentative";
          candidate_id: string | null;
          candidate_provenance:
            | "resource_metadata"
            | "resource_content"
            | "student_declared"
            | "imported"
            | null;
          placement_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          placement_id?: string;
          student_id: string;
          resource_id: string;
          term_id: string;
          subject_id: string;
          structure_unit_id?: string | null;
          confidence_level:
            | "student_confirmed"
            | "high"
            | "medium"
            | "low"
            | "unknown";
          confidence_source:
            | "student"
            | "imported"
            | "system_suggested";
          confidence_reason?: string | null;
          status: "accepted" | "tentative";
          candidate_id?: string | null;
          candidate_provenance?:
            | "resource_metadata"
            | "resource_content"
            | "student_declared"
            | "imported"
            | null;
          placement_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          placement_id?: string;
          student_id?: string;
          resource_id?: string;
          term_id?: string;
          subject_id?: string;
          structure_unit_id?: string | null;
          confidence_level?:
            | "student_confirmed"
            | "high"
            | "medium"
            | "low"
            | "unknown";
          confidence_source?:
            | "student"
            | "imported"
            | "system_suggested";
          confidence_reason?: string | null;
          status?: "accepted" | "tentative";
          candidate_id?: string | null;
          candidate_provenance?:
            | "resource_metadata"
            | "resource_content"
            | "student_declared"
            | "imported"
            | null;
          placement_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_placements_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "resource_placements_resource_fkey";
            columns: ["student_id", "resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["student_id", "resource_id"];
          },
          {
            foreignKeyName: "resource_placements_term_fkey";
            columns: ["student_id", "term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["student_id", "term_id"];
          },
          {
            foreignKeyName: "resource_placements_subject_fkey";
            columns: ["student_id", "term_id", "subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["student_id", "term_id", "subject_id"];
          },
          {
            foreignKeyName: "resource_placements_structure_unit_fkey";
            columns: ["student_id", "structure_unit_id"];
            isOneToOne: false;
            referencedRelation: "structure_units";
            referencedColumns: ["student_id", "structure_unit_id"];
          },
        ];
      };
      resource_placement_candidates: {
        Row: {
          candidate_id: string;
          student_id: string;
          resource_id: string;
          term_id: string;
          subject_id: string;
          structure_unit_id: string | null;
          confidence_level:
            | "student_confirmed"
            | "high"
            | "medium"
            | "low"
            | "unknown";
          confidence_source:
            | "student"
            | "imported"
            | "system_suggested";
          confidence_reason: string | null;
          provenance:
            | "resource_metadata"
            | "resource_content"
            | "student_declared"
            | "imported";
          reason: string | null;
          created_at: string;
        };
        Insert: {
          candidate_id?: string;
          student_id: string;
          resource_id: string;
          term_id: string;
          subject_id: string;
          structure_unit_id?: string | null;
          confidence_level:
            | "student_confirmed"
            | "high"
            | "medium"
            | "low"
            | "unknown";
          confidence_source:
            | "student"
            | "imported"
            | "system_suggested";
          confidence_reason?: string | null;
          provenance:
            | "resource_metadata"
            | "resource_content"
            | "student_declared"
            | "imported";
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          candidate_id?: string;
          student_id?: string;
          resource_id?: string;
          term_id?: string;
          subject_id?: string;
          structure_unit_id?: string | null;
          confidence_level?:
            | "student_confirmed"
            | "high"
            | "medium"
            | "low"
            | "unknown";
          confidence_source?:
            | "student"
            | "imported"
            | "system_suggested";
          confidence_reason?: string | null;
          provenance?:
            | "resource_metadata"
            | "resource_content"
            | "student_declared"
            | "imported";
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_placement_candidates_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "resource_placement_candidates_resource_fkey";
            columns: ["student_id", "resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["student_id", "resource_id"];
          },
          {
            foreignKeyName: "resource_placement_candidates_term_fkey";
            columns: ["student_id", "term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["student_id", "term_id"];
          },
          {
            foreignKeyName: "resource_placement_candidates_subject_fkey";
            columns: ["student_id", "term_id", "subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["student_id", "term_id", "subject_id"];
          },
          {
            foreignKeyName: "resource_placement_candidates_structure_unit_fkey";
            columns: ["student_id", "structure_unit_id"];
            isOneToOne: false;
            referencedRelation: "structure_units";
            referencedColumns: ["student_id", "structure_unit_id"];
          },
        ];
      };
      resource_placement_corrections: {
        Row: {
          correction_id: string;
          student_id: string;
          resource_id: string;
          previous_term_id: string | null;
          previous_subject_id: string | null;
          previous_structure_unit_id: string | null;
          corrected_term_id: string;
          corrected_subject_id: string;
          corrected_structure_unit_id: string | null;
          reason: string | null;
          corrected_at: string;
        };
        Insert: {
          correction_id?: string;
          student_id: string;
          resource_id: string;
          previous_term_id?: string | null;
          previous_subject_id?: string | null;
          previous_structure_unit_id?: string | null;
          corrected_term_id: string;
          corrected_subject_id: string;
          corrected_structure_unit_id?: string | null;
          reason?: string | null;
          corrected_at?: string;
        };
        Update: {
          correction_id?: string;
          student_id?: string;
          resource_id?: string;
          previous_term_id?: string | null;
          previous_subject_id?: string | null;
          previous_structure_unit_id?: string | null;
          corrected_term_id?: string;
          corrected_subject_id?: string;
          corrected_structure_unit_id?: string | null;
          reason?: string | null;
          corrected_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_placement_corrections_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "resource_placement_corrections_resource_fkey";
            columns: ["student_id", "resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["student_id", "resource_id"];
          },
          {
            foreignKeyName: "resource_placement_corrections_previous_term_fkey";
            columns: ["student_id", "previous_term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["student_id", "term_id"];
          },
          {
            foreignKeyName: "resource_placement_corrections_previous_subject_fkey";
            columns: ["student_id", "previous_term_id", "previous_subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["student_id", "term_id", "subject_id"];
          },
          {
            foreignKeyName: "resource_placement_corrections_previous_structure_unit_fkey";
            columns: ["student_id", "previous_structure_unit_id"];
            isOneToOne: false;
            referencedRelation: "structure_units";
            referencedColumns: ["student_id", "structure_unit_id"];
          },
          {
            foreignKeyName: "resource_placement_corrections_corrected_term_fkey";
            columns: ["student_id", "corrected_term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["student_id", "term_id"];
          },
          {
            foreignKeyName: "resource_placement_corrections_corrected_subject_fkey";
            columns: ["student_id", "corrected_term_id", "corrected_subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["student_id", "term_id", "subject_id"];
          },
          {
            foreignKeyName: "resource_placement_corrections_corrected_structure_unit_fkey";
            columns: ["student_id", "corrected_structure_unit_id"];
            isOneToOne: false;
            referencedRelation: "structure_units";
            referencedColumns: ["student_id", "structure_unit_id"];
          },
        ];
      };
      chunk_embeddings: {
        Row: {
          chunk_id: string;
          content_hash: string;
          created_at: string;
          dimensions: number;
          // PostgREST serializes a pgvector column's wire text
          // representation as a JSON string, not a JSON array. Insert/
          // Update below accept a plain number[] (verified against the
          // live stack; a JS array serializes to identical text on the
          // way in), but the Row a SELECT actually returns is a string
          // that repository mappers must parse.
          embedding: string;
          embedding_strategy_version: string;
          resource_id: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          chunk_id: string;
          content_hash: string;
          created_at?: string;
          dimensions: number;
          embedding: number[];
          embedding_strategy_version: string;
          resource_id: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          chunk_id?: string;
          content_hash?: string;
          created_at?: string;
          dimensions?: number;
          embedding?: number[];
          embedding_strategy_version?: string;
          resource_id?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chunk_embeddings_student_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "chunk_embeddings_chunk_fkey";
            columns: ["student_id", "chunk_id"];
            isOneToOne: false;
            referencedRelation: "chunks";
            referencedColumns: ["student_id", "chunk_id"];
          },
          {
            foreignKeyName: "chunk_embeddings_resource_fkey";
            columns: ["student_id", "resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["student_id", "resource_id"];
          },
        ];
      };
      embedding_cache: {
        Row: {
          content_hash: string;
          created_at: string;
          dimensions: number;
          // See chunk_embeddings.Row.embedding above: PostgREST returns a
          // pgvector column as a JSON string on SELECT, not a JSON array.
          embedding: string;
          embedding_strategy_version: string;
        };
        Insert: {
          content_hash: string;
          created_at?: string;
          dimensions: number;
          embedding: number[];
          embedding_strategy_version: string;
        };
        Update: {
          content_hash?: string;
          created_at?: string;
          dimensions?: number;
          embedding?: number[];
          embedding_strategy_version?: string;
        };
        Relationships: [];
      };
      resource_summaries: {
        Row: {
          body: Json;
          created_at: string;
          model_version: string;
          prompt_version: string;
          provenance: string;
          resource_id: string;
          resource_summary_id: string;
          student_id: string;
          summary_strategy_version: string;
        };
        Insert: {
          body: Json;
          created_at?: string;
          model_version: string;
          prompt_version: string;
          provenance?: string;
          resource_id: string;
          resource_summary_id?: string;
          student_id: string;
          summary_strategy_version: string;
        };
        Update: {
          body?: Json;
          created_at?: string;
          model_version?: string;
          prompt_version?: string;
          provenance?: string;
          resource_id?: string;
          resource_summary_id?: string;
          student_id?: string;
          summary_strategy_version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_summaries_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["resource_id"];
          },
          {
            foreignKeyName: "resource_summaries_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };
      resource_summary_citations: {
        Row: {
          chunk_id: string;
          created_at: string;
          quote: string;
          resource_id: string;
          resource_summary_citation_id: string;
          resource_summary_id: string;
          student_id: string;
        };
        Insert: {
          chunk_id: string;
          created_at?: string;
          quote: string;
          resource_id: string;
          resource_summary_citation_id?: string;
          resource_summary_id: string;
          student_id: string;
        };
        Update: {
          chunk_id?: string;
          created_at?: string;
          quote?: string;
          resource_id?: string;
          resource_summary_citation_id?: string;
          resource_summary_id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_summary_citations_resource_summary_id_fkey";
            columns: ["resource_summary_id"];
            isOneToOne: false;
            referencedRelation: "resource_summaries";
            referencedColumns: ["resource_summary_id"];
          },
          {
            foreignKeyName: "resource_summary_citations_resource_fkey";
            columns: ["student_id", "resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["student_id", "resource_id"];
          },
          {
            foreignKeyName: "resource_summary_citations_chunk_fkey";
            columns: ["student_id", "chunk_id"];
            isOneToOne: false;
            referencedRelation: "chunks";
            referencedColumns: ["student_id", "chunk_id"];
          },
        ];
      };
      resource_summary_jobs: {
        Row: {
          attempt_count: number;
          available_at: string;
          completed_at: string | null;
          created_at: string;
          enqueued_at: string;
          failed_at: string | null;
          heartbeat_at: string | null;
          job_id: string;
          job_name: "summary.generate.requested";
          last_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_summary_job_priority"];
          reason: Database["public"]["Enums"]["resource_summary_job_reason"];
          resource_id: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["resource_summary_job_status"];
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
          job_name: "summary.generate.requested";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload: Json;
          priority: Database["public"]["Enums"]["resource_summary_job_priority"];
          reason: Database["public"]["Enums"]["resource_summary_job_reason"];
          resource_id: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_summary_job_status"];
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
          job_name?: "summary.generate.requested";
          last_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          payload?: Json;
          priority?: Database["public"]["Enums"]["resource_summary_job_priority"];
          reason?: Database["public"]["Enums"]["resource_summary_job_reason"];
          resource_id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["resource_summary_job_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resource_summary_jobs_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["resource_id"];
          },
          {
            foreignKeyName: "resource_summary_jobs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["student_id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_chunks_hybrid: {
        Args: {
          p_student_id: string;
          p_term_id: string | null;
          p_subject_id: string | null;
          p_structure_unit_id: string | null;
          p_resource_id: string | null;
          p_status: string;
          p_query_text: string;
          // Sent as a plain JS number[]; pgvector's json/jsonb cast support
          // (verified against the live stack) converts it into vector(1536)
          // on the way in. See chunk_embeddings.Insert.embedding above for
          // the same pattern.
          p_query_embedding: number[];
          p_embedding_strategy_version: string;
          p_match_count: number;
        };
        Returns: {
          chunk_id: string;
          fused_score: number;
        }[];
      };
    };
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

      resource_extraction_job_priority: "interactive" | "normal" | "backfill";
      resource_extraction_job_reason:
        | "resource_validation_succeeded"
        | "manual_reprocess_requested";
      resource_extraction_job_status:
        | "queued"
        | "claimed"
        | "running"
        | "succeeded"
        | "failed"
        | "dead_lettered"
        | "cancelled";

      resource_chunking_job_priority: "interactive" | "normal" | "backfill";
      resource_chunking_job_reason:
        | "resource_extraction_succeeded"
        | "manual_rechunk_requested";
      resource_chunking_job_status:
        | "queued"
        | "claimed"
        | "running"
        | "succeeded"
        | "failed"
        | "dead_lettered"
        | "cancelled";

      resource_upload_ticket_job_priority: "interactive" | "normal" | "backfill";
      resource_upload_ticket_job_reason: "upload_declared";
      resource_upload_ticket_job_status:
        | "queued"
        | "claimed"
        | "running"
        | "succeeded"
        | "failed"
        | "dead_lettered"
        | "cancelled";

      resource_indexing_job_priority: "interactive" | "normal" | "backfill";
      resource_indexing_job_reason:
        | "resource_chunking_succeeded"
        | "manual_reindex_requested"
        | "embedding_strategy_backfill";
      resource_indexing_job_status:
        | "queued"
        | "claimed"
        | "running"
        | "succeeded"
        | "failed"
        | "dead_lettered"
        | "cancelled";

      resource_classification_job_priority: "interactive" | "normal" | "backfill";
      resource_classification_job_reason:
        | "resource_ingestion_validated"
        | "placement_reclassification_requested";
      resource_classification_job_status:
        | "queued"
        | "claimed"
        | "running"
        | "succeeded"
        | "failed"
        | "dead_lettered"
        | "cancelled";

      resource_summary_job_priority: "interactive" | "normal" | "backfill";
      resource_summary_job_reason: "resource_indexed";
      resource_summary_job_status:
        | "queued"
        | "claimed"
        | "running"
        | "succeeded"
        | "failed"
        | "dead_lettered"
        | "cancelled";

      retrieval_chunk_content_kind:
        | "heading"
        | "paragraph"
        | "list"
        | "table"
        | "formula"
        | "code"
        | "figure"
        | "diagram"
        | "transcript"
        | "metadata"
        | "mixed"
        | "unknown";

      retrieval_chunk_sanitisation_status:
        | "sanitised"
        | "sanitised_with_warnings";

      retrieval_chunk_status:
        | "ready"
        | "superseded"
        | "deleted";

      academic_structure_unit_kind:
        | "module"
        | "topic"
        | "week"
        | "lecture"
        | "assignment_group"
        | "exam_area"
        | "custom";

      resource_extracted_content_block_kind:
        | "heading"
        | "paragraph"
        | "list"
        | "table"
        | "formula"
        | "code"
        | "figure"
        | "diagram"
        | "transcript"
        | "metadata"
        | "unknown";

      resource_extraction_document_status:
        | "extracted"
        | "partially_extracted"
        | "failed";

      academic_term_lifecycle_state:
        | "planned"
        | "active"
        | "completed"
        | "archived";

      structure_unit_source:
        | "student_declared"
        | "imported"
        | "system_suggested";

      subject_lifecycle_state:
        | "active"
        | "archived";

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