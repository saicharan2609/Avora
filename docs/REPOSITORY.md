# Avora — Repository Foundation Specification

**Document class:** Repository infrastructure specification
**Status:** Proposed — requires sign-off on the amendments in §27 before `git init`
**Authority position:** Below `PRD.md` → `architecture.md` → `ENGINEERING-RULES.md` / `SECURITY.md` → `DESIGN-SYSTEM.md`. This document **implements** `AD-33` and `architecture.md` §32. Where it appears to disagree with an upstream document, the upstream document wins and this document has a defect (`ENG-411`, `ENG-336`).

---

## 0. What This Document Is

`architecture.md` §32 fixes the repository *shape*. `ENGINEERING-RULES.md` §5–§10 fixes the *rules of work* inside it. Neither states, at the level required to run `git init` and be correct for years: the per-directory ownership matrix, the enforcement wiring, the workspace and build-graph configuration, the environment variable topology, or the GitHub governance layer.

That is this document's scope, and only that.

**It does not:** restate, summarise, rewrite or redesign any upstream document; contain feature code, components, tables, APIs, or business logic; or decide any open question (`AOQ-01`–`AOQ-07`, `OQ-##`, `SOQ-##`). Where a repository decision depends on an open question, the seam is built and the question is registered in §27 — per `ENG-410`, as configuration with a documented default and an owner, never as a constant.

### 0.1 Identifier scheme used here

| Prefix | Meaning |
| --- | --- |
| `REPO-##` | A repository infrastructure decision made by this document |
| `AMD-##` | A proposed amendment to `architecture.md` §32, requiring approval before implementation |
| `GAP-##` | A gap identified in an upstream document, reported per `ENG-411` — **not resolved here** |

Every `REPO-##` traces to an upstream identifier in §28. A `REPO-##` with no upstream trace would violate `NN-10` and does not exist.

---

## 1. Repository Design Principles

These are not new principles. They are the six upstream principles that have direct structural consequences, restated as the property the repository must exhibit.

| # | Property the repository must have | Derived from | Structural consequence |
| --- | --- | --- | --- |
| 1 | **One place to look.** An agent orienting itself reads one tree, not a federation. | `AD-33`, `AG-10` | Single monorepo. Contract drift between clients and server is a compile error, not an incident. |
| 2 | **Domain first, technology second.** | `architecture.md` §32.1 rule 1, `ENG-015` | `packages/domain/*` top level is the PRD's vocabulary. Technology appears only at the leaves. |
| 3 | **Boundaries are mechanical, not cultural.** | `EP-02`, `ENG-001`, `ENG-329` | Every boundary in §12 has a lint rule or a build failure behind it. Anything mechanically checkable is never a review comment. |
| 4 | **The vendor is always at the edge.** | `AG-06`, `ENG-018`, `ENG-026` | Vendor names are confined to grep-checkable path prefixes. `AGENTS.md` §10 and CI both depend on this being true of *paths*, not merely of imports. |
| 5 | **Traceability is a property of the filesystem.** | `NFR-063`, `NN-10`, `ENG-011` | Every package and every module carries a `README.md` naming its requirement identifiers, public surface, and owner. |
| 6 | **The guard is protected more strongly than the rule.** | `NN-12`, `ENG-004`, `ENG-322` | Enforcement mechanisms live on protected paths with a second-approver requirement. Weakening a lint rule is a smaller-looking diff than violating it. |

> **REPO-001 — The repository is designed so that the *default* action is the correct one.** Where a rule can be made unrepresentable (a type, a path constraint, a missing method) it is preferred over a rule that must be remembered. This is `architecture.md` §7.4's stated principle applied to repository structure rather than to component props.

---

## 2. Canonical Top-Level Tree

```
avora/
├── .github/                     # Forge governance, CI, ownership          [AMD-01]
├── .vscode/                     # Committed editor baseline (extensions, settings)
├── apps/                        # Deployable units — three, closed set
│   ├── web/                     # Next.js App Router — web client + API route handlers
│   ├── mobile/                  # Expo / React Native — primary client       (AOQ-02)
│   └── worker/                  # Container worker plane                      (AD-08)
├── packages/                    # Non-deployable libraries
│   ├── config/                  # Shared tsconfig, eslint, prettier, tailwind, env schema
│   ├── core/                    # @avora/core — domain types, contracts, validation, query keys
│   ├── domain/                  # Domain services and invariants — 16 modules per §5.3
│   ├── db/                      # Schema access, repositories, RLS policy tests
│   ├── ai/                      # AI Gateway, ports, provider adapters, prompts, routing, evals
│   ├── retrieval/               # Chunking, embedding, scope resolution, hybrid search
│   ├── jobs/                    # Queue abstraction, job definitions, state machines
│   ├── adapters/                # Non-AI vendor adapters — mail, billing, auth, storage [AMD-03]
│   ├── ui-web/                  # shadcn/ui primitives + web domain components
│   ├── ui-mobile/               # NativeWind primitives + mobile domain components
│   └── design-tokens/           # Token source of truth + shared brand assets
├── supabase/                    # Database as a reviewed artifact
│   ├── migrations/              # Versioned SQL, expand/contract discipline
│   ├── policies/                # RLS policies as reviewed artifacts
│   ├── seed/                    # Synthetic seed data — never production-derived
│   └── functions/               # Edge Functions — short, data-adjacent only
├── evals/                       # AI evaluation — the CI gate on grounding
│   ├── corpora/                 # Consented evaluation corpora (AD-21) — access-controlled
│   └── suites/                  # Grounding, citation, extraction, assessment validity
├── e2e/                         # Cross-cutting suites            (ENG-019 exception) [AMD-04]
│   ├── flows/                   # Critical flows — onboarding → upload → tutor → review → deletion
│   ├── adaptivity/              # AD-41 structural adaptivity suite
│   ├── load/                    # Exam-period simulation
│   └── fixtures/                # Shared synthetic corpora
├── docs/                        # The constitution. Plan of record.
├── package.json                 # Root — orchestration only
├── pnpm-workspace.yaml
├── pnpm-lock.yaml               # Committed, exact, frozen in CI
├── turbo.json
├── tsconfig.json                # Solution file — references only
├── .npmrc
├── .gitignore
├── .gitattributes
├── .nvmrc
├── .env.example                 # Names and tiers only. Never values.       (SEC-230)
├── CODEOWNERS                   # → symlinked from .github/CODEOWNERS
├── AGENTS.md                    # Repository operating manual for all agents
├── CLAUDE.md                    # Claude Code operating manual
├── README.md                    # Orientation + the reading order
├── LICENSE
└── SECURITY.md                  # → GitHub-discoverable disclosure policy; points at docs/SECURITY.md
```

### 2.1 What is deliberately absent

`ENG-017` prohibits `utils/`, `helpers/`, `common/`, `shared/`, `misc/`, and `lib/` **anywhere in the repository**. Beyond that, the following are absent by decision, not by omission:

| Absent | Why | Where it lives instead |
| --- | --- | --- |
| `scripts/` (top level) | A top-level scripts directory is the `ENG-017` accretion pattern under a different name, and `ENG-012` requires code to live in the package that owns the concept. | Package-owned: `packages/db/scripts/`, `packages/ai/scripts/`. CI-only: `.github/scripts/`. |
| `assets/` (top level) | Assets have owners. A shared bucket has none. | Brand + fonts + icon set: `packages/design-tokens/assets/`. Surface-specific: `apps/web/public/`, `apps/mobile/assets/`. |
| `tooling/` | The custom lint rules are configuration, and `packages/config` is the configuration package. | `packages/config/eslint/rules/` |
| `types/` | `ENG-053` — domain types are defined once in `@avora/core` and flow outward. A second type home is how a duplicate definition is born. | `packages/core/` |
| `services/`, `api/`, `models/` at any level | `ENG-015` — a technology taxonomy replaces the vocabulary that carries the product decision. | `packages/domain/<module>/services/` |
| A parallel `tests/` tree | `ENG-019` — colocation makes an untested module visible in a directory listing. | `__tests__/` beside the code; `e2e/` for cross-cutting only. |

> **REPO-002 — The top-level directory set is closed at eight entries:** `.github/`, `.vscode/`, `apps/`, `packages/`, `supabase/`, `evals/`, `e2e/`, `docs/`. Adding one is an `architecture.md` §32 amendment (`ENG-010`), reviewed by `@avora/architecture`, never a pull request that "also adds a folder." Root-level tooling and metadata files are enumerated in §11 and are scoped out of §32 by rule 7.

---

## 3. Workspace Inventory

Every workspace member, its package name, its owner, and its publishability. All packages are `"private": true`; Avora publishes nothing (`REPO-003`).

| Path | Package name | Type | Owner (CODEOWNERS team) | Deployed as |
| --- | --- | --- | --- | --- |
| `apps/web` | `@avora/web` | App | `@avora/web` | Vercel |
| `apps/mobile` | `@avora/mobile` | App | `@avora/mobile` | EAS → App Store / Play Store |
| `apps/worker` | `@avora/worker` | App | `@avora/platform` | OCI image → container runtime |
| `packages/config` | `@avora/config` | Config | `@avora/architecture` | — |
| `packages/core` | `@avora/core` | Library | `@avora/architecture` | — |
| `packages/domain` | `@avora/domain` | Library | Per-module (§5.2) | — |
| `packages/db` | `@avora/db` | Library | `@avora/data` | — |
| `packages/ai` | `@avora/ai` | Library | `@avora/ai` | — |
| `packages/retrieval` | `@avora/retrieval` | Library | `@avora/ai` | — |
| `packages/jobs` | `@avora/jobs` | Library | `@avora/platform` | — |
| `packages/adapters` | `@avora/adapters` | Library | `@avora/platform` | — |
| `packages/ui-web` | `@avora/ui-web` | Library | `@avora/design-system` | — |
| `packages/ui-mobile` | `@avora/ui-mobile` | Library | `@avora/design-system` | — |
| `packages/design-tokens` | `@avora/design-tokens` | Library | `@avora/design-system` | — |
| `e2e` | `@avora/e2e` | Test harness | `@avora/qa` | — |
| `evals` | `@avora/evals` | Test harness | `@avora/ai` | — |
| `supabase` | *not a workspace member* | SQL artifacts | `@avora/data` | Supabase CLI |

### 3.1 Ownership teams

| Team | Owns | Escalation authority |
| --- | --- | --- |
| `@avora/architecture` | `packages/core`, `packages/config`, root config, `docs/architecture.md`, `docs/adr/` | Architectural amendments; `AOQ-##` (with founders) |
| `@avora/data` | `packages/db`, `supabase/**` | Schema, RLS, migrations |
| `@avora/ai` | `packages/ai`, `packages/retrieval`, `evals/**` | Prompts, routing, grounding thresholds |
| `@avora/platform` | `packages/jobs`, `packages/adapters`, `apps/worker`, `.github/**` | CI, deployment, secrets, observability |
| `@avora/design-system` | `packages/design-tokens`, `packages/ui-web`, `packages/ui-mobile` | Tokens, component contracts, `DESIGN-SYSTEM.md` |
| `@avora/web` | `apps/web` | Web surface composition |
| `@avora/mobile` | `apps/mobile` | Mobile surface composition, device matrix |
| `@avora/security` | Co-owner of every protected path; sole owner of `.github/workflows/security.yml` | `SEC-###` waivers, `SG-##` gates |
| `@avora/qa` | `e2e/**` | Release gates, flake policy |
| `@avora/product` | `docs/PRD.md`, content catalogue | `OQ-##` |

> **REPO-004 — A directory without a CODEOWNERS entry does not exist.** CI asserts full path coverage; an uncovered path fails the build. `ENG-011`'s "and its owner" is enforced by the forge, not by the README alone.

---

## 4. Directory Specification — `apps/`

`apps/` contains deployable units and nothing else. An app is a **composition root**: it wires packages, owns its runtime configuration, and holds no domain logic (`ENG-100`, `ENG-150`).

