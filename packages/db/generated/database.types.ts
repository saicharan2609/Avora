/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Source: supabase/
 * Stage: Stage 6 Group 1 foundation baseline.
 *
 * This file represents the empty application-schema baseline before the first
 * Avora application table is introduced.
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
    Tables: Readonly<Record<string, never>>;
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
