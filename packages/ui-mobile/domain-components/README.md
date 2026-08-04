# domain-components

Owner: @avora/design-system

## Purpose

The `domain-components` directory owns mobile domain-component contracts for Avora.

Domain components know Avora product concepts and are enforcement points for cross-cutting product and responsible-AI rules.

## Public surface

- `@avora/ui-mobile/domain-components`

## Requirement trace

- ENG-011
- ENG-124
- ENG-297
- ENG-298
- FR-039
- FR-125
- FR-143
- AIR-002
- AIR-006
- AIR-010
- RAI-01
- RAI-06
- NFR-014
- NFR-051
- Rule CP-01
- Rule CP-02
- Rule HO-02

## Boundaries

This directory must not contain business logic, domain services, APIs, database implementation, Supabase implementation, authentication implementation, AI implementation, retrieval implementation, jobs implementation, pages, screens, or tests.

Stage 5 Group 2 defines contracts only. It does not implement React Native components.