> **REPO-005 — `apps/` is a closed set of three.** A fourth deployable is an `AD-01` change (modular monolith), not a directory addition.

### 4.1 `apps/web` — Next.js web client and API surface

| | |
| --- | --- |
| **Purpose** | Marketing, onboarding, desktop enhancement, long-form note editing, admin — and the host for all API route handlers (`architecture.md` §6, §7.1). |
| **Owner** | `@avora/web`; API route handlers co-owned with the module owner of the domain they delegate to. |
| **Allowed dependencies** | `@avora/core`, `@avora/domain`, `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/adapters`, `@avora/ui-web`, `@avora/config` (`ENG-013` graph). |
| **Forbidden dependencies** | `@avora/ui-mobile` (`ENG-014`); `@avora/retrieval` directly — retrieval is reached through the AI Gateway (`NN-02`); any provider SDK (`ENG-018`); any Expo or React Native package. |
| **Responsibility** | Transport, routing, session resolution, serialisation, rendering. It validates, resolves identity, delegates, and serialises — nothing more (`architecture.md` §8.1). |

```
apps/web/
├── app/                         # App Router — route groups mirror surfaces, not modules
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (app)/                   # Authenticated surfaces
│   ├── (admin)/
│   └── api/                     # Route handlers — the API surface
│       └── <resource>/route.ts  # Validate → policy → domain service → serialise
├── middleware.ts                # Edge: session check, routing (architecture.md §33)
├── public/                      # Web-only static assets. Brand assets come from design-tokens.
├── instrumentation.ts           # OpenTelemetry registration
├── env.ts                       # Re-exports the client+server slice of @avora/config. No new vars.
├── next.config.mjs
├── tailwind.config.ts           # extends @avora/config/tailwind
├── tsconfig.json                # references: core, domain, db, ai, jobs, adapters, ui-web
├── README.md                    # Requirement identifiers, public surface, owner (ENG-011)
└── __tests__/
```

**Route handler layering is a directory-level rule, not a convention.** Every `route.ts` is: contract parse → policy (entitlement, quota, consent) → domain service → serialise. A `route.ts` containing a database query, a `fetch` to a vendor, or a conditional on business state fails architecture lint (`ENG-150`, `ENG-160`, `ENG-162`).

### 4.2 `apps/mobile` — Expo primary client

| | |
| --- | --- |
| **Purpose** | The primary student surface (`PR-07`, `D-03`): capture, offline study, review, push. Subject to `AOQ-02`. |
| **Owner** | `@avora/mobile` |
| **Allowed dependencies** | `@avora/core`, `@avora/domain`, `@avora/ui-mobile`, `@avora/config`. |
| **Forbidden dependencies** | `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/retrieval`, `@avora/adapters`, `@avora/ui-web` (`ENG-014`). A client that can reach the database has no boundary at all, and a service-role credential must never exist in a runtime that accepts client input (`SEC-005`, `AD-11`). |
| **Responsibility** | Capture, render, cache, reconcile. All server work is reached over the API contract defined in `@avora/core`. |

```
apps/mobile/
├── app/                         # Expo Router — file-based surfaces
├── src/
│   ├── surfaces/                # Layer-3 compositions (ENG-033)
│   ├── navigation/
│   ├── offline/                 # SQLite schema + reconciliation (FR-085, ENG-115)
│   └── notifications/
├── assets/                      # App icon, splash, store artwork. Brand tokens come from design-tokens.
├── app.config.ts                # Reads @avora/config — never process.env directly
├── eas.json                     # Build profiles: development, preview, production
├── tsconfig.json                # references: core, domain, ui-mobile
├── README.md
└── __tests__/
```

> **`AOQ-02` seam (`REPO-006`).** The directory exists and the dependency edges are declared regardless of how `AOQ-02` resolves, because they are identical for an Expo app and for a wrapped PWA. What changes on resolution is the contents of `app/` and `eas.json` — not the boundary. Nothing in this specification pre-decides the question.

### 4.3 `apps/worker` — container worker plane

| | |
| --- | --- |
| **Purpose** | `AD-08`. All long-running, expensive, retryable work: ingestion, extraction, indexing, generation, planning, insights, backfills, deletion execution. |
| **Owner** | `@avora/platform` |
| **Allowed dependencies** | `@avora/core`, `@avora/domain`, `@avora/db`, `@avora/ai`, `@avora/jobs`, `@avora/retrieval`, `@avora/adapters`, `@avora/config`. |
| **Forbidden dependencies** | `@avora/ui-web`, `@avora/ui-mobile`. Any HTTP framework serving client traffic — this runtime holds the service-role credential and must not accept client input (`SEC-005`, `AD-11`). The health endpoint is the only listener and takes no request body. |
| **Responsibility** | Claim, execute, checkpoint, heartbeat, publish. Every step idempotent; safe to kill at any moment (`architecture.md` §24.2). |

```
apps/worker/
├── src/
│   ├── main.ts                  # Composition root: boot config validation, then claim loop
│   ├── runtime/
│   │   ├── claim-loop.ts        # Visibility timeout, heartbeat, priority class fairness
│   │   ├── checkpoint.ts        # ENG-192
│   │   └── shutdown.ts          # Drain, release claims, never lose a job
│   └── handlers/                # One file per job class, named per architecture.md §24.1
│       ├── resource.ingest.handler.ts
│       ├── deletion.execute.handler.ts
│       └── …
├── Dockerfile                   # Distroless base, pinned by digest (SEC-503)
├── tsconfig.json
├── README.md
└── __tests__/
```

**The worker is the sole holder of the service-role credential.** This is a directory-level security property enforced by `SEC-231`'s CI assertion: a `SUPABASE_SERVICE_ROLE_KEY` reference resolving to any path outside `apps/worker/**` or `packages/adapters/**` fails the build.

---

## 5. Directory Specification — `packages/`

`packages/` contains everything that is not deployable. Dependency direction is the graph in `ENGINEERING-RULES.md` §5.1 and is enforced as a build failure, not reviewed as a smell.

### 5.1 `packages/config` — the configuration package

| | |
| --- | --- |
| **Purpose** | The single source of shared tooling configuration and the typed environment schema (`ENG-267`). |
| **Owner** | `@avora/architecture` — **protected path** (`ENG-322`) |
| **Allowed dependencies** | Third-party tooling only (`typescript`, `eslint`, `prettier`, `tailwindcss`, `zod`). No internal package. |
| **Forbidden dependencies** | Every internal package. `config` is the root of the graph; a dependency here is acquired by everything, including the React Native bundle (`ENG-013` rationale). |
| **Responsibility** | Make the correct configuration the default one. Own the environment variable schema and its trust tiers. |

```
packages/config/
├── typescript/
│   ├── base.json                # strict + every strictness flag (ENG-050)
│   ├── library.json             # composite: true, declaration, declarationMap
│   ├── next.json
│   ├── expo.json
│   └── node.json
├── eslint/
│   ├── base.js                  # Flat config — TS, import hygiene, complexity budgets
│   ├── react.js
│   ├── react-native.js
│   ├── node.js
│   ├── architecture.js          # The NN-## enforcement layer. Second-approver required.
│   └── rules/                   # Custom rule implementations — one file per rule (§16.2)
├── prettier/
│   └── index.js
├── tailwind/
│   └── preset.ts                # Consumes @avora/design-tokens. Contains no literal values.
├── env/
│   ├── client.env.ts            # Tier 1 — client-public. Public prefix required.
│   ├── server.env.ts            # Tier 2 — Vercel encrypted env
│   ├── worker.env.ts            # Tier 3 — worker secret store, incl. service role
│   └── schema.contract.ts       # Tier, owner, requiredness, description per variable
├── vitest/
│   └── base.ts
├── README.md
└── __tests__/                   # Asserts every declared variable has a tier and an owner
```

### 5.2 `packages/core` — `@avora/core`

| | |
| --- | --- |
| **Purpose** | The one canonical definition of domain types, API contracts, validation schemas, branded identifiers, query keys, and error codes (`architecture.md` §6). The contract surface consumed by web, mobile, and worker. |
| **Owner** | `@avora/architecture` |
| **Allowed dependencies** | `@avora/config` and **nothing else internal** (`ENG-013`). Externally: `zod` only, plus the design-system-independent standard library. |
| **Forbidden dependencies** | Every other internal package. Any Node-only API (`fs`, `crypto`, `path`). Any DOM API. Any React or React Native import. A Node-only dependency here fails at runtime on a student's device rather than in CI. |
| **Responsibility** | Types and contracts. **Types, never behaviour** — if `core` appears to need a dependency, the type belongs in `core` and the behaviour belongs elsewhere (`ENG-013` exception clause). |

```
packages/core/
├── identity/                    # Branded ids: StudentId, ResourceId, ChunkId,
│                                #   StructureUnitId, SubjectId, ConceptId, JobId (ENG-054)
├── contracts/                   # Request/response schemas per endpoint (ENG-156)
├── domain-types/                # Entity shapes, discriminated unions (ENG-058 — never `enum`)
├── events/                      # Domain event payload types, catalogue-matched (ENG-198)
├── errors/                      # Namespaced machine codes + recovery-action contract (ENG-158)
├── query-keys/                  # Derived from domain identity, defined once (ENG-113)
├── observability/               # Logger interface + loggable-field types (NN-09 type guard)
├── text/                        # A named module, not a utils drawer (ENG-017)
├── time/                        # Injected clock contract (ENG-065)
├── index.ts                     # The only barrel in this package (ENG-022)
├── README.md
└── __tests__/
```

**`packages/core/observability/` is how `NN-09` becomes a type error.** The logger interface accepts only field types declared here; content-carrying branded types are structurally incompatible with them, so `logger.info({ filename })` fails type-checking rather than review (`ENG-256`).

### 5.3 `packages/domain` — the sixteen modules

| | |
| --- | --- |
| **Purpose** | Business invariants and domain services for the sixteen modules of `architecture.md` §5.3. |
| **Owner** | Per module — see the table below. `@avora/architecture` owns the module list itself. |
| **Allowed dependencies** | `@avora/core`, `@avora/config`; `@avora/db` for repositories; `@avora/jobs` for enqueue; ports it declares. |
| **Forbidden dependencies** | `@avora/ui-web`, `@avora/ui-mobile`; any HTTP framework; any vendor SDK (`ENG-151`, `ENG-026`); another module's internals (`ENG-023`). |
| **Responsibility** | Own the invariants. Domain services never touch HTTP and never touch a vendor SDK. |

```
packages/domain/
├── identity/    academic/    resources/    knowledge/
├── tutor/       notes/       recall/       assessment/
├── mastery/     planning/    insights/     sharing/
├── billing/     ai/          jobs/         platform/
```

The top level is the PRD's vocabulary and the module list is `architecture.md` §5.3's exactly (`ENG-015`). Adding a module is an architectural amendment.

**Every module has the same closed internal shape** (`ENG-016`, plus `ports/` pending `GAP-02`):

```
packages/domain/<module>/
├── contracts/                   # Module-internal contracts; public ones live in @avora/core
├── services/                    # <concept>.service.ts — the invariant holders
├── repositories/                # <concept>.repository.ts — execute as the student's role
├── events/                      # <domain>.<action>.event.ts, matching architecture.md §25.2
├── jobs/                        # <domain>.<action>.job.ts, matching architecture.md §24.1
├── policies/                    # Entitlement, quota, consent, sharing predicates
├── ports/                       # Ports this module declares (ENG-018) — pending GAP-02; not yet in ENG-016's set
├── index.ts                     # THE public surface. Everything else is private. (ENG-023)
├── README.md                    # Requirement identifiers, public surface, owner (ENG-011)
└── __tests__/
```

A module may add a folder for a genuinely module-specific concept (`recall/scheduling/`, `knowledge/strategies/`). It may never add a generic one (`ENG-016` exception).

