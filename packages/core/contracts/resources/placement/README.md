# resource placement API contracts

Owner: @avora/core
Domain owner: @avora/data
Security co-owner: @avora/security

## Purpose

This directory contains transport-level API contracts for resource placement routes.

## Public surface

- `@avora/core/contracts/resources/placement`

## Scope

Stage 9 Group 5 adds contracts for:

- listing persisted placement candidates for a resource;
- accepting an existing persisted placement candidate;
- recording placement correction;
- listing placed resources by academic unit.

## Boundaries

These are transport schemas and types only.

These contracts must not implement placement policy, classification, repository logic, Supabase queries, AI behavior, retrieval behavior, web route behavior, or UI behavior.

Request bodies and query strings must not accept `studentId`. The web API resolves the authenticated student from the session.