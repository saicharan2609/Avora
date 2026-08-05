/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Source: supabase/
 * Stage: Stage 6 Group 2 identity persistence baseline.
 *
 * This file represents the generated database type baseline after introducing
 * public.students as Avora's first student-scoped table.
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
    }>;
    Views: Readonly<Record<string, never>>;
    Functions: Readonly<Record<string, never>>;
    Enums: Readonly<Record<string, never>>;
    CompositeTypes: Readonly<Record<string, never>>;
  }>;
  app_private: Readonly<{
    Tables: Readonly<Record<string, never>>;
    Views: Readonly<Record<string, never>>;
    Functions: Readonly<Record<string, never>>;
    Enums: Readonly<Record<string, never>>;
    CompositeTypes: Readonly<Record<string, never>>;
  }>;
}>;