| Module | Owner | Notable port declared here |
| --- | --- | --- |
| `identity` | `@avora/security` | `AuthPort` |
| `academic` | `@avora/architecture` | — |
| `resources` | `@avora/data` | `BlobStorePort` |
| `knowledge` | `@avora/ai` | — (consumes `RetrievalPort`, `EmbeddingPort` from `packages/retrieval`) |
| `tutor` · `notes` · `assessment` · `insights` | `@avora/ai` | — |
| `recall` | `@avora/ai` | `SchedulerPort` (`AOQ-07`) |
| `mastery` · `planning` | `@avora/architecture` | — |
| `sharing` | `@avora/security` | — |
| `billing` | `@avora/platform` | `BillingPort`, `PaymentCollectionPort` (`AOQ-03`) |
| `ai` | `@avora/ai` | — (consumes `OrchestrationPort` (`AOQ-01`), `ModelPort` from `packages/ai`) |
| `jobs` | `@avora/platform` | — (consumes `QueuePort` from `packages/jobs`) |
| `platform` | `@avora/platform` | `RealtimePort`, `MailPort` |

> **REPO-007 — A cross-module import that resolves to anything other than `packages/domain/<module>/index.ts` is a build failure.** This is `ENG-023`'s "mechanical definition of published". Test files are exempt for their *own* module only (`ENG-023` exception).

### 5.4 `packages/db`

| | |
| --- | --- |
| **Purpose** | Typed data access, the `RepositoryPort` implementation, generated schema types, and the RLS policy test harness. |
| **Owner** | `@avora/data` |
| **Allowed dependencies** | `@avora/core`, `@avora/config`; the Postgres/Supabase client. |
| **Forbidden dependencies** | `@avora/domain` (inverted — domain depends on db); `@avora/ui-*`; `@avora/ai`. |
| **Responsibility** | Execute parameterised queries as the correct role. Own the negative-authorisation harness that every new student-scoped table must use (`ENG-175`). |

```
packages/db/
├── client/                      # Role-scoped clients: student role, service role (worker only)
├── generated/                   # Schema types generated from supabase/ — never hand-edited
├── repositories/                # Base repository primitives; module repositories live in domain
├── rls/
│   ├── harness/                 # The negative-authorisation test harness
│   └── __tests__/               # Cross-student access assertions per table
├── scripts/                     # generate-types, verify-drift — package-owned, not top-level
├── README.md
└── __tests__/
```

**`packages/db/generated/` is committed and drift-checked.** CI regenerates and fails on a diff, so schema and types can never disagree silently.

### 5.5 `packages/ai` — the Gateway

| | |
| --- | --- |
| **Purpose** | `AD-12`. The single enforcement point for every AI requirement: budget gate, context assembly, evidence envelope, routing, invocation, output validation, citation resolution, provenance stamping, telemetry. |
| **Owner** | `@avora/ai` — `prompts/` and `routing/` are **protected paths** (`ENG-322`) |
| **Allowed dependencies** | `@avora/core`, `@avora/config`, `@avora/retrieval`, `@avora/db` (for citation resolution against `chunks`). |
| **Forbidden dependencies** | `@avora/ui-*`; any feature module. Provider SDKs are permitted **only** under `adapters/`. |
| **Responsibility** | Be the only path from Avora to a model. No feature module holds a provider SDK, key, or model name (`NN-02`). |

```
packages/ai/
├── gateway/                     # The ten stages of architecture.md §14.2, in order
│   ├── budget-gate/
│   ├── context/                 # Six-part envelope assembly (ENG-221, ENG-224)
│   ├── envelope/                # The sealed untrusted-evidence envelope (NN-03)
│   ├── routing/                 # Versioned declarative policy — NOT code (ENG-212)  [protected]
│   ├── invocation/              # Timeout, retry, fallback chain (AIR-012)
│   ├── validation/              # Output contract validation, before citation check (ENG-231)
│   ├── citations/               # Machine resolution against chunk ids (NN-11, ENG-229)
│   └── telemetry/               # Cost + quality signals (EP-08)
├── ports/                       # OrchestrationPort, ModelPort — vendor-free by construction
├── adapters/                    # THE ONLY place a provider name may appear in a path (ENG-018)
│   ├── antigravity/             # AOQ-01 — the orchestration adapter
│   ├── anthropic/  openai/  google/
│   └── __tests__/
├── prompts/                     # <task>.v<major>.<minor>.prompt.ts  (ENG-216)      [protected]
├── scripts/
├── README.md
└── __tests__/
```

**Two structural properties do the enforcement work:**

1. `gateway/envelope/` is the only module that constructs model input, and it accepts student content only as a typed evidence value. **There is no string-concatenation path in the package** (`NN-03`, `ENG-217`) — this is a property of the API surface, not a rule someone follows.
2. `packages/ai/adapters/` is the only directory in the repository where a *model, embedding or orchestration provider* name may appear in an import or a path; non-AI vendors are confined to `packages/adapters/`. Both are grep-checkable, and CI greps both (`ENG-018`, `avora/no-vendor-outside-adapters`).

### 5.6 `packages/retrieval`

| | |
| --- | --- |
| **Purpose** | Chunking, embedding orchestration, scope resolution, hybrid search — the mechanics behind `RetrievalPort`. |
| **Owner** | `@avora/ai` |
| **Allowed dependencies** | `@avora/core`, `@avora/config`, `@avora/db`. |
| **Forbidden dependencies** | `@avora/ai` (inverted); `@avora/domain`; `@avora/ui-*`; any feature module; any provider SDK. |
| **Responsibility** | Resolve a scope to an explicit chunk-id predicate **before** any vector operation (`ENG-225`), and pre-filter by `student_id` before searching (`ENG-171`). |

```
packages/retrieval/
├── chunking/      strategies/   scope/      search/       insufficiency/
├── README.md
└── __tests__/
```

`insufficiency/` exists as its own directory because `ENG-226` makes retrieval insufficiency a retrieval-side threshold decision — never a hope that the model refuses. Giving it a home makes it reviewable.

### 5.7 `packages/jobs`

| | |
| --- | --- |
| **Purpose** | `QueuePort`, job state machines, claim/checkpoint/heartbeat primitives, priority classes, dead-letter handling. |
| **Owner** | `@avora/platform` |
| **Allowed dependencies** | `@avora/core`, `@avora/config`, `@avora/db` (transactional enqueue shares the domain transaction). |
| **Forbidden dependencies** | `@avora/ui-*`; `@avora/ai`; `@avora/domain`. Job *definitions* live in the owning domain module; only the *machinery* lives here. |
| **Responsibility** | Make "the row committed but the job never ran" impossible (`EP-04`, `ENG-154`). |

### 5.8 `packages/adapters` — non-AI vendor edge `[AMD-03]`

| | |
| --- | --- |
| **Purpose** | Adapters implementing `MailPort`, `BillingPort`, `PaymentCollectionPort`, `AuthPort`, `BlobStorePort`, `RealtimePort`, `TelemetryPort` and `AnalyticsPort`. The ports themselves live with their declaring modules (`ENG-018`, §5.3); it is their *adapters* that `architecture.md` §32 named no home for. |
| **Owner** | `@avora/platform`; co-owned with `@avora/security` for anything holding a credential. |
| **Allowed dependencies** | `@avora/core`, `@avora/config`; vendor SDKs. |
| **Forbidden dependencies** | `@avora/domain`, `@avora/ui-*`, `@avora/ai`. An adapter never calls a domain service; the dependency points inward only. |
| **Responsibility** | Absorb every vendor mismatch so no domain type is reshaped by a vendor constraint (`EP-01`). |

```
packages/adapters/
├── supabase/       # AuthPort, BlobStorePort, RealtimePort
├── stripe/         # BillingPort — entitlement system of record            (AOQ-03)
├── psp/            # PaymentCollectionPort — domestic UPI collection       (AOQ-03)
├── resend/         # MailPort
├── sentry/  posthog/  otel/
├── README.md
└── __tests__/      # Contract tests: every adapter satisfies its port identically
```

> **This package requires `AMD-03` approval before creation.** Its absence from `architecture.md` §32 is `GAP-01` (§27). Until approved, these adapters have no compliant home and the work is blocked — which is the correct outcome per `ENG-406`, not a reason to place them somewhere convenient.

### 5.9 `packages/ui-web` and `packages/ui-mobile`

| | |
| --- | --- |
| **Purpose** | Two implementations of one specification (`Rule HO-02`) — not a shared abstraction. |
| **Owner** | `@avora/design-system` |
| **Allowed dependencies** | `@avora/design-tokens`, `@avora/core` (types only, for layer-2 domain components), `@avora/config`. |
| **Forbidden dependencies** | **Each other**; `@avora/db`; `@avora/ai`; `@avora/jobs`; `@avora/adapters`; `@avora/domain` (`ENG-014`). A UI package that can reach the database has no boundary at all. |
| **Responsibility** | Solve accessibility once, at layer 1, so it is inherited everywhere. Make required props impossible to omit (`ENG-034`). |

```
packages/ui-{web,mobile}/
├── primitives/                  # Layer 1 — tokens + platform primitives ONLY (ENG-033)
├── components/                  # Layer 2 — domain components; may import @avora/core types
├── states/                      # The six states of DESIGN-SYSTEM.md §28 (ENG-036)
├── content/                     # Message catalogue bindings, ICU pluralisation (ENG-128)
├── index.ts                     # Barrel permitted here only (ENG-022 exception)
├── README.md
└── __tests__/
```

`primitives/` may not import from `components/`, and neither may import a data hook. Layer-3 surface compositions live in the **apps**, never here — a screen is a composition of domain components and belongs to the surface that owns it.

### 5.10 `packages/design-tokens`

| | |
| --- | --- |
| **Purpose** | The shared source of truth for both UI packages, and the home of brand assets. |
| **Owner** | `@avora/design-system` — **protected path** (`ENG-322`) |
| **Allowed dependencies** | None. |
| **Forbidden dependencies** | Everything. A token package with a dependency is a token package that can change for a reason unrelated to design. |
| **Responsibility** | Be the only place a literal visual value exists in the repository (`ENG-124`). |

```
packages/design-tokens/
├── tier-1/                      # Primitive values. Never referenced from a component.
├── tier-2/                      # Semantic tokens. The only tier components may reference.
├── assets/
│   ├── fonts/    icons/    brand/
└── README.md
```

Architecture lint enforces both halves: a hard-coded colour, size, radius, duration, shadow, or font anywhere outside `tier-1/` fails; and a tier-1 reference from any component fails (`ENG-344`).

---

## 6. Directory Specification — `supabase/`

| | |
| --- | --- |
| **Purpose** | The database as a reviewed artifact rather than a deployed side effect. |
| **Owner** | `@avora/data`; `migrations/` and `policies/` co-owned with `@avora/security` — both are **protected paths** (`ENG-322`). |
| **Allowed dependencies** | None. SQL is not a workspace member and imports nothing. |
| **Forbidden dependencies** | Application code. A migration never imports TypeScript; a backfill is versioned SQL or a job, never a script that reaches into another module's tables (`ENG-024`). |
| **Responsibility** | `EP-02` — the database is the security boundary. Everything enforceable here is enforced here. |

```
supabase/
├── migrations/                  # <timestamp>_<verb>_<object>.sql          [protected]
│   └── 20260801120000_add_chunk_locator.sql
├── policies/                    # <table>.policy.sql — one file per table  [protected]
│   └── chunks.policy.sql
├── seed/
│   ├── synthetic/               # The ONLY seed source. Never production-derived (ENG-342).
│   └── adaptivity/              # Zero-, one-, three-, five-level subjects; "Experiment 7"
├── functions/                   # Edge Functions — short, data-adjacent only (ENG-177)
├── config.toml
└── README.md
```

**Three structural rules:**

