# policies

Owner: @avora/data  
Security co-owner: @avora/security

## Purpose

This directory contains reviewed Supabase RLS policy artifacts.

## Current policy artifacts

- resource ingestion jobs

## Boundaries

Policy artifacts document and mirror RLS posture for reviewed tables.

Student-scoped tables must deny cross-student access.

Worker and service-role mutation must rely on service-role bypass, not broad authenticated policies.