1. **One policy file per table, named for the table.** A `policies.sql` catch-all makes a policy change unreviewable and is prohibited by `ENG-021`'s naming table. A new student-scoped table without a matching `<table>.policy.sql` **and** negative-authorisation tests in `packages/db/rls/__tests__/` fails the build (`ENG-172`, `ENG-175`).
2. **`seed/adaptivity/` is not optional.** `ENG-067` requires fixtures to represent the diversity of the target market, and the `AD-41` suite needs a subject with no structure and a student-authored label to run against. Shipping seed data without them is how the `AD-41` suite silently stops proving anything.
3. **`functions/` has a size ceiling enforced in CI.** Long work belongs on the worker plane (`ENG-177`); a growing Edge Function is `AD-08` eroding by increments.

---

## 7. Directory Specification — `evals/`

| | |
| --- | --- |
| **Purpose** | `architecture.md` §42.3 as a CI gate. The suite that decides whether a prompt, routing, or retrieval change ships. |
| **Owner** | `@avora/ai`; `corpora/` co-owned with `@avora/security` (consented student material). |
| **Allowed dependencies** | `@avora/core`, `@avora/ai`, `@avora/retrieval`, `@avora/config`. |
| **Forbidden dependencies** | `@avora/ui-*`, `apps/*`. |
| **Responsibility** | Make citation validity a build outcome rather than an opinion. |

```
evals/
├── corpora/                     # AD-21. ACCESS-CONTROLLED — see below.
│   ├── MANIFEST.md              # Consent record, provenance, retention window (AOQ-06)
│   └── …                        # Not in the public repository. Fetched by CI from restricted storage.
├── suites/
│   ├── grounding/               # Claim-level support checking — threshold, blocking
│   ├── citation-validity/       # 100% required. Any failure blocks. (ENG-230)
│   ├── refusal/                 # Curated unanswerable set
│   ├── extraction/              # Typed, scanned, handwritten, angled, regional-language,
│   │                            #   mathematical, diagrammatic — launch gate (AD-21)
│   └── assessment-validity/     # Answerability, unambiguity, key correctness
├── reporters/
├── README.md
└── package.json
```

> **REPO-008 — `evals/corpora/` contains a manifest and a fetch contract, never the corpus itself.** The corpus is consented student academic material. Committing it would place `academic_content`-classified data in git history, where `ENG-270`'s own reasoning applies: it survives every subsequent deletion, and it cannot join the deletion cascade (`SEC-007`). CI retrieves it into an ephemeral, access-controlled workspace and destroys it with the runner. The retention window is `AOQ-06` and is **not decided here**.

---

## 8. Directory Specification — `e2e/`

| | |
| --- | --- |
| **Purpose** | The suites `ENG-019` explicitly exempts from colocation because they are cross-cutting by nature. |
| **Owner** | `@avora/qa`; `adaptivity/` co-owned with `@avora/architecture`. |
| **Allowed dependencies** | `@avora/core`, `@avora/config`; a browser and device driver. |
| **Forbidden dependencies** | `@avora/db` service-role access; any production credential; any production data (`ENG-342`). |
| **Responsibility** | Prove the flows, and prove `D-01`. |

```
e2e/
├── flows/                       # Onboarding, upload→ready, tutor with citations,
│                                #   review, quiz, sharing, deletion
├── adaptivity/                  # AD-41 — the regression guard on the product's central claim
│   └── …                        # Zero/one/three/five levels; heterogeneous labels;
│                                #   restructure preserving every artifact; arbitrary labels;
│                                #   no query, prompt or output assuming a level name
├── load/                        # Exam-period simulation at multiples of expected peak
├── fixtures/                    # <name>.fixture.ts — synthetic only
├── README.md
└── package.json
```

**`e2e/adaptivity/` runs on every pull request, not pre-release.** `architecture.md` §42.2 states this directly, and gives the reason that matters for a repository built for AI agents: it is *the suite most likely to catch a well-intentioned coding agent going wrong*. `ENG-341` forbids skipping it, marking it pending, or weakening it. It is placed at the top level rather than inside a module precisely so that no module owner can quietly narrow its scope.

---

## 9. Directory Specification — `docs/`

| | |
| --- | --- |
| **Purpose** | The constitution and the plan of record (`EP-09`). |
| **Owner** | Per document — see `AGENTS.md` §2 authority order. `@avora/architecture` owns `adr/`. |
| **Allowed dependencies** | None. |
| **Forbidden dependencies** | Duplication. Cross-document duplication is prohibited (`ENG-063`); a document points at the owner of a detail rather than restating it. |
| **Responsibility** | Be readable in the order `AGENTS.md` §2 declares, and merge **before** the code that implements it (`ENG-334`). |

```
docs/
├── PRD.md               architecture.md       ENGINEERING-RULES.md
├── SECURITY.md          DESIGN-SYSTEM.md      DATA-MODEL.md
├── AI-SPEC.md           PRIVACY.md            UX-FLOWS.md
├── ANALYTICS.md         TEST-PLAN.md          ROADMAP.md
├── adr/
│   ├── README.md                # Index: AD-## → file → status
│   └── AD-033-monorepo-layout.md
└── runbooks/                    # Incident procedures, DR drills, rotation, freeze override
```

`docs/runbooks/` is inside `docs/` rather than at the top level because a runbook is documentation with an owner, and `ENG-063` requires documentation to live with the thing it documents. `docs/adr/` carries one file per `AD-##` with context, decision, consequences, and rejected alternatives (`ENG-335`).

**Module READMEs are not in `docs/`.** `ENG-011` places them beside the code so an agent gets local context without loading the whole architecture. `docs/` is the constitution; `README.md` is the local map. They never duplicate.

---

## 10. Directory Specification — `.github/` `[AMD-01]`

| | |
| --- | --- |
| **Purpose** | Forge governance: ownership, CI, templates, dependency policy. |
| **Owner** | `@avora/platform`; `security.yml` solely `@avora/security`. **All of `.github/` is a protected path** (`ENG-322`). |
| **Allowed dependencies** | Actions pinned by digest (`SEC-503`). |
| **Forbidden dependencies** | Any action referenced by tag or branch. Any workflow with `pull_request_target` plus checkout of untrusted head. Any secret in a workflow triggered by a fork. |
| **Responsibility** | Hold the gates. `NN-12` — a blocking gate that blocks is working. |

```
.github/
├── CODEOWNERS                   # Full path coverage asserted in CI (REPO-004)
├── PULL_REQUEST_TEMPLATE.md     # The ENG-326 checklist, exactly
├── ISSUE_TEMPLATE/
│   ├── defect.yml               # Requires a requirement identifier
│   ├── document-conflict.yml    # ENG-411 — the escalation path, as a form
│   ├── open-question.yml        # AOQ/OQ/SOQ registration
│   └── waiver.yml               # ENG-007 — expiring, owned, reviewed
├── workflows/                   # §19
├── actions/                     # Composite actions — setup, ephemeral supabase, seed
├── scripts/                     # CI-only. Never imported by application code.
├── dependabot.yml               # Or renovate.json — grouped, non-auto-merged
└── freeze-calendar.yml          # AD-34 — the academic calendar as machine input
```

**`.github/freeze-calendar.yml` is the encoded form of `AD-34`.** The academic calendar is an input to the release process, *not a thing someone remembers*. It is data in the repository, reviewed like any other protected path, and read by `release-*.yml` to block deployment during an active cohort's examination window. An override requires a named approver recorded in the run.

---

## 11. Root Configuration Files

| File | Purpose | Owner | Protected |
| --- | --- | --- | --- |
| `package.json` | Orchestration only — §12 | `@avora/architecture` | ✓ |
| `pnpm-workspace.yaml` | Workspace membership — §13 | `@avora/architecture` | ✓ |
| `pnpm-lock.yaml` | Exact, committed, frozen in CI (`SEC-500`) | — | ✓ |
| `turbo.json` | Task graph and cache policy — §14 | `@avora/architecture` | ✓ |
| `tsconfig.json` | Solution file — references only, no `include` | `@avora/architecture` | ✓ |
| `.npmrc` | `ignore-scripts=true`, exact save, strict peers (`SEC-502`) | `@avora/security` | ✓ |
| `.nvmrc` | One Node version, matched by CI and by the worker image | `@avora/platform` | ✓ |
| `.gitignore` | The `.env` family, everywhere (`SEC-230`) | `@avora/security` | ✓ |
| `.gitattributes` | Lockfile and generated files marked; LF enforced | `@avora/platform` | |
| `.env.example` | **Names and tiers only.** Never values, never realistic placeholders (`SEC-230`) | `@avora/security` | ✓ |
| `AGENTS.md`, `CLAUDE.md` | Agent operating manuals — root, so every harness finds them | `@avora/architecture` | ✓ |
| `README.md` | Orientation and the reading order of `AGENTS.md` §2 | `@avora/architecture` | |
| `SECURITY.md` (root) | Forge-discoverable disclosure policy; points at `docs/SECURITY.md` | `@avora/security` | ✓ |

---

## 12. Root `package.json` Philosophy

> **REPO-009 — The root `package.json` orchestrates. It never depends.**

| Rule | Rationale |
| --- | --- |
| `"private": true`, no `version` field | Nothing is published (`REPO-003`). A version at the root implies a release unit that does not exist. |
| **No runtime dependencies. Ever.** | A root dependency is invisible to every package's dependency review and reachable from all of them. It defeats `ENG-365`'s higher bar for `packages/core` and client-bundle dependencies by routing around it. |
| `devDependencies` limited to workspace-wide orchestration: `turbo`, `typescript`, `prettier`, `eslint`, `syncpack` | These are the tools that must be one version across the workspace or the workspace is inconsistent. |
| `packageManager` pinned to an exact pnpm version with hash | Reproducible installs (`SEC-500`). Corepack enforces it. |
| `engines` pins Node and pnpm; `.nvmrc` matches; the worker `Dockerfile` matches | "Works on my machine" is a configuration defect with a known cure. |
| Scripts are **thin** — each delegates to a turbo task, never to a shell pipeline | A script with logic is code without a home (`ENG-012`). Logic lives in `.github/scripts/` or a package's own `scripts/`. |

**Root scripts (the complete set):**

```
dev            build          typecheck      lint           lint:arch
format         format:check   test           test:unit      test:integration
test:rls       test:contract  test:adaptivity  eval:ai      e2e
db:generate    db:diff        db:lint        bundle:check   a11y
clean          deps:check     env:check
```

`lint:arch`, `test:rls`, `test:adaptivity`, `eval:ai`, and `env:check` are listed separately from their parent tasks deliberately: each maps to a specific `NN-##` invariant, and a gate that is invisible in the script list is a gate that gets bypassed by convenience rather than by decision (`ENG-346`).

---

## 13. pnpm Workspace Layout

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "e2e"
  - "evals"
```

`supabase/` is deliberately **not** a workspace member. It contains SQL artifacts, not a package; making it one would invite a `package.json` and then a dependency, and the database would acquire a build step.

### 13.1 `.npmrc`

| Setting | Value | Why |
| --- | --- | --- |
| `ignore-scripts` | `true` | `SEC-502` — install scripts execute attacker-controlled code before any scanner runs. Allowlisted exceptions are recorded with an owner in `pnpm.onlyBuiltDependencies`. |
| `save-exact` | `true` | `SEC-500` — pinned, integrity-verified sources. A range is a decision deferred to install time. |
| `strict-peer-dependencies` | `true` | A silently unmet peer is a runtime failure on a student's device. |
| `resolution-mode` | `highest` | Deterministic with `save-exact`. |
| `dedupe-peer-dependents` | `true` | One React, one React Native, one TypeScript. |
| `auto-install-peers` | `false` | An auto-installed dependency skipped `ENG-366`'s review. |

### 13.2 Internal dependency declaration

Internal packages are referenced as `"@avora/core": "workspace:*"`. This is what makes `ENG-013` and `ENG-014` enforceable: the dependency graph is declared in `package.json` files, so a forbidden edge is a **manifest** violation catchable before any code is read.

> **REPO-010 — `syncpack` runs in CI and fails on version drift of any shared external dependency.** Two versions of React, Zod, or TypeScript across the workspace is `ENG-053`'s duplicate-type failure arriving through the dependency graph instead of through code.

---

## 14. Turborepo Configuration Philosophy

> **REPO-011 — Turbo's job is to make the correct pipeline fast enough that nobody works around it** (`ENG-346`). It is a scheduler and a cache. It is never a gate: gates are the tasks themselves.

### 14.1 Task graph

| Task | Depends on | Cached | Outputs | Gate |
| --- | --- | --- | --- | --- |
| `build` | `^build` | ✓ | `dist/**`, `.next/**` | Per PR |
| `typecheck` | `^build` | ✓ | `*.tsbuildinfo` | Per PR — blocking |
| `lint` | — | ✓ | — | Per PR — blocking |
| `lint:arch` | — | ✓ | — | **Per PR — blocking (`NN-01/02/08/09`)** |
| `test:unit` | `^build` | ✓ | coverage | Per PR — blocking |
| `test:contract` | `^build` | ✓ | — | Per PR — blocking |
| `test:integration` | `^build`, `db:ready` | ✗ | — | Per PR — blocking |
| `test:rls` | `db:ready` | ✗ | — | **Per PR — blocking (`NN-04`)** |
| `test:adaptivity` | `^build`, `db:ready` | ✗ | — | **Per PR — blocking (`NN-01`)** |
| `eval:ai` | `^build` | ✗ | reports | **On AI-path change — blocking (`NN-02`)** |
| `bundle:check` | `build` | ✓ | budget report | Per PR — blocking (`NFR-052`) |
| `a11y` | `build` | ✓ | — | Per PR — blocking |
| `e2e` | `build` | ✗ | traces | Pre-release |

### 14.2 Cache policy

- **Anything touching a live database is uncached.** `test:rls`, `test:integration`, `test:adaptivity` produce no cacheable artifact and a cache hit on an authorisation test is a gate that did not run.
- **`eval:ai` is uncached** for the same reason plus one more: model non-determinism means a cached pass is not evidence of a current pass.
- **Remote cache is read-write for `main`, read-only for pull requests.** A PR that could write the shared cache is a supply-chain path into every subsequent build (`THR-12`).

### 14.3 Environment handling

`globalEnv` and per-task `env` are declared explicitly, never inherited wholesale. This is a correctness requirement (an undeclared variable silently changes a cached task's meaning) **and** a security one: a task that does not declare a worker-tier variable cannot read one, which reinforces `SEC-231` at the build layer.

`globalDependencies` includes `pnpm-lock.yaml`, `packages/config/**`, and `.nvmrc` — a change to any of them invalidates everything, because it can change everything.

---

## 15. TypeScript Project References

> **REPO-012 — Every package is a composite project, and the root `tsconfig.json` contains only references.** Project references are what turn `ENG-013` and `ENG-014` from a written rule into a compiler error: a package cannot import from a project it does not reference, and adding the reference is a visible, reviewable diff in a manifest.

```
tsconfig.json                    # Solution: references only. No files, no include.
└── extends per package:
    packages/config/typescript/base.json      # strict + all strictness flags (ENG-050)
      ├── library.json    composite, declaration, declarationMap, noEmit: false
      ├── node.json       library + Node lib, no DOM
      ├── next.json       library + DOM + JSX preserve
      └── expo.json       library + React Native types, no DOM
```

**`base.json` is non-negotiable and lives on a protected path.** It sets `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `isolatedModules`, and `verbatimModuleSyntax`. `ENG-051` and `ENG-052` forbid `any`, `as`, and `!` in domain code; the compiler settings are what make the lint rules enforcing that meaningful rather than decorative.

| Package | Extends | References |
| --- | --- | --- |
| `config` | — | — |
| `core` | `library.json` | `config` |
| `design-tokens` | `library.json` | — |
| `db` | `node.json` | `core`, `config` |
| `retrieval` | `node.json` | `core`, `db`, `config` |
| `jobs` | `node.json` | `core`, `db`, `config` |
| `adapters` | `node.json` | `core`, `config` |
| `ai` | `node.json` | `core`, `db`, `retrieval`, `config` |
| `domain` | `node.json` | `core`, `db`, `jobs`, `config` |
| `ui-web` | `next.json` | `core`, `design-tokens`, `config` |
| `ui-mobile` | `expo.json` | `core`, `design-tokens`, `config` |
| `apps/web` | `next.json` | `core`, `domain`, `db`, `ai`, `jobs`, `adapters`, `ui-web` |
| `apps/mobile` | `expo.json` | `core`, `domain`, `ui-mobile` |
| `apps/worker` | `node.json` | `core`, `domain`, `db`, `ai`, `jobs`, `retrieval`, `adapters` |

**`packages/core` extends `library.json`, not `node.json`.** It is compiled without Node or DOM libs, so a `fs` or `document` reference in `core` is a compile error rather than a runtime failure on a low-end Android device (`ENG-013`, `NFR-052`).

Path aliases are **not** used across packages. Cross-package imports use the package name, which is what makes an import boundary greppable and a dependency graph honest.

---

## 16. ESLint Organization

> **REPO-013 — Anything mechanically checkable is a lint rule, never a review comment** (`ENG-329`). A style debate in review is a lint rule that was never written, paid for at the most expensive rate available.

### 16.1 Layering

Flat config, composed from `packages/config/eslint/`. A package's `eslint.config.js` is a composition, never a rule list.

```
base.js            → TS strictness, import hygiene, complexity budgets, no-enum, no-any
  ├── react.js     → hooks rules, no business logic in components (ENG-100, ENG-106, ENG-107)
  ├── react-native.js
  └── node.js
architecture.js    → applied to EVERY package, always last, never overridden   [protected]
```

**`architecture.js` is applied last and no package may disable a rule it contains.** CI asserts this by re-running the architecture layer standalone against the whole tree, so a local `eslint.config.js` cannot narrow it. This is `NN-12` expressed as configuration: the guard is protected more strongly than the rule.

### 16.2 The architecture rule catalogue

`ENG-344` names the minimum set. This is that set, resolved to rules with owners.

| Rule | Enforces | Mechanism | Severity |
| --- | --- | --- | --- |
| `avora/no-fixed-hierarchy` | `NN-01` | Identifier, string-literal, and SQL deny-list from `ENG-028`; plus any enum whose members are structure labels | error |
| `avora/no-vendor-outside-adapters` | `NN-02`, `ENG-018` | Import specifier + **file path** allowlist: provider SDKs only under `packages/ai/adapters/**`, other vendors only under `packages/adapters/**` | error |
| `avora/no-glossary-synonym` | `ENG-021`, `ENG-027` | Identifier, path segment, and user-visible string catalogue checked against the canonical vocabulary | error |
| `avora/require-ai-label` | `NN-08` | A render of an `ai`-provenance type without `AIGeneratedBadge` in scope | error |
| `avora/citation-is-not-a-string` | `NN-11` | A `string`-typed field named or aliased as a citation, at any layer including DTOs, caches, exports, analytics | error |
| `avora/no-content-in-logger` | `NN-09` | Logger call sites accepting a content-carrying branded type | error |
| `avora/module-boundary` | `ENG-023`, `ENG-024` | Cross-module import resolving to anything but `<module>/index.ts` | error |
| `avora/package-dependency-direction` | `ENG-013`, `ENG-014` | The §18.1 matrix, checked against manifests and imports | error |
| `avora/no-prohibited-directory` | `ENG-017` | Path segments `utils`, `helpers`, `common`, `shared`, `misc`, `lib` | error |
| `avora/no-internal-barrel` | `ENG-022` | `index.ts` re-export outside a package root (UI primitives exempt) | error |
| `avora/no-hardcoded-design-value` | `ENG-124` | Colour, size, radius, duration, shadow, font literals outside `design-tokens/tier-1/` | error |
| `avora/tier-2-tokens-only` | `DESIGN-SYSTEM` | A tier-1 token reference from a component | error |
| `avora/env-tier` | `ENG-268`, `SEC-231` | Server/worker-tier variable referenced from client-reachable code | error |
| `avora/no-string-concat-into-prompt` | `NN-03`, `ENG-217` | Template literal or concatenation reaching a prompt or model-input parameter | error |
| `avora/no-offset-pagination` | `ENG-118` | `offset` / `skip` in a query contract | error |
| `avora/require-units-in-name` | `ENG-032` | Numeric fields for time, size, cost, or token budget without a unit suffix or branded type | warn → error at V0 freeze |
| `avora/no-enum` | `ENG-058` | TypeScript `enum` | error |
| `avora/owned-todo` | `ENG-047` | `TODO` without `(@owner, ISSUE)` | error |

**Each rule ships with its own test suite in `packages/config/eslint/rules/__tests__/`, containing at minimum one true positive and one true negative drawn from a real upstream example.** A guard without tests is a guard that will be silently broken by a refactor of the guard.

### 16.3 What is deliberately not a lint rule

Grounding fidelity, citation validity, RLS correctness, and structural adaptivity are **not** lint rules. They are test suites, because they are properties of behaviour rather than of source text. Attempting to lint them produces a rule that passes while the property fails — the worst possible outcome, because it retires the real gate.

---

## 17. Prettier Organization

One configuration, at `packages/config/prettier/`, applied to the entire repository including SQL, YAML, JSON, and Markdown. No package overrides it.

| Decision | Value | Rationale |
| --- | --- | --- |
| Scope | Formatting only | `REPO-013` — Prettier owns whitespace; ESLint owns semantics. An overlap is a fight in CI. |
| Overrides | None permitted | A per-package format is a per-package dialect. |
| Enforcement | `format:check` in CI, plus a pre-commit hook | The hook is convenience; CI is the gate (`ENG-343`). |
| Markdown | Included | `docs/` is the plan of record and is reviewed as source. |
| SQL | Included via plugin | `supabase/migrations/` and `policies/` are reviewed artifacts; a diff that is mostly reformatting is a diff that hides a policy change. |
| Generated files | `.prettierignore` | `packages/db/generated/`, lockfiles, build output. |

---

## 18. Dependency Rules and Import Boundaries

### 18.1 The dependency matrix

Rows may import columns. `ENGINEERING-RULES.md` §5.1 is the source; this is its complete form. **A cycle is a build failure, not a code smell.**

| ↓ imports → | config | core | tokens | db | retrieval | jobs | adapters | ai | domain | ui-web | ui-mobile |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **config** | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **core** | ✓ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **design-tokens** | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **db** | ✓ | ✓ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **retrieval** | ✓ | ✓ | ✗ | ✓ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **jobs** | ✓ | ✓ | ✗ | ✓ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ |
| **adapters** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ |
| **ai** | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | — | ✗ | ✗ | ✗ |
| **domain** | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | — | ✗ | ✗ |
| **ui-web** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ |
| **ui-mobile** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — |
| **apps/web** | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| **apps/mobile** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| **apps/worker** | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

**Three edges deserve their reason stated, because they will be argued:**

- **`domain` does not import `ai`.** The domain declares `OrchestrationPort` and `ModelPort` and the Gateway is invoked through them. A domain module importing `packages/ai` is how a feature module acquires a model name (`NN-02`).
- **`apps/mobile` reaches nothing but `core`, `domain` types, and `ui-mobile`.** A client that can reach `db`, `ai`, or `adapters` is a client that can hold a credential (`SEC-005`).
- **`ui-web` and `ui-mobile` never import each other.** They are two implementations of one specification, not a shared abstraction (`Rule HO-02`, `ENG-014`).

### 18.2 Enforcement, in three independent layers

| Layer | Catches | When |
| --- | --- | --- |
| Manifest — `workspace:*` declarations checked against the matrix | A forbidden edge before any code exists | `deps:check`, per PR |
| Compiler — TypeScript project references | An import into an unreferenced project | `typecheck`, per PR |
| Lint — `avora/package-dependency-direction` | A deep import that dodges the package entry point | `lint:arch`, per PR |

Three layers because each fails differently: a manifest can be edited, a reference can be added, a lint rule can be misconfigured. All three failing silently at once is the only way a forbidden edge lands.

### 18.3 External dependency rules

| Rule | Source |
| --- | --- |
| A new dependency requires explicit human approval, recorded in the PR with the `ENG-366` ten-dimension evaluation | `ENG-404`, `ENG-366` |
| A higher bar applies to `packages/core`, domain code, and anything reaching a client bundle | `ENG-365` |
| A dependency that transmits data off-device is a **processor**: it goes behind a port, enters the data inventory and the deletion cascade | `ENG-367`, `SEC-511`, `SEC-007` |
| A version bump that changes maintainer, ownership, or install-time behaviour is reviewed as a supply-chain event | `SEC-501` |
| Install scripts disabled by default; allowlist entries carry a recorded justification and an owner | `SEC-502` |
| Lockfile committed, exact, `--frozen-lockfile` in CI | `SEC-500`, `ENG-361` |
| SBOM generated per release; release artifacts traceable to commit and pipeline | `SEC-540`, `SEC-541` |

---

## 19. GitHub Actions Layout

> **REPO-014 — One workflow per gate class, not one workflow per pipeline.** A monolithic `ci.yml` makes a gate's ownership unclear and its failure hard to attribute — and `ENG-343` requires that a blocking gate never be quietly made advisory. Separate files mean a weakened gate is a visible diff in an owned file.

```
.github/workflows/
├── pr-validate.yml          # typecheck · lint · lint:arch · test:unit · test:contract
├── pr-database.yml          # migration expand/contract · lock analysis · rollback plan ·
│                            #   RLS negative-authorisation suite · policy tests
├── pr-adaptivity.yml        # AD-41 — ALWAYS runs, never path-filtered
├── pr-ai-eval.yml           # grounding · citation validity (100%) · refusal · assessment
├── pr-client.yml            # bundle budget · accessibility · Lighthouse
├── pr-preview.yml           # Vercel preview + synthetic seed (ENG-345)
├── security.yml             # secret scan (full history) · dependency scan · CodeQL · SBOM
├── release-web.yml          # progressive rollout, auto-rollback on regression
├── release-worker.yml       # image build, digest pin, provenance attestation
├── release-mobile.yml       # EAS · staged rollout · device matrix gate
├── nightly.yml              # e2e flows · drift check · dependency freshness
├── pre-release.yml          # load · device matrix · full e2e
├── freeze-check.yml         # AD-34 — reads .github/freeze-calendar.yml
└── reusable/
    ├── setup.yml            # Corepack, pnpm, cache, frozen install
    └── ephemeral-db.yml     # Supabase branch or container + migrations + synthetic seed
```

### 19.1 Gate-to-requirement mapping

| Workflow | Gate | Blocking on | Traces to |
| --- | --- | --- | --- |
| `pr-validate` | Types, lint, architecture lint, unit, contract | Every PR | `ENG-344`, `architecture.md` §33.2 |
| `pr-database` | RLS negative-authorisation suite | Every PR touching `supabase/**` **or adding any table** | `NN-04`, `ENG-175`, §42.1 |
| `pr-database` | Expand/contract compliance, lock analysis, rollback plan present | Every PR touching `migrations/` | `ENG-179`, `ENG-180`, §33.2 step 3 |
| `pr-adaptivity` | `AD-41` structural adaptivity | **Every PR, unconditionally** | `NN-01`, `ENG-341`, §42.2 |
| `pr-ai-eval` | Citation validity **100%**; grounding, refusal, assessment thresholds | Any change under `packages/ai/**`, `packages/retrieval/**`, `evals/**` | `NN-02`, `ENG-218`, §42.3 |
| `pr-client` | Bundle budget, accessibility | Every PR touching a client | `NFR-052`, `ENG-293` |
| `security` | Secret scan across **full history**, on every branch reaching CI | Every PR + scheduled | `SEC-242`, `ENG-270` |
| `security` | Dependency scan; unresolved critical blocks release | Every PR + scheduled | `SEC-500`, `ENG-363` |
| `freeze-check` | Examination-window deployment freeze | Every release | `AD-34`, `ENG-348` |
| `release-mobile` | Low-end device matrix before store submission | Every mobile release | `NFR-052`, `ENG-349` |

**`pr-adaptivity.yml` is never path-filtered.** Path filtering it would mean the suite runs only when someone already believed they were touching structure — which excludes precisely the change that violates `NN-01` by accident. `ENG-341` forbids skipping it; running it unconditionally is the mechanical form of that.

### 19.2 Workflow hardening

| Control | Requirement |
| --- | --- |
| Action pinning | Every action by **commit SHA**, never tag or branch (`SEC-503`) |
| Permissions | `permissions: {}` at workflow level; least privilege per job |
| Fork PRs | No secrets. `pull_request_target` is prohibited outright. |
| Runners | Base images pinned by digest; reviewed on change (`SEC-503`) |
| Environment secrets | Per-environment provider keys; non-production never holds a production key (`SEC-252`) |
| Provenance | Release artifacts attested and traceable to commit and pipeline (`SEC-541`) |
| Ephemeral data | Synthetic seed only. **Production data is never copied to CI** (`ENG-342`). |

---

## 20. Branch Protection Expectations

`main` is always releasable (`ENG-322`). Trunk-based, short-lived branches, merged behind flags when incomplete (`ENG-320`).

| Setting | Value | Source |
| --- | --- | --- |
| Direct pushes to `main` | Blocked, including administrators | `ENG-322` |
| Required approvals | 1 baseline · **2 on any protected path**, one from a non-author | `ENG-004`, `ENG-322` |
| CODEOWNERS review | Required, and stale approvals dismissed on new commits | `REPO-004` |
| Required status checks | `pr-validate`, `pr-adaptivity`, `security`, plus path-triggered `pr-database` / `pr-ai-eval` / `pr-client` | `ENG-343` |
| Linear history | Required — squash merge only | `ENG-325` |
| Force push / branch deletion | Blocked | `ENG-323` |
| Signed commits | Required | `SEC-541` |
| Conversation resolution | Required before merge | `ENG-329` |
| Merge queue | Enabled, with the full required set re-run | `main` is always releasable, not usually releasable |

### 20.1 Protected paths

`ENG-322` names them. Each requires a second approver who did not write the code (`ENG-004`):

```
supabase/migrations/**        supabase/policies/**
packages/design-tokens/**     packages/ai/prompts/**     packages/ai/gateway/routing/**
packages/config/**            .github/**                 turbo.json
tsconfig.json                 package.json               pnpm-workspace.yaml
.npmrc                        .env.example
AGENTS.md                     CLAUDE.md                  docs/**
… and any file implementing an NN-## guard
```

**"Any file implementing an `NN-##` guard" is resolved to concrete paths in `.github/CODEOWNERS`** rather than left to judgement, because a guard nobody recognised as a guard is a guard with one approver. The current resolution: `packages/config/eslint/architecture.js`, `packages/config/eslint/rules/**`, `packages/db/rls/harness/**`, `e2e/adaptivity/**`, `evals/suites/citation-validity/**`, `packages/ai/gateway/envelope/**`, `packages/core/observability/**`.

---

## 21. Code Ownership Philosophy

> **REPO-015 — Ownership is assigned to the team that carries the consequence of the code being wrong, not the team that writes it most often.**

| Principle | Consequence in `CODEOWNERS` |
| --- | --- |
| Every path has an owner (`REPO-004`) | CI asserts full coverage. An uncovered path fails the build. |
| Enforcement mechanisms are owned by the team that would be harmed if they were removed | `@avora/security` co-owns every `NN-##` guard, even those it did not write. |
| Ownership is a review obligation, not a permission | An owner cannot approve their own change on a protected path (`ENG-004`). |
| The document owner owns the code that implements it | `@avora/design-system` owns `packages/ui-*` because `DESIGN-SYSTEM.md` is canonical for anything visual. |
| Shared paths have two owners, not a committee | `supabase/policies/**` → `@avora/data` + `@avora/security`. Two names, both accountable. |

**Ownership and the module README are the same claim in two places** (`ENG-011`): the README names the owner for a human or agent reading locally; `CODEOWNERS` enforces it at merge time. A disagreement between them is a defect fixed in the PR that found it (`ENG-337`).

---

## 22. Environment Variable Strategy

`ENG-267`–`ENG-269`, `architecture.md` §36.3, and `SEC-230`–`SEC-232` are canonical. This is their repository realisation.

### 22.1 The three trust tiers

| Tier | Name | Physical location | May be read from | Prefix |
| --- | --- | --- | --- | --- |
| **1** | Client-public | Bundled into web and mobile artifacts | Anywhere | `NEXT_PUBLIC_` / `EXPO_PUBLIC_` — **mandatory** |
| **2** | Server | Vercel encrypted environment | `apps/web` server runtime, `packages/adapters` | none |
| **3** | Worker | Worker secret store | `apps/worker`, `packages/adapters` **only** | none |

**Tier 3 holds the service role and every provider key.** A tier-3 value referenced from any path outside `apps/worker/**` or `packages/adapters/**` fails CI (`SEC-231`). This is the single highest-severity exposure available in this architecture (`ENG-268`), so it gets a dedicated assertion rather than sharing one.

### 22.2 Declaration

Every variable is declared once, in `packages/config/env/`, with **tier, owner, requiredness, and description**. There is no other declaration site, and no code reads `process.env` directly — `avora/env-tier` fails on a raw access outside `packages/config/env/**`.

```
packages/config/env/
├── schema.contract.ts   # { name, tier, owner, required, description } for every variable
├── client.env.ts        # Tier 1 — parsed and frozen at module load
├── server.env.ts        # Tier 2
├── worker.env.ts        # Tier 3
└── __tests__/           # Asserts: every variable has a tier and an owner;
                         #   every tier-1 variable carries a public prefix;
                         #   .env.example matches the schema exactly
```

**Configuration is validated at boot and fails startup loudly** (`ENG-264`, `SEC-232`). A security-relevant value never has a permissive default: a missing rate limit does not default to unlimited, and a missing allowlist does not default to permit. `env:check` runs in CI and asserts `.env.example` is in sync — a variable added without an example entry fails the build, because the undeclared variable that works on one machine and is absent in production is exactly what `ENG-267` exists to prevent.

### 22.3 The `.env` file family

| File | Committed | Contents |
| --- | --- | --- |
| `.env.example` | ✓ | **Names and tiers only.** Never values. Never realistic-looking placeholders (`SEC-230`). |
| `.env.local`, `.env.*`, `*.env` | ✗ | Git-ignored at root and in every package. CI asserts none is tracked. |

`ENG-265` places tunable thresholds here too, not in code: classification ask-versus-assume, extraction confidence, retrieval score thresholds, per-task token budgets, review-load defaults, structure depth limits. Each declares its owner, its default, and — where it depends on an open question — a link to that question (`ENG-410`).

---

## 23. Secret Management Locations

> **REPO-016 — The repository holds no secret, and holds the complete list of every secret it does not hold.** The schema in `packages/config/env/` names every credential; the values live only in the stores below.

| Credential class | Tier | Store | Reachable from | Routine rotation |
| --- | --- | --- | --- | --- |
| Supabase service role | 3 | Worker secret store | `apps/worker` only | 90 days |
| Model / OCR / embedding provider keys | 3 | Worker secret store | `packages/ai/adapters/**` only | 180 days |
| Payment + PSP credentials | 3 | Worker secret store | `packages/adapters/{stripe,psp}` | Per provider, min. annually |
| Webhook signing secrets | 2 | Vercel encrypted env | Webhook route handlers | 180 days |
| Mail (Resend) | 2/3 | Per calling runtime | `packages/adapters/resend` | Per provider |
| CI / deployment credentials | — | GitHub environment secrets | Workflow jobs, least privilege | 90 days |
| Content encryption keys | 3 | Key management service | Worker plane | Not rotated; destroyed on deletion (`SEC-132`) |
| Client-publishable keys | 1 | `.env` / build config | Anywhere | On provider advisory |

*Rotation cadences are `SEC-241`'s `[RECOMMENDED]` schedule, registered upstream as `SOQ-06`. They are reproduced here as the operational default and are not decided by this document.*

**Repository-side controls:**

| Control | Where |
| --- | --- |
| Secret scanning across **full git history**, every branch reaching CI | `security.yml` (`SEC-242`) |
| Pre-commit secret scan | `.githooks/` — convenience layer; CI is the gate |
| A committed secret triggers rotation **regardless of any assessment that it was not exposed** | `docs/runbooks/secret-rotation.md` (`SEC-241`, `ENG-270`) |
| Per-environment provider keys; non-production never holds a production key | GitHub environments (`SEC-252`) |
| Never on a command line, never baked into an image, never in a file outliving the process | `apps/worker/Dockerfile` review (`SEC-240`) |

---

## 24. Naming Conventions

### 24.1 Package naming

| Rule | Example |
| --- | --- |
| Scope `@avora/`, always | `@avora/retrieval` |
| kebab-case, and **identical to the directory name** | `packages/design-tokens` → `@avora/design-tokens` |
| Named for the concept it owns, never for its technology or its consumer | `@avora/retrieval`, never `@avora/vector-utils` or `@avora/web-shared` |
| No `-utils`, `-helpers`, `-common`, `-shared`, `-lib`, `-misc` suffix | `ENG-017` applies to package names as it does to directories |
| `"private": true`, no `version` | Nothing is published (`REPO-003`) |

### 24.2 Folder naming

| Rule | Source |
| --- | --- |
| kebab-case everywhere | Consistency; case-insensitive filesystems |
| Inside `packages/domain`, the top level is the PRD's vocabulary | `ENG-015` |
| Inside a module, the folder set is closed: `contracts/ services/ repositories/ events/ jobs/ policies/ __tests__/`, plus `ports/` **pending `GAP-02`** | `ENG-016`; `ports/` not yet in the rule — the lint rule ships with `ports/` allowed and a `GAP-02` reference, and the reference is removed when the amendment merges |
| A module may add a **module-specific** folder; never a generic one | `ENG-016` exception |
| `utils/ helpers/ common/ shared/ misc/ lib/` prohibited anywhere | `ENG-017` |
| A vendor name appears in a path only under an adapter directory | `ENG-018` |
| Folder names use the glossary, never a synonym | `ENG-021`, `ENG-027` |

### 24.3 File naming

`ENGINEERING-RULES.md` §7's table is binding and is not reproduced. Two repository-level additions:

> **REPO-017 — A file's path alone must be sufficient to infer its layer, its module, and its owner.** This is the filesystem form of `AG-10`. `packages/domain/recall/services/review-session.service.ts` states all three without being opened.

> **REPO-018 — Generated files carry a `generated/` path segment and a header banner, and are never hand-edited.** `packages/db/generated/**` is the only current instance. CI regenerates and fails on a diff, so schema and types can never disagree silently.

### 24.4 Branch and commit naming

| Artefact | Convention | Source |
| --- | --- | --- |
| Branch | `<type>/<identifier>-<slug>` — `feat/FR-039-classification-correction` | `ENG-321` |
| Commit | Conventional Commits, imperative, requirement identifier in the body (`Refs:`) | `ENG-324` |
| Commit scope | The module or package name from §5 | `ENG-324` |
| PR title | Mirrors the commit subject; squash merge preserves it | `ENG-325` |

Branch naming is validated in CI, not by convention. `ENG-321`'s stated benefit — that the identifier is decided *before* the work starts rather than retrofitted at review — only holds if the branch cannot be created without one.

---

## 25. Testing Organization

`ENG-019` fixes the placement rule: tests live beside the code they test, in `__tests__/`, with cross-cutting suites at the top level. `architecture.md` §42.1 fixes the layers. This is where each layer physically lives.

| Layer | Location | Runner task | Gate |
| --- | --- | --- | --- |
| Unit — domain invariants, state machines, scheduling, scoring, scope resolution | `<package>/**/__tests__/` | `test:unit` | Every PR |
| **RLS negative-authorisation** | `packages/db/rls/__tests__/` + harness in `packages/db/rls/harness/` | `test:rls` | **Every PR — a table without them fails the build** |
| Integration — API contracts, job state machines, pipelines | `<package>/__tests__/integration/` | `test:integration` | Every PR |
| Contract — client/server type parity across web, mobile, worker | `packages/core/__tests__/contract/` | `test:contract` | Every PR |
| **Structural adaptivity (`AD-41`)** | `e2e/adaptivity/` | `test:adaptivity` | **Every PR, unconditionally** |
| **AI evaluation** | `evals/suites/` | `eval:ai` | **Every prompt / routing / retrieval change** |
| End to end — critical flows | `e2e/flows/` | `e2e` | Pre-release |
| Device matrix | `release-mobile.yml` → Firebase Test Lab, TestFlight | — | Pre-release (`NFR-052`) |
| Load — exam-period simulation | `e2e/load/` | — | Pre-release and pre-exam-window |
| Accessibility | Automated on primitives in `packages/ui-*/__tests__/`; manual on surfaces | `a11y` | Every PR + pre-release |
| Security | `security.yml` | — | Continuous (`NFR-037`) |

### 25.1 Placement rules

> **REPO-019 — The RLS harness lives in `packages/db`, not in each module.** A per-module harness is a per-module interpretation of what "negative authorisation" means, and `NN-04` cannot survive sixteen interpretations. One harness, one definition, sixteen call sites.

> **REPO-020 — `e2e/adaptivity/` is owned by `@avora/architecture`, not by `@avora/qa`.** It is the regression guard on `D-01`, the product's central claim — and `architecture.md` §42.2 names it as the suite most likely to catch a well-intentioned coding agent going wrong. Its scope is an architectural property, so narrowing it is an architectural change.

### 25.2 Fixtures

Fixtures are `<name>.fixture.ts`, colocated with the suite that uses them; shared synthetic corpora live in `e2e/fixtures/`. `ENG-067` requires them to represent the diversity of the target market rather than the author's convenience. The repository makes this checkable: **the shared fixture set must always contain a subject with no structure and a subject with a student-authored label such as "Experiment 7"**, asserted by a test in `e2e/fixtures/__tests__/`. A fixture set that drifts toward the tidy case is how the `AD-41` suite keeps passing while the property it guards decays.

**Production data is never copied anywhere** (`ENG-342`). Every environment below production is seeded from `supabase/seed/synthetic/`.

---

## 26. Repository Governance

### 26.1 Change classes

Not every change carries the same weight. The class determines the review path.

| Class | Examples | Path |
| --- | --- | --- |
| **Routine** | Feature work inside an owned module | 1 approval + required checks |
| **Protected** | Migration, policy, token, prompt, routing, config, CI, any `NN-##` guard | 2 approvals, one non-author (`ENG-004`) |
| **Structural** | New package, new top-level directory, new port, new domain module, a change to §18.1 | `architecture.md` amendment merged **first** (`ENG-010`, `ENG-334`), then the code |
| **Constitutional** | A change to a `NN-##` invariant or an upstream document's binding rule | Owner of that document + `@avora/architecture` + `@avora/security` |
| **Blocked** | Anything requiring an open question to be decided | Escalate. Never decide it in an implementation detail (`ENG-410`). |

### 26.2 The amendment procedure

`ENG-010` makes a new top-level directory an architectural change; `ENG-026` makes a new port one; `ENG-015` makes a new domain module one. The procedure is the same for all three:

1. Open an ADR in `docs/adr/` stating context, decision, consequences, and rejected alternatives (`ENG-335`).
2. Amend `architecture.md` §32 (or §5.3, or the port list) in the same pull request.
3. Merge the documentation **before** the code that implements it (`ENG-334`, `EP-09`).
4. Update this document's §2 tree and §18.1 matrix in the same pass.
5. Only then, create the directory.

### 26.3 Waivers

Waivers follow `ENG-007`: written, owned, dated, expiring, and recorded. They are filed as `.github/ISSUE_TEMPLATE/waiver.yml` issues so they are visible, countable, and expire in the open.

**No waiver exists for any `NN-##` invariant.** `NN-12` is explicit: a rule in §4 is never disabled to make a test, a build, or a deadline pass. The repository provides no mechanism to do so — there is no skip flag, no advisory mode, and no environment variable that downgrades a blocking gate. This absence is deliberate and is itself a protected property.

### 26.4 Drift control

| Drift | Detection | Cadence |
| --- | --- | --- |
| Generated types vs schema | `db:diff` regenerates and fails on a change | Every PR |
| `.env.example` vs env schema | `env:check` | Every PR |
| CODEOWNERS path coverage | `deps:check` coverage assertion | Every PR |
| Module README vs `CODEOWNERS` owner | `nightly.yml` | Nightly |
| Dependency version drift across the workspace | `syncpack` | Every PR |
| This document vs the actual tree | `nightly.yml` tree comparison against §2 | Nightly |
| Documentation drift generally | Fixed in the PR that found it (`ENG-337`) | Continuous |

The last one is the reason the nightly tree comparison exists: `AD-33`'s entire rationale is that the tree is *the one place an agent must look to understand the system*. A tree that has silently diverged from its specification is worse than no specification, because it is trusted.

---

## 27. Amendments, Gaps and Open Questions

### 27.1 Amendments required before `git init`

Each requires `@avora/architecture` approval and the upstream amendment merged first (`ENG-334`). `AMD-01`, `AMD-02` and `AMD-04` amend `architecture.md` §32 under `ENG-010` (top-level directories). `AMD-03` amends §32's package list under `ENGINEERING-RULES.md` §5's preamble — *"the layout in `architecture.md` §32 is canonical"* — and additionally amends `architecture.md` §47.1 rule 1 and `ENGINEERING-RULES.md` §73 rule 4.

| ID | Amendment | Justification | If rejected |
| --- | --- | --- | --- |
| **AMD-01** | Add `.github/` to §32 | Forge-imposed. CI, `CODEOWNERS`, templates and the freeze calendar have no alternative location, and `ENG-322` already names "CI configuration" as a protected path — implying its existence without placing it. | No viable alternative. Rejection blocks CI entirely. |
| **AMD-02** ~~Add `.changeset/` to §32~~ | **Withdrawn.** Changesets operates on `package.json` `version` fields, which `REPO-003` forbids; the tool cannot perform its function under this repository's own rules. The machine-readable intent record it was wanted for is supplied by `ENG-321` branch identifiers and the required requirement-identifier field in `ENG-326`'s pull-request template. | N/A — withdrawn, not rejected on merit. |
| **AMD-03** | Add `packages/adapters/` to §32 | See `GAP-01`. `MailPort`, `BillingPort`, `PaymentCollectionPort`, `AuthPort`, `BlobStorePort` and `RealtimePort` are named in `ENG-026` but have no home in §32's package list. | Alternative: distribute them into `packages/db` (Supabase family) and a new `packages/billing-edge`. Worse — it fragments the "vendor names live in one greppable prefix" property that `ENG-018` and CI both rely on. |
| **AMD-04** | Add `e2e/` to §32 and bind `ENG-019`'s exception | `ENG-019` is `[RECOMMENDED]` and does not yet bind, so its exception cannot authorise a top-level directory against `ENG-010`. This is a new decision, and it also fixes `ENG-019`'s reference to an `AD-41` placement §32 does not currently make. | Cross-cutting suites collapse into `__tests__/`, which is unworkable for `AD-41` and exam-period load simulation. Rejection would require a separate home and a separate amendment. |

### 27.2 Gaps reported upstream

Per `ENG-411` and `AGENTS.md` §21: reported, **not resolved here**.

| ID | Gap | Affects | Owner |
| --- | --- | --- | --- |
| **GAP-01** | `architecture.md` §32 defines the vendor edge only for AI providers (`packages/ai/adapters/`). Six of `ENG-026`'s thirteen ports — `AuthPort`, `BlobStorePort`, `RealtimePort`, `MailPort`, `BillingPort`, `PaymentCollectionPort` — declare capabilities whose **adapters** have no location. The ports themselves are correctly placed with their declaring modules (§5.3). `ENG-018` says "adapters live at the edge" without defining the edge for anything that is not a model provider, and `architecture.md` §47.1 rule 1 actively forbids the only location that would work. | `AMD-03`; `packages/adapters` cannot be created until resolved. Also requires amending `architecture.md` §47.1 rule 1 and `ENGINEERING-RULES.md` §73 rule 4. | `@avora/architecture` |
| **GAP-02** | `ENG-016` closes the module folder set to seven names, none of which is `ports/` — yet `ENG-018` requires ports to live with the domain. The two rules are jointly unsatisfiable for a module-owned port. | `packages/domain/<module>/ports/` | `@avora/architecture` |
| **GAP-03** | Two upstream documents conflict, not merely under-specify. `architecture.md` §32 annotates `packages/db` as owning *"repositories"*; `ENG-016` gives every domain module a `repositories/` folder. Both cannot be the sole home. Separately, §32 lists `migrations` under both `packages/db/` and `supabase/migrations/`. This document does not choose (`ENG-411`): it names the seam it believes is intended — `packages/db` owns the mechanism, `domain/<module>/repositories/` owns the queries, `supabase/migrations/` owns the SQL — and blocks on confirmation. (The `domain ──► db` dependency graph is `ENGINEERING-RULES.md` §5.1, not `architecture.md` §5.1.) | `packages/db` scope; §29 steps 10–11 | `@avora/data` with `@avora/architecture` |
| **GAP-04** *(clarification — non-blocking)* | Layer-3 placement is derivable but never stated: `architecture.md` §32 describes `ui-web`/`ui-mobile` as primitives + domain components (layers 1–2 only), and `ENG-033` permits layer 3 to import routing, which exists only in `apps/*`. This document places surface compositions in the apps, which follows from both. Requested: one sentence in §32.1 making the layer-to-package mapping explicit. | `apps/*`, `packages/ui-*` — no structural consequence | `@avora/architecture` |

### 27.3 Open questions this repository is built to absorb

None of these is decided here. Each has a seam, a configuration default, and an owner (`ENG-410`, `ENG-265`).

| Question | Repository seam | Nothing is pre-decided because… |
| --- | --- | --- |
| `AOQ-01` Antigravity capability surface | `packages/ai/ports/OrchestrationPort.ts` + `packages/ai/adapters/antigravity/` | The port is Avora's; the adapter absorbs whatever the answer turns out to be. A parity test with the adapter disabled runs in staging (`AD-16`). |
| `AOQ-02` Expo vs wrapped PWA | `apps/mobile/` boundary and dependency edges are identical either way | Only `app/` contents and `eas.json` change on resolution. |
| `AOQ-03` Payment provider | `packages/adapters/stripe/` + `packages/adapters/psp/` behind two ports | Entitlement and collection are separated at the port level, so either can be swapped alone. |
| `AOQ-04` Free-tier limit unit | `packages/config/env/` threshold declaration | The metering subsystem is unit-agnostic; the repository holds a configured default with an owner, not a constant. |
| `AOQ-05` Data residency | Deployment configuration, not repository structure | No path or package encodes a region. |
| `AOQ-06` Eval payload retention | `evals/corpora/MANIFEST.md` | The corpus is fetched, never committed (`REPO-008`), so the window is an operational setting rather than a git property. |
| `AOQ-07` FSRS vs SM-2 | `packages/domain/recall/ports/SchedulerPort.ts` | Scheduler is a port; `recall/scheduling/` is the module-specific folder `ENG-016` permits. |
| `SOQ-06` Rotation cadence | §23's table, marked as the upstream `[RECOMMENDED]` default | Reproduced, not decided. |
| `SOQ-12` Install-script allowlist | `.npmrc` `onlyBuiltDependencies` with recorded owners | Default is deny (`SEC-502`). |

---

## 28. Traceability

`NN-10` requires every shipped capability to trace to a requirement identifier. That obligation applies to this document's own decisions.

| Decision | Traces to |
| --- | --- |
| `REPO-001` Correct-by-default structure | `architecture.md` §7.4, `AG-10`, `EP-07` |
| `REPO-002` Closed top-level set | `ENG-010`, `AD-33` |
| `REPO-003` Nothing is published | `AD-33` (one repository, one release surface) |
| `REPO-004` CODEOWNERS full coverage | `ENG-011`, `NFR-063` |
| `REPO-005` `apps/` closed at three | `AD-01`, `architecture.md` §32 |
| `REPO-006` `AOQ-02`-neutral mobile boundary | `AOQ-02`, `ENG-410` |
| `REPO-007` Module index is the only entry point | `ENG-023`, `architecture.md` §5.3 |
| `REPO-008` Eval corpora fetched, never committed | `AD-21`, `SEC-007`, `ENG-270`, `AOQ-06` |
| `REPO-009` Root has no runtime dependencies | `ENG-365`, `ENG-404` |
| `REPO-010` Workspace version drift fails CI | `ENG-053`, `SEC-500` |
| `REPO-011` Turbo schedules, never gates | `ENG-343`, `ENG-346` |
| `REPO-012` Composite projects and references | `ENG-013`, `ENG-014`, `ENG-050` |
| `REPO-013` Checkable ⇒ lint, not review | `ENG-329`, `ENG-001` |
| `REPO-014` One workflow per gate class | `ENG-343`, `NN-12` |
| `REPO-015` Ownership follows consequence | `ENG-004`, `ENG-011` |
| `REPO-016` Repository holds the list, never the values | `ENG-267`, `ENG-270`, `SEC-230` |
| `REPO-017` Path implies layer, module, owner | `AG-10`, `ENG-020`, `EP-07` |
| `REPO-018` Generated files banner-marked and drift-checked | `ENG-053`, `ENG-165` |
| `REPO-019` One RLS harness | `NN-04`, `ENG-175` |
| `REPO-020` Adaptivity suite architecturally owned | `AD-41`, `NN-01`, `ENG-341` |

### 28.1 Invariant → structural enforcement

Where each of the twelve non-negotiables is defended by the *repository* rather than by discipline. This is the table to check when someone proposes a structural change: if a row loses its mechanism, the invariant loses its guard.

| Invariant | Structural mechanism |
| --- | --- |
| `NN-01` No fixed hierarchy | `avora/no-fixed-hierarchy` lint on identifiers, strings, SQL · `e2e/adaptivity/` unconditional per PR · `supabase/seed/adaptivity/` · glossary lint on paths |
| `NN-02` Gateway-only model access | `packages/ai/adapters/` as the sole *model-provider* path · dependency matrix denies `domain → ai` · `avora/no-vendor-outside-adapters` |
| `NN-03` Content is never instruction | `packages/ai/gateway/envelope/` has no string-concatenation API · `avora/no-string-concat-into-prompt` |
| `NN-04` No authorisation by identifier | `supabase/policies/<table>.policy.sql` one-per-table · `packages/db/rls/` harness · `pr-database.yml` blocking |
| `NN-05` Nothing blocks the student | `packages/jobs` as the only enqueue path · latency budgets in `pr-validate` |
| `NN-06` No student content destroyed | Repository layer exposes no overwrite method for `student`/`co_created` provenance |
| `NN-07` No loss across restructure | `e2e/adaptivity/` restructure cases · schema constraints in `supabase/` |
| `NN-08` AI content always labelled | `avora/require-ai-label` · `packages/ui-*/components/` contract |
| `NN-09` No student content in logs | `packages/core/observability/` typed logger · `avora/no-content-in-logger` |
| `NN-10` Everything traces | Branch-name validation · PR template · module `README.md` · `CODEOWNERS` |
| `NN-11` Citation is a foreign key | `packages/core/domain-types/` has no free-text citation type · `avora/citation-is-not-a-string` |
| `NN-12` Gates are never disabled | Protected paths + second approver · `architecture.js` re-run standalone · no skip mechanism exists |

---

## 29. Initialization Sequence

The order matters: each step makes the next step's mistakes impossible rather than merely detectable.

| # | Step | Why this order |
| --- | --- | --- |
| 1 | Merge `AMD-01`, `AMD-03`, `AMD-04` (record `AMD-02`'s outcome) and resolve `GAP-01`, `GAP-02`, `GAP-03` | `ENG-010`, `ENG-334`. Directories that require an amendment cannot be created before it. `GAP-01` blocks `packages/adapters` (step 10); `GAP-02` blocks the module shape (step 11); `GAP-03` blocks both, since steps 10 and 11 file repository code on either side of an unconfirmed seam. |
| 2 | `git init`; commit `docs/`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `LICENSE` | The constitution precedes the code. The first commit is the plan of record. |
| 3 | `.gitignore`, `.gitattributes`, `.npmrc`, `.nvmrc`, `.env.example` | The `.env` family is ignored **before** any environment work begins (`SEC-230`). |
| 4 | `packages/config` — tsconfig, eslint base, prettier, env schema, **including `architecture.js` and its rule tests** | The guards exist before the code they guard. A rule added later never runs against what preceded it. |
| 5 | Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, solution `tsconfig.json` | The build graph exists before there is anything to build. |
| 6 | `.github/` — `CODEOWNERS`, templates, `pr-validate.yml`, `security.yml`, branch protection | Protection is configured before the first feature branch, not after the first incident. |
| 7 | `packages/core` — branded ids, error contract, observability types | Everything references it; nothing it references exists yet, by design (`ENG-013`). |
| 8 | `packages/design-tokens`, then `packages/ui-web` / `ui-mobile` shells | Tokens before components, so no component is ever authored against a literal. |
| 9 | `supabase/` — `config.toml`, the RLS harness in `packages/db/rls/harness/`, `seed/adaptivity/` | The negative-authorisation harness exists before the first table, so `ENG-175` is satisfiable from table one. |
| 10 | `packages/db`, `jobs`, `retrieval`, `adapters`, `ai` shells with ports and READMEs | Ports before adapters; adapters before any vendor package is installed. |
| 11 | `packages/domain` — sixteen module directories, each with `index.ts` and `README.md` | The empty README naming zero requirements is a visible defect; the missing directory is not. |
| 12 | `apps/web`, `apps/mobile`, `apps/worker` shells | Composition roots last. They can only wire what exists. |
| 13 | `e2e/adaptivity/` with the `AD-41` cases against seeded fixtures | It must pass on an empty repository, or it will never be trusted on a full one. |
| 14 | `evals/suites/` with the citation-validity gate wired to fail closed | A gate wired after the first AI code is a gate that inherited a baseline. |
| 15 | Enable required status checks; verify a deliberately-violating PR **fails** | `NN-12`. An untested gate is an assumption. Each of the twelve mechanisms in §28.1 gets one adversarial commit proving it blocks. |

> **Step 15 is not optional and not ceremonial.** Every mechanism in §28.1 is a claim that something is impossible. A claim that has never been tested is a claim, not a guarantee — and `architecture.md` §42.2 already identifies the failure mode: a well-intentioned agent going wrong in a way the suite was supposed to catch.

---

## Document Governance

| Field | Value |
| --- | --- |
| Owner | `@avora/architecture` |
| Authority | Below `PRD.md` → `architecture.md` → `ENGINEERING-RULES.md` / `SECURITY.md` → `DESIGN-SYSTEM.md`; above nothing |
| Review cadence | On every `AMD-##`; on every §32 amendment; quarterly otherwise |
| Amendment path | ADR in `docs/adr/` → amendment to every upstream clause the change touches (§32, and where applicable §32.1, §47.1, and the corresponding `ENG-##`) → this document → implementation (`ENG-334`) |
| Drift detection | `nightly.yml` compares the live tree against §2 |
| Conflict rule | An upstream document wins and this document has a defect. Report it; never resolve it locally (`ENG-411`, `ENG-336`). |
