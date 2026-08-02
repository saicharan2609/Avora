# Avora — Engineering Rules & Development Standards

**Document type:** Engineering Standards Specification
**Version:** 1.0
**Status:** Draft
**Owner:** Founding Software Architect / Engineering Standards Author
**Audience:** Software, Frontend, Backend, Mobile, AI, DevOps, QA and Product Engineers; AI coding agents (Claude Code, Cursor, GitHub Copilot, Codex, and successors); future employees
**Canonical path:** `docs/ENGINEERING-RULES.md`

**Dependencies (immutable upstream sources):**

| Source | Role | Precedence |
| --- | --- | --- |
| `docs/PRD.md` — Product Requirements Document v1.0 | Defines *what* Avora is. Owns every `FR-###`, `NFR-###`, `AIR-###`, `RAI-##`, `PR-##`, `BM-##`, `D-##`, `R-##`, `NG-##`, `OQ-##` identifier. | 1 — never contradicted |
| `docs/architecture.md` — Engineering Architecture v1.0 | Defines *how the system is built*. Owns every `AD-##`, `AG-##`, `EP-##`, `AS-##`, `AOQ-##`, `SM-##`. | 2 — never contradicted |
| `docs/DESIGN-SYSTEM.md` — Design System & UX Specification v1.0 | Defines *how the product looks and behaves on screen*. Owns every `DP-##`, `Rule XX-##`, `RE-##`, `DQ-##`, `VB-##`. | 3 — never redesigned |
| **This document** | Defines *how engineers and AI coding agents must build it.* Owns every `ENG-###` and `EOQ-##`. | 4 |

---

## Contents

**Part 0 — About this document**
0. About This Document

**Part 1 — Foundations**
1. Executive Summary · 2. Engineering Philosophy · 3. Core Engineering Principles · 4. The Twelve Non-Negotiables

**Part 2 — The codebase**
5. Project Structure · 6. Folder Organisation · 7. File Naming · 8. Module Boundaries · 9. Vocabulary and Naming · 10. Component Naming

**Part 3 — Code quality**
11. Code Quality Standards · 12. TypeScript Standards · 13. Code Documentation and Comments · 14. Testability by Design

**Part 4 — Client engineering**
15. Frontend Standards · 16. React Standards · 17. State Management · 18. Data Fetching · 19. Design System Compliance · 20. Mobile Standards · 21. Offline and Synchronisation

**Part 5 — Server and data**
22. Backend Standards · 23. API Design · 24. Database Standards · 25. Supabase Rules · 26. Migrations · 27. Authentication · 28. Authorization · 29. Background Jobs · 30. Domain Events

**Part 6 — AI engineering**
31. AI Integration Rules · 32. Prompt Management · 33. Context and Grounding · 34. Response Validation · 35. AI Cost Discipline

**Part 7 — Cross-cutting standards**
36. Error Handling · 37. Logging · 38. Monitoring and Observability · 39. Configuration · 40. Environment Variables · 41. Secret Management · 42. Input Validation · 43. Output Encoding · 44. File Uploads · 45. Rate Limiting · 46. Caching · 47. Performance · 48. Accessibility · 49. Security-first Development · 50. Privacy-first Development

**Part 8 — Process**
51. Git and Branching · 52. Commit Messages · 53. Pull Requests · 54. Code Review · 55. Documentation Standards · 56. Testing · 57. CI/CD Expectations · 58. Deployment · 59. Rollback · 60. Feature Flags · 61. Incident Engineering

**Part 9 — Dependencies and licensing**
62. Dependency Management · 63. Package Selection · 64. Third-party Evaluation · 65. Copyright and Licence Compliance · 66. Open Source Usage

**Part 10 — Evolution**
67. Technical Debt · 68. Refactoring · 69. Backward Compatibility · 70. Production Readiness · 71. Future Scalability

**Part 11 — AI coding agents**
72. Agent Operating Instructions · 73. Code Generation Rules · 74. Quality Bar for AI-Generated Code · 75. Escalation and Unresolved Items

**Part 12 — Checklists and registers**
76. Code Review Checklist · 77. Engineering Do's · 78. Engineering Don'ts · 79. Rule Register · 80. Engineering Open Questions · 81. Governance

---

## 0. About This Document

### 0.1 Purpose

Avora has an approved Architecture Specification and an approved Design System. Between them they answer *what the system is* and *what the product looks like*. Neither answers the question a new engineer or a coding agent asks on their first morning: **how am I allowed to write this?**

That is the only job of this document. It is the engineering constitution: the rules every human developer and every AI coding agent follows when turning approved architecture and approved design into production code.

It does not design the product. It does not change the architecture. It does not redesign the UI. Where it appears to make such a decision, it is either tracing a decision already made upstream — in which case the trace is cited — or it is explicitly marked as a recommendation requiring sign-off.

**The test of success:** a contributor who has never met the team, working from this document plus the two upstream specifications, produces code that passes review on the first attempt and is indistinguishable in character from code written by the founding engineers.

### 0.2 A stated limitation

`docs/PRD.md` is the ultimate source of truth for Avora and sits above every document including this one. **It was not available to the author of this document.** Every `FR-###`, `NFR-###`, `AIR-###`, `RAI-##`, `PR-##`, `BM-##`, `D-##`, `R-##`, `NG-##` and `OQ-##` identifier cited here is cited **as quoted in `architecture.md` or `DESIGN-SYSTEM.md`**, never from the PRD directly.

The consequence is a binding instruction, not a caveat:

> **Where a rule in this document and the PRD disagree, the PRD wins, the rule is a defect in this document, and the defect must be reported through the amendment process in §81.**

This mirrors the same commitment `architecture.md` §47.1 rule 10 makes to its own upstream, and it exists for the same reason: a standards document that cannot be corrected by its own source is a standards document that will eventually be wrong and confident.

### 0.3 How to read a rule

Every rule carries the same four-part justification, because a rule whose reason is not written down is a rule that will be deleted by the first engineer who finds it inconvenient.

> **ENG-000 — The rule, stated as an imperative.**
> *Why:* the reasoning.
> *Prevents:* the specific failure this makes impossible or expensive.
> *Supports:* the upstream principle, decision or requirement it serves.
> *Exception:* the conditions under which it may be broken, and who may authorise that.

Where *Exception* reads **None** the rule is an invariant. Breaking it is a defect regardless of circumstance, deadline, or seniority. Twelve such rules are collected in §4.

### 0.4 Confidence markers

This document inherits the evidence discipline of `DESIGN-SYSTEM.md` §0.3, because conflating an inherited constraint with an engineering opinion is the fastest way to make a standards document untrustworthy.

| Marker | Meaning | How to treat it |
| --- | --- | --- |
| **`[TRACED]`** | The rule is a direct engineering consequence of a decision in `architecture.md`, `DESIGN-SYSTEM.md`, or a PRD requirement quoted in one of them. The citation is given. | Binding. Changing it requires amending the upstream document first. |
| **`[DERIVED]`** | The rule is not stated upstream, but follows necessarily from something that is. The inference is shown. | Binding. Challenge with evidence that the inference does not hold. |
| **`[RECOMMENDED]`** | A genuine gap. Nothing upstream decides it. This document proposes an answer consistent with everything above it. | **Not yet binding.** Requires engineering-lead sign-off. Listed in §80. |

Unmarked rules are `[TRACED]`. Markers appear on section headings where they apply to the whole section, and on individual rules that differ from their section's default.

### 0.5 Scope and non-goals

**In scope:** engineering governance, code standards, structural rules, process, and the quality bar for both human and machine-generated code.

**Out of scope, deliberately:**

- **Product decisions.** Owned by `PRD.md`.
- **Architectural decisions.** Owned by `architecture.md`. This document tells engineers how to *comply* with `AD-01` through `AD-41`; it never adds an `AD-42`.
- **Visual decisions.** Owned by `DESIGN-SYSTEM.md`.
- **Implementation-specific code.** This document contains no application code. It defines governance. Where an example is needed for clarity, it is illustrative pseudocode or a naming pattern, never a copyable implementation.
- **The detailed specifications that `architecture.md` §32 assigns to other documents:** `DATA-MODEL.md`, `AI-SPEC.md`, `SECURITY.md`, `PRIVACY.md`, `UX-FLOWS.md`, `ANALYTICS.md`, `TEST-PLAN.md`, `ROADMAP.md`. This document references them; it never pre-empts them.

### 0.6 The compliance model

Rules are enforced in four places, and the enforcement point is stated for each rule wherever it is not obvious.

| Layer | Mechanism | Characteristic |
| --- | --- | --- |
| **1 — Type system** | TypeScript, typed contracts, required props, branded types | Violations are impossible to express. Strongest, cheapest, preferred. |
| **2 — Automated gate** | Lint rules, architecture lint, CI suites, schema checks, budgets | Violations are caught before a human looks. Fast, impersonal, never negotiable in the moment. |
| **3 — Review** | Pull request review against §76 | Violations requiring judgement. Slowest and most expensive; used only where 1 and 2 genuinely cannot apply. |
| **4 — Runtime** | Boot-time validation, assertions, alerts | Violations that only manifest in production. Last resort, and always paired with an alert. |

> **ENG-001 — Every new rule adopted into this document declares its enforcement layer, and prefers the lowest number that can work.** `[DERIVED]`
> *Why:* `EP-02` pushes correctness into the lowest layer that can enforce it. A standards document is subject to its own principle: a rule enforced only by review is a rule enforced only when the reviewer is rested.
> *Prevents:* rule inflation — a document that grows faster than its enforcement, until compliance becomes folklore.
> *Supports:* `EP-02`, `AG-10`.
> *Exception:* rules that are genuinely matters of judgement (naming quality, comment usefulness, abstraction taste) may be review-enforced. They must say so.

### 0.7 Exceptions and waivers

> **ENG-002 — Every deviation from a non-invariant rule is recorded in code as a machine-readable waiver, with an owner, a reason, and an expiry date.** `[RECOMMENDED]`
> *Why:* deviations are sometimes correct. Undocumented deviations are always corrosive, because the next engineer cannot tell a considered exception from a mistake and will copy it either way.
> *Prevents:* precedent-by-accident, the most common source of standards decay.
> *Supports:* `EP-07` (explicit over implicit), `AG-10`.
> *Exception:* none for the mechanism. The waiver format is `[RECOMMENDED]` because it has not yet been agreed; the requirement to record deviations is `[DERIVED]` and binding.

Waivers are reviewed on expiry. An expired waiver fails CI. A waiver may never be applied to a rule in §4.

---

# Part 1 — Foundations

## 1. Executive Summary

Avora's defensibility is the Academic Graph, and `architecture.md` §1 states the controlling insight in one line: *"The model is rented. The context is owned."* Every engineering rule in this document exists to protect one of four things that follow from it.

**1. The structure thesis.** `D-01` — no fixed academic hierarchy, anywhere — is the product's central claim and, per `architecture.md` §45.7, *"the most tempting wrong turn available and the one a coding agent is most likely to take."* A large share of the rules here exist solely to make that wrong turn expensive: forbidden identifiers, vocabulary enforcement, structure-agnostic component contracts, and a dedicated regression suite that must pass on every pull request.

**2. Grounding.** A fabricated citation is a severity-one defect (`AIR-006`) rated alongside a data breach in `architecture.md` §41.3. The engineering rules therefore forbid every code path that could produce one: no provider SDK outside an adapter, no model name in a feature module, no string-concatenated context, no free-text citation type, no bypass of the AI Gateway.

**3. Ownership.** `NFR-031` requires every access to be authorised against the requesting identity, never by identifier alone. Engineering complies by treating the database as the security boundary (`EP-02`): no student-scoped table ships without a deny-by-default RLS policy and a negative-authorisation test suite, and no service-role credential ever exists in a runtime that accepts client input (`AD-11`).

**4. The student's experience of the product.** Nothing blocks the student (`EP-03`), nothing destroys their work (`FR-075`, `NFR-015`), nothing degrades their corpus (`EP-06`), and nothing on screen departs from the approved design system.

Everything else in this document is ordinary professional discipline: typed contracts, small functions, honest errors, tested authorisation, reviewed dependencies, boring deployments. That ordinariness is intentional. `EP-10` gives the system a fixed complexity budget spent on four genuinely hard problems; every rule that makes routine work boring is a rule that protects that budget.

**Who this binds.** Every contributor, human or machine. `AG-10` names AI coding agents as declared consumers of the architecture; this document is written to the same audience with the same expectation. **An AI coding agent is held to a higher standard than a human contributor, not a lower one**, because it produces more code, faster, with less context — and §74 states that bar explicitly.

---

## 2. Engineering Philosophy

The ordering below is binding. Where two values conflict, the higher one wins, and the conflict is resolved in favour of the higher one *in code review*, not in conversation afterwards.

| # | Value | Loses to | The concrete meaning at Avora |
| --- | --- | --- | --- |
| 1 | **Correctness over speed** | nothing | A wrong citation, a leaked row, or a destroyed note is unrecoverable. A late feature is recoverable. |
| 2 | **Security over convenience** | correctness | The convenient version of an authorisation check is the one that trusts an identifier. |
| 3 | **User trust over feature delivery** | the two above | `R-10` rates trust destruction from hallucination as Critical and *irrecoverable*. Trust is the only asset that cannot be rebuilt by shipping harder. |
| 4 | **Maintainability over shortcuts** | the three above | The codebase will be read far more often than written, and increasingly by agents that cannot ask a question. |
| 5 | **Explicitness over magic** | the four above | `EP-07`. Every inferred behaviour is a trap for the next reader. |
| 6 | **Readability over brevity** | the five above | Clever code is a private joke told to strangers. |
| 7 | **Simplicity over cleverness** | the six above | `EP-10` — simplicity is a budget, and it is already spent. |
| 8 | **Consistency over personal preference** | the seven above | `AG-10` requires a codebase legible enough that agents produce correct work without reinterpretation. Local optima cost global legibility. |
| 9 | **Composition over duplication** | the eight above | With the specific limit in `ENG-046`: premature abstraction is worse than honest duplication. |
| 10 | **Reusability over copy-paste** | the nine above | Design-system rule `CP-01` — a pattern used twice is promoted before it is used a third time. |

Two philosophical commitments deserve their own statement because they are unusual and easily eroded.

**Documentation precedes code.** `EP-09` makes the document the plan of record and the code its consequence. In practice: an architectural change is proposed in `architecture.md` and merged before its implementation; a new visual pattern is added to `DESIGN-SYSTEM.md` before it is built; a new engineering rule lands here before it is enforced. Code that arrives ahead of its document is reverted, not retro-documented.

**Every rule must reduce future technical debt.** A rule that only enforces taste is deleted. Before adopting a rule, name the maintenance cost it removes in twelve months. If that sentence cannot be written, the rule is a preference and belongs in a linter's default config, not in a constitution.

---

## 3. Core Engineering Principles

`architecture.md` §3 defines ten engineering principles, `EP-01` through `EP-10`. They are not restated here. What follows is the *operational* form of each — what an engineer or agent actually does differently because the principle exists — and the rules in this document that carry it.

| Principle | Operational form | Carried by |
| --- | --- | --- |
| **EP-01** — The domain model is sacred; everything else is replaceable | Domain types and schema change slowly and by review. A vendor constraint never reshapes a domain type. When a library wants a different shape, the adapter absorbs it. | §8, §12, §24, §62 |
| **EP-02** — Push correctness into the lowest layer that can enforce it | Before writing a validation, ask whether it can be a constraint, a policy, or a type instead. Application-layer checks are a usability feature, never the boundary. | §0.6, §24, §28, §42 |
| **EP-03** — Asynchrony is the default above 300 ms | A new endpoint is asked "can this exceed 300 ms under any input?" If yes, it returns a job handle, not a result. | §22, §23, §29 |
| **EP-04** — Idempotency is a requirement | Every mutation, job and webhook has a key and a defined replay behaviour. "It probably won't retry" is not a design. | §23, §29, §30 |
| **EP-05** — Untrusted until proven otherwise, in both channels | Student bytes are hostile to the parser; student text is hostile to the model. Two threat classes, two control sets, never conflated. | §33, §44, §49 |
| **EP-06** — Degrade a feature, never the corpus | Every failure path is designed against the question "can the student still open their material?" If the answer is no, the design is wrong. | §31, §36, §45 |
| **EP-07** — Explicit over implicit, everywhere an agent will read | Long names. No convention-only behaviour. No inferred column meaning. No magic strings. | §9, §12, §39 |
| **EP-08** — Measure what the PRD cares about | Grounding fidelity, citation validity, extraction accuracy and cost per student are instrumented as production signals with alerts, not as offline analyses. | §35, §38 |
| **EP-09** — Documentation-first | The document merges before the code. | §2, §55 |
| **EP-10** — Simplicity is a budget | The system is allowed exactly four hard things: the adaptive structure tree, hybrid scoped retrieval, offline reconciliation, and cost-governed model routing. Complexity introduced anywhere else is stolen from these. | §11, §13, §67 |

> **ENG-003 — Complexity spent outside the four budgeted areas requires an explicit justification in the pull request description, naming which of the four it protects.** `[DERIVED]`
> *Why:* `EP-10` states the budget but does not fund enforcement. A budget with no accounting is a wish.
> *Prevents:* incidental sophistication — the abstraction layer, the plugin system, the clever cache that nobody asked for and everybody must now maintain.
> *Supports:* `EP-10`, `AG-10`.
> *Exception:* mechanical complexity forced by a platform (a polyfill, a workaround for a documented vendor bug). These are annotated with a link to the underlying issue.

---

## 4. The Twelve Non-Negotiables

These are the invariants. They have no exceptions, no waivers, and no deadline that outranks them. Ten of the twelve are the architectural enforcement of the binding constraints `architecture.md` §47 lists for coding agents; two are added by this document as `[DERIVED]` because they are engineering obligations without which the other ten cannot be verified.

| # | Invariant | Source | Primary enforcement |
| --- | --- | --- | --- |
| **NN-01** | **No fixed academic hierarchy is introduced anywhere** — no table, column, enum, type, constant, prompt assumption, component prop, or user-visible string that encodes a hierarchy level. | `D-01`, `SM-01`, `AD-04`, `AD-05`, design `Rule N-06` | Forbidden-identifier lint; the `AD-41` structural-adaptivity suite; §42 check 7 |
| **NN-02** | **No AI output reaches a student ungrounded** — all generation flows through the AI Gateway; no feature module holds a provider SDK, key, or model name. | `AIR-001`, `AD-12` | Architecture lint on vendor imports; Gateway is the only caller of `OrchestrationPort` |
| **NN-03** | **No uploaded or shared content is ever treated as instruction** — it enters context only inside the sealed evidence envelope, with zero tool authority. | `AIR-013`, `AD-17` | Typed context envelope; no string-concatenation path exists |
| **NN-04** | **No access is authorised by identifier alone** — every student-scoped table has deny-by-default RLS; every worker asserts `student_id` explicitly. | `NFR-031`, `AD-11` | RLS negative-authorisation suite, required per table, blocking |
| **NN-05** | **Nothing blocks the student on processing** — every expensive command returns a job handle and reports progress. | `FR-036`, `EP-03`, `AD-26` | Latency budgets in CI; review |
| **NN-06** | **No student-authored content is ever destroyed** — regeneration creates a revision alongside; there is no overwrite path for `student` or `co_created` artifacts. | `FR-075`, `NFR-015` | Repository layer has no such method; type system |
| **NN-07** | **No data is lost across a structural change** — artifacts reference `structure_unit_id`; `path` is derived and never authoritative. | `FR-018`, `SM-04`, `AD-04` | Schema; `AD-41` suite |
| **NN-08** | **All AI-generated content is labelled at every point of presentation, including export.** | `FR-143`, `AIR-010`, `RAI-01`, design `AI-2` | Component contract; lint fails an unlabelled render |
| **NN-09** | **No student academic content appears in any log stream** — including filenames. | `NFR-036`, `AD-36` | Typed logger; content-carrying types fail type-checking |
| **NN-10** | **Every shipped capability traces to a requirement identifier.** | `NFR-063` | PR template; module READMEs |
| **NN-11** | **A citation is a foreign key, never a string.** No type in the codebase may represent a citation as free text at any layer, including DTOs, caches, exports and analytics. | `AIR-006`, `architecture.md` §45.8 | Type system; `CitationChip` has no free-text variant |
| **NN-12** | **A rule in §4 is never disabled to make a test, a build, or a deadline pass.** A blocking gate that blocks is working. | `[DERIVED]` from `EP-09`, `AG-10` | Review; the CI configuration is a protected path (§51) |

> **ENG-004 — A pull request that touches an enforcement mechanism for any `NN-##` requires review from a second approver who did not write the code.** `[RECOMMENDED]`
> *Why:* the enforcement mechanisms are the only thing standing between a well-intentioned change and an invariant. Weakening a lint rule is a smaller-looking diff than violating the rule it protects, and is more dangerous.
> *Prevents:* the guard being removed in the same commit as the violation it would have caught.
> *Supports:* `NN-12`, `AG-10`.
> *Exception:* none once adopted. Marked `[RECOMMENDED]` only because the approver policy needs sign-off.

---

# Part 2 — The Codebase

## 5. Project Structure

`AD-33` fixes the shape: **a single pnpm + Turborepo monorepo, organised by domain first and technology second.** The layout in `architecture.md` §32 is canonical and is not reproduced here. What follows are the rules governing work inside it.

> **ENG-010 — New top-level directories are an architectural change and require an amendment to `architecture.md` §32.**
> *Why:* the tree in §32 is the one place an agent looks to understand the system (`AD-33` rationale). A tree that grows by convenience stops being a map.
> *Prevents:* the `shared/`, `common/`, `utils/`, `lib/`, `misc/` accretion that turns a monorepo into a filesystem.
> *Supports:* `AD-33`, `AG-10`.
> *Exception:* none at top level for a directory holding source, tests, schema, evaluation corpora, documentation, or an enforcement gate. Root-level tooling and editor metadata is scoped out by `architecture.md` §32.1 rule 7. New directories *within* an existing package follow §6; a new *package* under `packages/` amends §32's package list.

> **ENG-011 — Every package and every domain module carries a `README.md` naming the requirement identifiers it satisfies, its public surface, and its owner.**
> *Why:* `architecture.md` §32.1 rule 5 makes traceability a property of the repository rather than a spreadsheet, and gives an agent local context without loading the entire architecture.
> *Prevents:* orphan code — modules whose purpose is known only to whoever wrote them, which is the precondition for both duplication and unsafe deletion.
> *Supports:* `NFR-063`, `AG-10`, `NN-10`.
> *Exception:* none. A module whose README cannot name a requirement is a module that `architecture.md` §0 says should be deleted, not documented.

> **ENG-012 — Code lives in the package that owns the concept, not the package that first needed it.**
> *Why:* the alternative — code living where it was first convenient — is how `packages/core` becomes a junk drawer and how domain logic ends up in a UI package where no server can reach it.
> *Prevents:* logic duplication across web, mobile and worker; the single most expensive class of drift in a multi-client product.
> *Supports:* `AD-33`, `EP-01`.
> *Exception:* a genuinely single-consumer helper may live beside its consumer until a second consumer appears, at which point moving it is mandatory, not optional (see `CP-01`).

### 5.1 Package dependency direction

Dependencies flow in one direction. A cycle is a build failure, not a code smell.

```
config ──► core ──► domain ──► db
                 │        └──► jobs
                 │        └──► ai ──► retrieval
                 ├──► ui-web  ◄── design-tokens
                 └──► ui-mobile ◄── design-tokens

apps/web ──► core, domain, db, ai, jobs, ui-web
apps/mobile ──► core, domain, ui-mobile
apps/worker ──► core, domain, db, ai, jobs, retrieval
```

> **ENG-013 — `packages/core` depends on nothing inside the repository except `packages/config`.**
> *Why:* `core` is the shared contract surface consumed by web, mobile and worker (`architecture.md` §6). Any dependency it acquires is acquired by all three, including the React Native bundle.
> *Prevents:* a Node-only or DOM-only dependency reaching the mobile bundle, which fails at runtime on a student's device rather than in CI.
> *Supports:* `AD-02`, `AD-33`, `NFR-052` (bundle discipline on low-end devices).
> *Exception:* none. If `core` appears to need a dependency, the type belongs in `core` and the behaviour belongs elsewhere.

> **ENG-014 — `packages/ui-web` and `packages/ui-mobile` never import each other, and never import `packages/db`, `packages/ai`, or `packages/jobs`.**
> *Why:* they are two implementations of one specification (design `Rule HO-02`), not a shared abstraction, and a UI package that can reach the database has no boundary at all.
> *Prevents:* platform-specific code leaking across clients; data access from render paths; secrets reaching a client bundle.
> *Supports:* `AD-02`, `AD-33`, design `Rule HO-02`.
> *Exception:* none.

---

## 6. Folder Organisation

> **ENG-015 — Inside `packages/domain`, the top level is the PRD's vocabulary, not a technology taxonomy.** `identity/`, `academic/`, `resources/`, `knowledge/`, `tutor/`, `notes/`, `recall/`, `assessment/`, `mastery/`, `planning/`, `insights/`, `sharing/`, `billing/`, `ai/`, `jobs/`, `platform/`.
> *Why:* `architecture.md` §32.1 rule 1 — an engineer or agent looking for flashcard logic looks in `recall/`, because that is the word the product uses.
> *Prevents:* the `services/ helpers/ utils/` layout, in which finding anything requires knowing who wrote it.
> *Supports:* `AD-33`, `AG-10`, `architecture.md` §5.3.
> *Exception:* none. The module list is the one in `architecture.md` §5.3; adding a module is an architectural amendment.

> **ENG-016 — Within a module, folders are named for the layer they occupy, and the set is closed:** `contracts/`, `services/`, `repositories/`, `events/`, `jobs/`, `policies/`, `ports/`, `__tests__/`.
> *Why:* `architecture.md` §8.1 fixes the backend layering. A closed folder vocabulary makes the layer of any file inferable from its path, which is precisely the `AG-10` legibility property. `ports/` is included because `ENG-018` requires a module's ports to live with it; without it the two rules are jointly unsatisfiable (`GAP-02`).
> *Scope of `repositories/`:* a module's `repositories/` folder holds the query objects for that module's aggregates. The access mechanism — role-scoped clients, generated types, the `RepositoryPort` implementation, the RLS harness — lives in `packages/db` (`architecture.md` §32). The dependency runs `domain ──► db` (§5.1); it never runs the other way.
> *Prevents:* domain logic hiding in a file called `helpers.ts`, which is the usual way layering erodes.
> *Supports:* `EP-07`, `AG-10`.
> *Exception:* a module may add a folder for a genuinely module-specific concept (`retrieval/strategies/`, `recall/scheduling/`). It may not add a generic one.

> **ENG-017 — `utils/`, `helpers/`, `common/`, `shared/`, `misc/`, and `lib/` are prohibited directory names anywhere in the repository.**
> *Why:* each is an admission that the code has no owner. Genuinely generic code belongs in a named module (`packages/core/text/`, `packages/core/time/`); everything else belongs with its domain.
> *Prevents:* the single most reliable predictor of a codebase becoming unnavigable.
> *Supports:* `EP-07`, `AD-33`, `AG-10`.
> *Exception:* none. Enforcement is a lint rule on path names.

> **ENG-018 — Ports live with the domain; adapters live at the edge. A vendor name never appears in a path outside an adapter directory.**
> *Placement:* a port declared and consumed by exactly one domain module lives in `packages/domain/<module>/ports/`. A port consumed by more than one module lives in the package owning the capability — `packages/ai/ports/`, `packages/jobs/ports/`, `packages/retrieval/ports/`, `packages/db/ports/` — per `ENG-012`. A port is never declared in two places.
> *Why:* stated directly in `architecture.md` §32.1 rule 3, and it is grep-checkable, which is why it is checked in CI.
> *Prevents:* `AG-06` (vendor replaceability) degrading from a guarantee into an aspiration.
> *Supports:* `AG-06`, `AD-12`, `AD-15`, `NFR-061`.
> *Exception:* none. If a task appears to require a vendor import outside an adapter, per `architecture.md` §47.1 rule 1 the task is wrong or a port is missing.

> **ENG-019 — Tests live beside the code they test, in `__tests__/`, not in a parallel top-level tree.** `[RECOMMENDED]`
> *Why:* colocation makes an untested module visible in a directory listing and makes deletion atomic — moving a module moves its tests.
> *Prevents:* orphaned tests for deleted code, and the slow discovery that a module was never tested at all.
> *Supports:* §56, `AG-10`.
> *Exception:* end-to-end and load suites, which are cross-cutting by nature, live in the top-level `e2e/` that `architecture.md` §32 lists — `e2e/adaptivity/` for the `AD-41` structural-adaptivity suite, `evals/` for the evaluation corpora. This exception is `[TRACED]` and binding even while the colocation preference above remains `[RECOMMENDED]`: the existence of a top-level directory is a property of the canonical tree, not a testing preference.

---

## 7. File Naming Conventions

> **ENG-020 — One exported concept per file, and the filename is that concept.**
> *Why:* a file whose name predicts its contents is a file an agent can locate without reading. This is the cheapest possible contribution to `AG-10`.
> *Prevents:* the 900-line `index.ts` that everything imports and nobody can safely change.
> *Supports:* `EP-07`, `AG-10`.
> *Exception:* tightly coupled small types may share a file with their primary type (a result type with its service, a props type with its component). Two *behaviours* never share a file.

The naming table below is binding. `[DERIVED]` — `architecture.md` fixes the vocabulary and the layering but not the casing convention; the convention below is the one already implied by the tree in §32 and by the component names in `DESIGN-SYSTEM.md` §18.

| Artefact | Convention | Example | Never |
| --- | --- | --- | --- |
| React / React Native component | `PascalCase.tsx`, matching the component name exactly | `CitationChip.tsx` | `citation-chip.tsx`, `chip.tsx` |
| Component test | `PascalCase.test.tsx` | `CitationChip.test.tsx` | `test-chip.tsx` |
| Hook | `useCamelCase.ts` | `useReviewSession.ts` | `review-session-hook.ts` |
| Domain service | `kebab-case.service.ts` | `structure-unit.service.ts` | `structureUnitService.ts` |
| Repository | `kebab-case.repository.ts` | `resource.repository.ts` | `resource-dao.ts` |
| Contract / schema | `kebab-case.contract.ts` | `generate-quiz.contract.ts` | `types.ts` |
| Port interface | `PascalCasePort.ts` | `RetrievalPort.ts` | `IRetrieval.ts` |
| Adapter | `kebab-case.adapter.ts` inside `adapters/` | `antigravity.adapter.ts` | `antigravity.ts` at module root |
| Job definition | `domain.action.job.ts` matching the `architecture.md` §24.1 name | `resource.ingest.job.ts` | `ingestJob.ts` |
| Domain event | `domain.action.event.ts` matching `architecture.md` §25.2 | `structure.changed.event.ts` | `events.ts` |
| Prompt asset | `task-name.v<major>.<minor>.prompt.ts` | `tutor-answer.v2.1.prompt.ts` | `prompt.ts` |
| Migration | `<timestamp>_<verb>_<object>.sql` | `20260801120000_add_chunk_locator.sql` | `update.sql` |
| RLS policy | `<table>.policy.sql` | `chunks.policy.sql` | `policies.sql` |
| Design token file | `kebab-case.tokens.ts` | `semantic-colour.tokens.ts` | `colors.ts` |
| Test fixture | `kebab-case.fixture.ts` | `handwritten-scan.fixture.ts` | `mock1.ts` |

> **ENG-021 — Filenames use the PRD glossary, not a synonym.** `resource.repository.ts`, never `file.repository.ts`; `structure-unit.service.ts`, never `folder.service.ts`.
> *Why:* `architecture.md` §32.1 rule 2 and design `Rule CP-03` both make the glossary the naming authority, for the same stated reason: *divergence between code vocabulary and product vocabulary is how product decisions get quietly reinterpreted.*
> *Prevents:* `NN-01` erosion by vocabulary drift — the path from `folder.service.ts` to a `folders` table is short and travelled unconsciously.
> *Supports:* `NN-01`, `D-01`, `AG-10`.
> *Exception:* none. Enforcement is a lint rule on prohibited path segments (§9.2).

> **ENG-022 — Barrel files (`index.ts` re-exports) are permitted only at a package's public boundary, never within a package.** `[RECOMMENDED]`
> *Why:* internal barrels create import cycles that are invisible in review, defeat tree-shaking (a direct `NFR-052` bundle concern), and make an import's true source unfindable by grep.
> *Prevents:* circular dependencies; bundle bloat on the low-end Android devices `NFR-052` names as the target environment.
> *Supports:* `NFR-052`, `AG-10`.
> *Exception:* `packages/ui-web` and `packages/ui-mobile` may barrel their primitive sets, which are flat by construction and imported as a set.

---

## 8. Module Boundaries

`architecture.md` §5.3 states the boundary rule: *a module may read another module's tables only through that module's published domain service or a published read view. Cross-module foreign keys are permitted — this is one database — but cross-module queries written ad hoc are not.*

> **ENG-023 — A module's public surface is exactly what its `index.ts` exports, and everything else is private regardless of file location.**
> *Why:* the §5.3 boundary rule needs a mechanical definition of "published", or "published" comes to mean "reachable".
> *Prevents:* the module-extraction option `architecture.md` §43.1 point 6 deliberately preserves from quietly closing.
> *Supports:* `AD-01`, `architecture.md` §5.3.
> *Exception:* test files may import module internals for white-box testing of invariants. They may not import another module's internals.

> **ENG-024 — A module never queries another module's tables directly, including in a worker, a migration backfill, or an analytics query.**
> *Why:* the boundary rule is stated for the request path but is most often broken in the places nobody reviews closely: a backfill script, a one-off job, a reporting query.
> *Prevents:* undocumented coupling that surfaces only when the owning module changes its schema — a change that should have been local becoming a production incident.
> *Supports:* `AD-01`, `EP-01`, `NFR-060`.
> *Exception:* a **published read view** owned by the other module, which is a reviewed artefact and a stable contract. Sharing's projection view (`architecture.md` §12.5) is the model: exclusions are properties of the view definition, not of a filter someone remembered to write.

> **ENG-025 — Cross-module communication is a domain service call for synchronous needs and a domain event for asynchronous ones. There is no third mechanism.**
> *Why:* `AD-27` makes the transactional outbox the event backbone; `architecture.md` §8.1 makes domain services the synchronous seam. A third mechanism — a shared mutable singleton, a direct queue publish, an import of another module's internal function — is untraceable in both.
> *Prevents:* the invisible dependency graph, which is what makes a monolith unmaintainable rather than the monolith itself.
> *Supports:* `AD-01`, `AD-27`, `EP-04`.
> *Exception:* none.

> **ENG-026 — A module that needs a capability from an external vendor declares a port; it never reaches for the vendor.**
> *Why:* `AG-06` makes vendor replaceability an architecture goal at *every* external boundary, and `architecture.md` §15.3 shows the cost of getting this wrong: an orchestration vendor is a *deeper* dependency than a model provider because it sits between Avora and every provider at once.
> *Prevents:* `NFR-061` violations discovered at migration time, when they are most expensive.
> *Supports:* `AG-06`, `NFR-061`, `AD-12`, `AD-15`.
> *Exception:* none. Ports currently defined by the architecture: `RepositoryPort`, `AuthPort`, `BlobStorePort`, `RealtimePort`, `QueuePort`, `OrchestrationPort`, `ModelPort`, `EmbeddingPort`, `RetrievalPort`, `SchedulerPort`, `BillingPort`, `PaymentCollectionPort`, `MailPort`, `TelemetryPort`, `AnalyticsPort`. A new port is an architectural amendment.

---

## 9. Vocabulary and Naming

This section is disproportionately important. `NN-01` — the product's central claim — is most often violated not by a deliberate decision but by a name, and both upstream documents say so independently: `architecture.md` §32.1 rule 2 and `DESIGN-SYSTEM.md` `Rule CP-03` and `Rule GL-01`.

### 9.1 The canonical vocabulary

The table below is the union of `architecture.md` §32.1 and `DESIGN-SYSTEM.md` §46.2, applied to code. It is binding on identifiers, filenames, table names, column names, type names, component names, query keys, event names, analytics properties, and user-visible strings.

| Concept | Use in code | Never |
| --- | --- | --- |
| Resource | `resource`, `Resource`, `resource_id` | `file`, `document`, `attachment`, `upload` (as a noun for the stored object) |
| Structure unit | `structure_unit`, `StructureUnit`, `structure_unit_id` | `folder`, `section`, `category`, `chapter`, `unit`, `module`, `topic`, `week` |
| Structure type label | `structure_type_label` | `type`, `level`, `kind`, `structure_type` |
| Subject | `subject` | `course`, `class`, `module` |
| Academic term | `term` | `semester` (in code — it is one possible student-facing label), `session`, `period` |
| Note | `note` | `doc`, `page` |
| Summary | `summary` | `overview`, `abstract` |
| Flashcard | `flashcard` | `card` alone in a shared scope, `deck_item` |
| Quiz | `quiz` | `test`, `exam` (reserve `exam` for real academic events) |
| Attempt | `attempt` | `try`, `submission`, `result` |
| Mastery signal | `mastery_signal` | `score`, `grade`, `mark`, `rating`, `level`, `proficiency` |
| Academic event | `academic_event` | `event` alone (collides with domain events), `calendar_item`, `task` |
| Study plan | `study_plan`, `plan_item` | `schedule`, `todo` |
| Insight | `insight` | `tip`, `alert`, `notification` |
| Concept | `concept` | `skill`, `objective`, `tag` |
| Chunk | `chunk` | `passage`, `segment`, `fragment` |
| Citation | `citation`, `message_citation`, `note_source` | `source_tag`, `reference` (as a stored string) |
| Provenance | `provenance` with values `ai`, `student`, `co_created` | `is_ai`, `generated`, `auto` |

> **ENG-027 — The prohibited terms in the right-hand column are enforced by lint on identifiers, paths, SQL, and user-visible string catalogues.**
> *Why:* `Rule GL-01` requires vocabulary changes to be made globally in one pass, *never per-screen*. The same is true of code: a product that says `folder` in one module and `structure_unit` in another has two mental models and no glossary.
> *Prevents:* `NN-01` erosion; and, per `Rule CP-03`, product decisions being quietly reinterpreted.
> *Supports:* `NN-01`, `D-01`, `NFR-054`, `AG-10`.
> *Exception:* a prohibited word may appear inside a **student-supplied value** — a student who names their structure unit "Chapter 4" is exercising `FR-020`, and that string is data. It may never appear as an identifier, a schema object, or a hard-coded string.

### 9.2 Forbidden identifiers — the `NN-01` guard

> **ENG-028 — No identifier, table, column, enum member, type, constant, or literal may name a hierarchy level.**
> *Why:* `SM-01` states it as an invariant and assigns it to *"Schema review; CI lint on forbidden identifiers."* `architecture.md` §45.7 explains why the guard is necessary: a fixed hierarchy *"simplifies the schema and every query"*, which is exactly what makes it tempting to a tired engineer or a pattern-matching agent.
> *Prevents:* failure of the Meera persona case, which `architecture.md` §45.7 names as the PRD's proof case for the core thesis.
> *Supports:* `NN-01`, `D-01`, `SM-01`, `SM-05`, `FR-014`–`FR-020`, `PR-04`, design `Rule N-06`.
> *Exception:* **none.** An "other" bucket is a fixed hierarchy with a disclaimer (`architecture.md` §45.7).

The lint deny-list applies to identifiers and to hard-coded strings, in both code and SQL:

`chapter`, `chapters`, `unit_id`, `unitId`, `module_id`, `moduleId`, `topic_id`, `week_id`, `lesson_id`, `level`, `depth_level`, `hierarchy_level`, `parent_type`, `node_type` — and any enum whose members are structure labels.

Adjacent-but-legal: `structure_unit_id`, `structure_type_label`, `parent_id`, `path`, `position`, `depth` *(as a computed integer for rendering budget only, never as a semantic level)*.

> **ENG-029 — No prompt, output contract, retrieval predicate, analytics property, or test fixture may assume a level name.**
> *Why:* `SM-07` extends the invariant beyond the schema into the AI context contract: *prompts refer to "the selected scope" and to labels as data supplied at runtime.*
> *Prevents:* the subtlest form of `NN-01` violation — a schema that is correctly label-agnostic feeding a prompt that says "summarise this chapter", which fails silently and only for students whose discipline does not use chapters.
> *Supports:* `NN-01`, `SM-07`, `AD-17`, `D-01`.
> *Exception:* none. The `AD-41` suite asserts this specifically.

### 9.3 General naming

> **ENG-030 — Names are long, unambiguous, and unabbreviated.**
> *Why:* `EP-07` requires explicitness *"everywhere an agent will read"*, and an agent reads everything. `resolveScopeToChunkPredicate` is better than `resolveScope`, which is better than `resScope`.
> *Prevents:* the ambiguity that causes an agent to infer the wrong behaviour and a human to look it up every time.
> *Supports:* `EP-07`, `AG-10`.
> *Exception:* universally understood short forms in narrow scope: `id`, `url`, `db`, `i` in a loop, `ok`. Never `res`, `req` outside a route handler signature, `ctx` without a typed shape, `data`, `tmp`, `val`, `obj`.

> **ENG-031 — Booleans are named as assertions with a verb prefix (`is`, `has`, `should`, `can`, `was`) and never as negations.**
> *Why:* `!isNotReady` is a bug waiting to be introduced during a refactor.
> *Prevents:* double-negative logic errors, which review reliably fails to catch.
> *Supports:* readability, `EP-07`.
> *Exception:* none.

> **ENG-032 — Units are in the name.** `timeoutMs`, `budgetTokens`, `sizeBytes`, `ttlSeconds`, `latencyP95Ms`, `costMicros`.
> *Why:* the alternative is a unit mismatch that type-checks, which is the most expensive class of silent bug and is especially likely in a system where token budgets, cost, latency and TTLs all coexist (`architecture.md` §16.3, §28, §40).
> *Prevents:* budget and cost defects that surface as `BM-03` cost anomalies rather than as errors.
> *Supports:* `EP-07`, `NFR-022`, `BM-03`.
> *Exception:* where a branded type carries the unit in the type system (`ENG-054`), the suffix may be dropped. That is stronger, not weaker.

---

## 10. Component Naming

`DESIGN-SYSTEM.md` §18.3 fixes the convention: `<Domain><Object><Type>`, PascalCase, no abbreviations, no `Avora` prefix, and the PRD glossary is the naming authority (`Rule CP-03`). It is not restated. The engineering rules that follow from it are:

> **ENG-033 — A component's name declares its layer, and its layer determines what it may import.**
> *Why:* `architecture.md` §7.4 and `DESIGN-SYSTEM.md` §18.1 define three strictly separated layers. Without an import rule, the separation is a diagram rather than a property.
> *Prevents:* the accessibility and enforcement obligations of layer 1 and layer 2 being re-solved — or forgotten — at layer 3.
> *Supports:* `architecture.md` §7.4, design §18.1, `NFR-051`.
> *Exception:* none.

| Layer | May import | May not import |
| --- | --- | --- |
| **1 — Primitives** (`Button`, `Input`, `Card`, `Sheet`, `Chip`, `Skeleton`, `ProgressRing`) | Design tokens, platform primitives | Domain types, data hooks, any Avora concept |
| **2 — Domain components** (`StructureTree`, `ResourceCard`, `CitationChip`, `AIGeneratedBadge`, `ProcessingState`, `MasteryMeter`, `ConfidenceIndicator`, `ScopeStrip`, `EvidenceLine`, `ReadinessRing`, `InsightCard`, `SubjectCard`) | Primitives, domain types from `@avora/core`, tokens | Data-fetching hooks, repositories, adapters |
| **3 — Surface compositions** (screens) | Domain components, data hooks, routing | Primitives directly — per design §18.1, *a screen containing a raw primitive is a smell* |

> **ENG-034 — A domain component's props make the PRD rule it enforces impossible to violate, and required props are never made optional to unblock a caller.**
> *Why:* `architecture.md` §7.4 calls this *"the practical expression of `AG-10`: the rules an AI coding agent is most likely to forget are the ones made structurally impossible to violate."* Design §18.2 specifies the contracts: `ErrorState` requires `recoveryAction`; `ResourceCard` requires `confidence`; `CitationChip` accepts only a resolved citation object.
> *Prevents:* the specific failure of a caller who cannot supply a recovery action making the prop optional instead of designing the recovery — which converts `NFR-014` from a guarantee into a default.
> *Supports:* `NN-08`, `NN-11`, `FR-039`, `NFR-014`, `AIR-006`, design `Rule ER-01`, `Rule CP-02`.
> *Exception:* none. If a required prop cannot be supplied, the *feature* is incomplete, not the component.

> **ENG-035 — A pattern used on two surfaces is promoted to a domain component before it is used on a third, and promotion is a blocking review comment.**
> *Why:* design `Rule CP-01` — *"Avora's consistency comes from a small component set used often, not a large one used once each."*
> *Prevents:* the divergence that makes surface six look unlike surfaces one through five, which `DESIGN-SYSTEM.md` §0.1 names as the entire problem it exists to solve.
> *Supports:* design `Rule CP-01`, `Rule FS-01`, `AG-10`.
> *Exception:* none, but the promotion may be a follow-up pull request with a linked issue when the third use is urgent. The issue is not optional and expires per `ENG-002`.

> **ENG-036 — A component ships with every applicable state from `DESIGN-SYSTEM.md` §28 or it does not ship.**
> *Why:* design `Rule CP-02` — *"A component delivered with only a default state is not delivered."* `DP-06` makes honest states a release gate, not a preference, and design §43 notes these states are *"where trust is actually decided and they are the most commonly deferred work in any product."*
> *Prevents:* the pattern `RE-11` records in production today — empty, offline, partial and error states not observable on any surface.
> *Supports:* `DP-06`, `NFR-013`, `NFR-014`, design `Rule CP-02`, §28.
> *Exception:* a state genuinely inapplicable to the component is declared inapplicable in the component's story or test, not silently omitted.

---

# Part 3 — Code Quality

## 11. Code Quality Standards

> **ENG-040 — Code is written to be read by someone with less context than the author, including a machine.**
> *Why:* `AG-10` makes an agent-legible codebase an architecture goal. Agents have no tribal knowledge, no Slack history, and no memory of the meeting where the shortcut was agreed.
> *Prevents:* the class of defect where a change is correct in isolation and wrong in context, because the context was never written down.
> *Supports:* `AG-10`, `EP-07`.
> *Exception:* none.

> **ENG-041 — A function does one thing, and its name says what.**
> *Why:* a function that needs "and" in its name needs a `;` in its call site.
> *Prevents:* untestable units; hidden side effects; the impossibility of reusing half of something.
> *Supports:* `EP-10`, testability (§56).
> *Exception:* orchestration functions whose single job *is* sequencing (a job handler, a pipeline stage) may call many things. They may not also compute.

> **ENG-042 — Side effects are explicit in the signature, and a function that both computes and persists is split.**
> *Why:* the domain layer's invariants (`architecture.md` §8.1) are only testable if computation can be exercised without a database.
> *Prevents:* domain rules that can only be verified by integration test, which is how invariants become slow to check and therefore checked less.
> *Supports:* `EP-02`, `architecture.md` §8.1, §56.
> *Exception:* none in the domain layer. Repositories and adapters are, by definition, effectful.

**Complexity budgets.** `[RECOMMENDED]` — these are proposed thresholds requiring sign-off; the *principle* that budgets exist is `[DERIVED]` from `EP-10` and binding.

| Metric | Soft limit (review) | Hard limit (CI failure) | Reasoning |
| --- | --- | --- | --- |
| Function length | 40 lines | 80 lines | Beyond a screen, a reader loses the top of the function |
| Cyclomatic complexity | 8 | 15 | Each branch is a test case; 15 branches is an untested function in practice |
| Function parameters | 3 | 5 (use an options object) | Positional arguments past three are call-site guesswork |
| File length | 300 lines | 600 lines | A file this long has more than one concept (`ENG-020`) |
| Nesting depth | 3 | 4 | Depth is the strongest predictor of misread logic |
| React component length | 150 lines | 250 lines | Beyond this the component is doing data work, layout, and behaviour |

> **ENG-043 — Guard clauses over nesting; early return over `else`.**
> *Why:* the happy path should read straight down the left margin. Every reader is looking for it.
> *Prevents:* the arrow-shaped function in which the actual behaviour is indented past the point of legibility.
> *Supports:* readability, `ENG-042`'s nesting budget.
> *Exception:* none.

> **ENG-044 — Dead code, commented-out code, and unreferenced exports are deleted, not retained.**
> *Why:* version control is the archive. Retained dead code is read, trusted, and eventually revived by someone who assumes it works.
> *Prevents:* an agent pattern-matching against code that was disabled for a reason nobody recorded.
> *Supports:* `AG-10`, `architecture.md` §0 (*a component with no traceable requirement is deleted, not documented*).
> *Exception:* code disabled behind a feature flag with an owner and a removal date (§60). That is a flag, not dead code.

> **ENG-045 — Magic values are named constants, colocated with the concept they belong to.**
> *Why:* `EP-07`. A bare `0.72` in a retrieval threshold is unreviewable and unfindable.
> *Prevents:* the same tunable existing at three different values in three files — a real hazard given how many thresholds this system has (retrieval, classification confidence, extraction confidence, budget, ask-vs-assume).
> *Supports:* `EP-07`, `AD-22`, `AG-10`.
> *Exception:* `0`, `1`, `-1`, and empty string, where the meaning is structural rather than semantic.

> **ENG-046 — Duplicate twice; abstract on the third occurrence, and only if the three share a reason to change.**
> *Why:* premature abstraction couples things that merely looked alike, and the cost lands later when one of them needs to differ. `EP-10`'s budget is spent on hard problems, not on speculative generality.
> *Prevents:* the shared helper with six boolean flags, which is three functions wearing a trench coat.
> *Supports:* `EP-10`, philosophy value 9.
> *Exception:* the design-system promotion rule (`CP-01`, `ENG-035`) applies at **two** uses, not three. Visual consistency is a stronger obligation than code-shape consistency, because divergence is visible to the student.

> **ENG-047 — Every `TODO` carries an owner and a tracked issue, in the form `// TODO(@owner, AVR-123): …`.**
> *Why:* an unowned TODO is a note to nobody.
> *Prevents:* the archaeology problem — a codebase whose TODOs are older than its engineers.
> *Supports:* §67, `AG-10`.
> *Exception:* none. Unformatted `TODO` fails lint. `FIXME` and `HACK` are prohibited entirely; if it is broken, it is an issue, not a comment.

---

## 12. TypeScript Standards

> **ENG-050 — `strict` is on, and every strictness flag is on.** `strictNullChecks`, `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`.
> *Why:* the type system is enforcement layer 1 (§0.6), and it is the layer that costs nothing at runtime. A weakened flag converts a compile error into a production incident on a student's device.
> *Prevents:* the single largest class of avoidable defect in a TypeScript codebase.
> *Supports:* `EP-02`, `AG-10`.
> *Exception:* none. The compiler configuration lives in `packages/config` and is a protected path.

> **ENG-051 — `any` is prohibited. `unknown` at boundaries, narrowed by a validator.**
> *Why:* `any` is not a type, it is a suspension of the only enforcement layer that is free. At a system boundary — a provider response, a webhook body, a parsed document — the honest type is `unknown`, and narrowing is a validation step that should exist anyway.
> *Prevents:* untyped data flowing from a vendor response into a domain object, which is how a provider change becomes a runtime crash rather than a build failure.
> *Supports:* `EP-02`, `AG-06`, §42.
> *Exception:* a third-party type definition that is genuinely wrong may be corrected with a locally-scoped assertion, in an adapter, with a comment linking the upstream issue. Never in domain code.

> **ENG-052 — Type assertions (`as`) and non-null assertions (`!`) are prohibited outside adapters and tests.**
> *Why:* both are claims the compiler cannot check, made by a human who may be wrong. In domain code the correct response to "the compiler doesn't know this is non-null" is to make it non-null in the type or handle the null.
> *Prevents:* null-dereference crashes on the constrained devices `NFR-052` targets, where a crash is a lost session, not a refresh.
> *Supports:* `EP-02`, `NFR-052`.
> *Exception:* `as const`, which narrows rather than widens, is always permitted and encouraged.

> **ENG-053 — Domain types are defined once, in `@avora/core`, and flow outward. A duplicated type definition is a build failure.**
> *Why:* stated directly in `architecture.md` §32.1 rule 4 — *contracts are generated, never hand-mirrored* — and §6, which makes `@avora/core` *"one canonical type source (`AG-10`)"*.
> *Prevents:* client/server drift, which `AD-33` names as the decisive argument against a polyrepo.
> *Supports:* `AD-33`, `AG-10`, `NFR-060`.
> *Exception:* none. A client-only view model may *derive* from a core type; it may not redeclare it.

> **ENG-054 — Identifiers are branded types, not bare strings.** `StudentId`, `ResourceId`, `ChunkId`, `StructureUnitId`, `SubjectId`, `ConceptId`, `JobId`.
> *Why:* `NFR-031` forbids authorising by identifier alone, and the system passes many identifier kinds through many layers. A bare `string` makes passing a `resource_id` where a `chunk_id` is expected a type-check success.
> *Prevents:* the citation-resolution class of bug specifically: `AIR-006` verification asks whether *that exact chunk* was in the supplied envelope. Confusing identifier kinds at that boundary is a severity-one path.
> *Supports:* `NN-04`, `NN-11`, `NFR-031`, `AIR-006`, `EP-02`.
> *Exception:* none for domain identifiers. Opaque third-party identifiers (a Stripe id, a provider request id) are branded at the adapter boundary.

> **ENG-055 — Discriminated unions over optional-field soup; exhaustive `switch` with a `never` check.**
> *Why:* the system is full of state machines — resource state (`architecture.md` §19.2), job state, AI outcome, sync outcome. Modelling these as an object with six optional fields makes every impossible combination expressible.
> *Prevents:* the unhandled state. When `architecture.md` §19.2 adds a state, an exhaustive switch fails to compile everywhere it must be handled — which is the desired behaviour.
> *Supports:* `EP-02`, `EP-07`, `NFR-014`.
> *Exception:* none.

> **ENG-056 — Domain results are explicit result types, not thrown exceptions, for expected failures.**
> *Why:* `NFR-014` requires every surfaced failure to be honest, comprehensible, and paired with a recovery action. A failure that arrives as an exception has no structured recovery action; it has a stack trace. Expected failures — quota exhausted, retrieval insufficient, citation unresolvable, share revoked — are outcomes, not exceptions.
> *Prevents:* the honest-error requirement degrading into a generic catch block, which is exactly the *"Sorry, something went wrong"* that design `Rule ER-01` prohibits.
> *Supports:* `NFR-014`, design `Rule ER-01`, §36.
> *Exception:* genuinely unexpected failures — a bug, an invariant violation, an impossible state — throw. That distinction is the whole point (§36.1).

> **ENG-057 — `readonly` by default on domain types; mutation is deliberate and local.**
> *Why:* `AD-06` and `AD-07` make immutability an architectural property (originals immutable, attempts append-only). Mutable domain objects invite code that contradicts the storage model.
> *Prevents:* accidental in-place mutation of a shared object across a render tree or a job pipeline.
> *Supports:* `AD-06`, `AD-07`, `EP-01`.
> *Exception:* performance-critical local accumulation inside a function, where the mutable value never escapes.

> **ENG-058 — Enums are discriminated string-literal unions, never TypeScript `enum`, and never used for structure types.**
> *Why:* TypeScript `enum` emits runtime code, does not narrow well across package boundaries, and behaves inconsistently under `const`. Separately and more importantly, `AD-05` forbids an enum for `structure_type_label` under any representation.
> *Prevents:* bundle weight on mobile; and, critically, the `NN-01` violation of encoding structure types as a closed set.
> *Supports:* `NN-01`, `AD-05`, `NFR-052`.
> *Exception:* none.

---

## 13. Code Documentation and Comments

> **ENG-060 — Comments explain *why*, never *what*.**
> *Why:* the code already says what it does, and a comment that restates it becomes false at the first refactor. The reasoning — the rejected alternative, the requirement being satisfied, the vendor quirk being worked around — exists nowhere else.
> *Prevents:* the confidently wrong comment, which is worse than no comment because it is trusted.
> *Supports:* `EP-07`, `AG-10`.
> *Exception:* a short *what* comment is warranted above genuinely dense logic — a scheduling calculation, a fusion ranking step — where the reader benefits from a plain-language summary before the detail.

> **ENG-061 — Any code enforcing a requirement cites the identifier in a comment.**
> *Why:* `NFR-063` makes traceability an obligation, and `architecture.md` §32.1 rule 5 pushes it into the repository. A guard clause that looks arbitrary is a guard clause that gets removed for looking arbitrary.
> *Prevents:* deletion-by-cleanup of code whose purpose is a requirement rather than a mechanism — the most dangerous refactor available in this codebase.
> *Supports:* `NN-10`, `NFR-063`, `AG-10`.
> *Exception:* none where the requirement is non-obvious from the surrounding code.

> **ENG-062 — Public exports carry a one-line doc comment stating purpose, ownership, and invariants; ports carry the contract their adapters must satisfy.**
> *Why:* a port is a promise made to future adapters that do not yet exist. `AG-06` depends on those promises being written down, and `architecture.md` §17.6 shows the shape: the `RetrievalPort` replacement must re-satisfy the deletion subsystem's contract *"or it is not eligible."*
> *Prevents:* an adapter that satisfies the type signature and violates the contract, which the type system cannot catch.
> *Supports:* `AG-06`, `NFR-061`, `AD-15`, `AG-10`.
> *Exception:* trivially self-describing exports (a single formatter, a constant).

> **ENG-063 — Documentation lives with the thing it documents; cross-document duplication is prohibited.**
> *Why:* `EP-09` makes documents the plan of record. Duplicated documentation drifts, and drifted documentation is indistinguishable from a specification until someone acts on the wrong copy.
> *Prevents:* two contradictory statements of the same rule, with no way to tell which is current.
> *Supports:* `EP-09`, §55.
> *Exception:* none. Reference the canonical location instead — as this document does throughout.

---

## 14. Testability by Design

Testability is a property of the code, not of the test suite. A system that is hard to test is a system whose invariants will go unverified, which for Avora means `NN-01`, `NN-04` and `NN-11` degrade silently.

> **ENG-065 — Domain logic is pure and dependency-injected; time, randomness, identifiers and network access enter through injected providers.**
> *Why:* the scheduler (`AD-24`), the planner (`AD-25`), mastery derivation (`AD-07`) and scope resolution (`AD-19`) are all deterministic computations over structured data. `AD-25` explicitly prefers a deterministic scheduler because it is *"fast, cheap, testable, and — critically — explainable."* That property is lost the moment the code calls the clock directly.
> *Prevents:* flaky tests; untestable date arithmetic; the inability to replay a plan or a mastery computation to explain it to a student, which `FR-104` and `FR-122` require.
> *Supports:* `AD-25`, `AD-07`, `AD-23`, §56.
> *Exception:* adapters and infrastructure, which are the injection points themselves.

> **ENG-066 — Every state machine in the system is implemented as data, exhaustively typed, and independently testable without its side effects.**
> *Why:* `architecture.md` §19.2 defines the resource state machine and §24 the job lifecycle. `NFR-014` requires every state to be honest and student-visible, which cannot be verified if states only exist implicitly across a function's branches.
> *Prevents:* an unreachable or undesigned state reaching a student as a blank screen.
> *Supports:* `NFR-014`, `architecture.md` §19.2, `AD-26`, `ENG-055`.
> *Exception:* none.

> **ENG-067 — Test fixtures represent the diversity of the target market, not the convenience of the author.**
> *Why:* `AD-21` and `architecture.md` §42.3 require the evaluation corpus to cover poor scans, angled photographs, dense handwriting, regional-language mixing, heavy mathematics and diagrams. The same discipline applies to ordinary fixtures: structure fixtures include zero-, one-, three- and five-level subjects and heterogeneous, student-authored labels, per the `AD-41` suite.
> *Prevents:* a test suite that passes for the students an engineer imagined and fails for Meera.
> *Supports:* `AD-41`, `AD-21`, `D-01`, `NN-01`.
> *Exception:* none.

---

# Part 4 — Client Engineering

## 15. Frontend Standards

Two clients exist per `AD-02`: Expo/React Native as the primary surface, Next.js as the web and enhancement surface, sharing `@avora/core`. `AOQ-02` remains open on the client platform; **the rules below are written to hold under either resolution** and none of them presume the answer.

> **ENG-100 — Business logic lives in `@avora/core` or `packages/domain`, never in a component, a screen, or a route handler.**
> *Why:* `AD-02` accepts two UI implementations as a deliberate cost and states *"only presentation differs"*. Logic in a component is logic that must be written twice and will diverge once.
> *Prevents:* the mobile client and the web client disagreeing about scheduling, scope resolution, or reconciliation — a divergence students experience as data corruption.
> *Supports:* `AD-02`, `AD-33`, `EP-01`.
> *Exception:* presentation logic that is genuinely about rendering — layout arithmetic, virtualisation windows, animation state.

> **ENG-101 — The client never derives authoritative state from AI output, and never computes what the server owns.**
> *Why:* stated directly in `architecture.md` §26 — *"Mastery, scheduling, and coverage are server-derived; the client displays them"* — and reinforced by `architecture.md` §45.9, which rejects client-authoritative mastery because a manipulated or buggy client could corrupt the signals driving planning and insights.
> *Prevents:* integrity loss in the signals that `FR-121` and `FR-103` depend on.
> *Supports:* `AD-23`, `architecture.md` §26, §45.9.
> *Exception:* the local scheduler computes card ordering for responsiveness (`AD-23`), which is explicitly a *presentation* decision reconciled against server authority. This is the one sanctioned case and it is already designed.

> **ENG-102 — Every list that can exceed one screen is virtualised, and every image is sized and lazily loaded.**
> *Why:* `NFR-052` targets low-end Android; `architecture.md` §38 names virtualised lists as the named mechanism. The Dashboard alone carries eight modules on one scroll (design §1).
> *Prevents:* dropped frames and memory pressure on precisely the devices the beachhead uses.
> *Supports:* `NFR-052`, `NFR-001`, `NFR-002`.
> *Exception:* lists with a documented hard maximum below one screen — for example the six Quick Actions (design `Rule HM-05`).

> **ENG-103 — Performance budgets are enforced in CI and a breach fails the build.**
> *Why:* `architecture.md` §38 — *"Performance budgets are enforced in CI, not measured after regression."* A budget checked after release is a report.
> *Prevents:* the gradual bundle growth that only becomes visible when cold start crosses the `NFR-001` three-second threshold on a mid-range device.
> *Supports:* `NFR-001`, `NFR-052`, `architecture.md` §38.
> *Exception:* none. A justified budget increase is a reviewed change to the budget, with the reason recorded.

---

## 16. React Standards

> **ENG-105 — Function components and hooks only. No class components, no HOC layering, no render props.**
> *Why:* one idiom, consistently applied, is the `AG-10` property. Three idioms mean an agent must infer which is current.
> *Prevents:* mixed-paradigm code where lifecycle behaviour is spread across incompatible mechanisms.
> *Supports:* `AG-10`, consistency.
> *Exception:* an error boundary, which the platform still requires as a class. It is the only one.

> **ENG-106 — A component either fetches data or renders it, never both, and the split is visible in the file structure.**
> *Why:* `AD-28` separates four state categories precisely so that each is managed with the right tool. A component that fetches and renders cannot be tested with fixture data and cannot be reused on the other client.
> *Prevents:* untestable UI; duplicated fetching; the waterfall pattern where nested components each trigger their own request on a mobile connection.
> *Supports:* `AD-28`, `AD-02`, §56.
> *Exception:* a screen-level composition may own its top-level query, which is the container half of this split.

> **ENG-107 — Effects are for synchronising with external systems, never for deriving state.**
> *Why:* derived state in an effect is a second render pass and a source of flicker, which directly costs `NFR-002`'s 100 ms perceptible-response requirement.
> *Prevents:* the state-sync bug class; stale renders; the "why did this render three times" investigation.
> *Supports:* `NFR-002`, `AD-28`.
> *Exception:* none. Derive during render; memoise if measured to matter.

> **ENG-108 — Every effect declares its cleanup, and every subscription is torn down.**
> *Why:* the client holds realtime subscriptions (`architecture.md` §26), streaming responses, upload progress listeners, and a global upload queue that *survives navigation, backgrounding, and app restart* (`architecture.md` §7.1). Leaks here are not cosmetic.
> *Prevents:* memory growth and duplicate subscriptions across navigation on long study sessions.
> *Supports:* `NFR-052`, `FR-036`.
> *Exception:* none.

> **ENG-109 — Optimistic updates are permitted only where the server outcome is deterministic, and never for AI generation.**
> *Why:* stated directly in `architecture.md` §26 — permitted for creating a note, correcting a classification, grading a card; *"never used for AI generation, where the outcome is genuinely unknown"*.
> *Prevents:* showing a student a result that then changes or disappears, which is a trust cost far exceeding the latency saved.
> *Supports:* `architecture.md` §26, `NFR-002`, `PR-06`.
> *Exception:* none.

> **ENG-110 — No client-side data transformation that the server could have shaped, and no rendering of a raw domain object.**
> *Why:* transformation duplicated across two clients diverges; and a raw domain object rendered directly means the component depends on schema shape rather than a view contract.
> *Prevents:* mobile and web presenting the same data differently; schema changes breaking UI silently.
> *Supports:* `AD-02`, `EP-01`, `AG-10`.
> *Exception:* purely presentational formatting — dates, plurals, number formatting — which belongs in `@avora/core` formatters shared by both clients (and which `AX-22` requires to route through the message catalogue).

---

## 17. State Management

`AD-28` is binding and complete: **four state categories, four mechanisms, no overlap.** Server state in TanStack Query; persistent local state in on-device SQLite (mobile) or IndexedDB (web); ephemeral UI state in component state or a small Zustand store; realtime state written directly into the query cache.

> **ENG-112 — Server state is never mirrored into a global store.**
> *Why:* `architecture.md` §26 states it directly. Mirroring creates two sources of truth with no reconciliation rule, and `architecture.md` §26 identifies the root cause: *"Most frontend complexity comes from managing one category with the tool for another."*
> *Prevents:* stale-data bugs that are irreproducible because they depend on navigation order.
> *Supports:* `AD-28`.
> *Exception:* none.

> **ENG-113 — Query keys are derived from domain identity, defined once in `@avora/core`, and never constructed inline.**
> *Why:* `architecture.md` §26 — keys are defined once *"so client and server agree"*, which makes invalidation on a domain event *"a mechanical mapping from event to key set"*.
> *Prevents:* the invalidation miss — the bug where an artifact becomes ready and one surface never learns.
> *Supports:* `AD-28`, `AD-27`, `FR-036`.
> *Exception:* none.

> **ENG-114 — Realtime messages update the query cache; they never populate a parallel state tree.**
> *Why:* `architecture.md` §26 — *"Job progress and artifact readiness arrive as cache updates, not as a parallel state tree."*
> *Prevents:* two representations of job state disagreeing on screen, which is directly visible to a student watching an upload.
> *Supports:* `AD-28`, `FR-036`.
> *Exception:* none.

> **ENG-115 — The Zustand store holds ephemeral UI state only, and never anything that must survive a process restart.**
> *Why:* the four categories have different durability requirements. Anything that must survive restart is persistent local state and belongs in the typed local store — which per `architecture.md` §27.2 has eviction rules that explicitly protect the outbox and unsynced work.
> *Prevents:* loss of student intent on app kill, which `NFR-015` prohibits.
> *Supports:* `AD-28`, `AD-29`, `NFR-015`.
> *Exception:* none.

---

## 18. Data Fetching

> **ENG-117 — Every read is a typed contract call. There is no untyped fetch anywhere in either client.**
> *Why:* `architecture.md` §8.2 makes the API contract-first with shared types, so that *"contract drift is a compile error, which is a direct `AG-10` benefit for coding agents."*
> *Prevents:* runtime shape mismatches that reach a student rather than a build.
> *Supports:* `architecture.md` §8.2, `AG-10`.
> *Exception:* none.

> **ENG-118 — Pagination is cursor-based, always, on every list.**
> *Why:* `architecture.md` §8.2 — *"Offset pagination on a graph that grows for years is a latency time bomb"*, and `D-06` guarantees the graph is never reset.
> *Prevents:* the slow degradation of list endpoints across terms, which arrives exactly when a student has the most data and the most at stake.
> *Supports:* `architecture.md` §8.2, `D-06`, `NFR-002`.
> *Exception:* fixed-size, bounded collections with an enforced maximum — a review session queue, the six quick actions.

> **ENG-119 — The client subscribes to job progress; it never polls.**
> *Why:* `architecture.md` §8.2 and §7.3 — *"Polling on mobile data is a battery and cost tax; push is correct."*
> *Prevents:* battery and data cost on metered connections in the beachhead market.
> *Supports:* `FR-036`, `NFR-006`, `architecture.md` §7.3.
> *Exception:* a bounded reconciliation fetch on app foreground, to recover state missed while the socket was down. That is reconciliation, not polling, and it runs once.

> **ENG-120 — Documents and media are fetched by short-lived signed URL direct from storage, never proxied through the application tier.**
> *Why:* `architecture.md` §7.3 and §13.3. Proxying adds latency, cost, and an unnecessary place for content to exist.
> *Prevents:* application-tier bandwidth costs and a second copy of student content in a log-adjacent runtime.
> *Supports:* `architecture.md` §13.3, `NFR-002`, `NFR-036`.
> *Exception:* none.

> **ENG-121 — Every mutation that can exceed 300 ms returns a job handle, and the client is written to expect one.**
> *Why:* `EP-03` and `architecture.md` §8.2 — *"Every expensive command returns a job handle, not a result."*
> *Prevents:* a client that assumes synchronous completion, which is the design that makes `NN-05` impossible to satisfy later without a rewrite.
> *Supports:* `NN-05`, `EP-03`, `FR-036`.
> *Exception:* none.

---

## 19. Design System Compliance

`DESIGN-SYSTEM.md` is the canonical visual language. This section adds no visual rules. It states the engineering obligations that make the design system enforceable, and the prohibitions that keep it from being quietly re-litigated in code.

> **ENG-123 — Engineers and AI coding agents never redesign an approved interface. Reuse the component; follow the spacing, typography, motion, navigation and interaction rules as specified.**
> *Why:* the design system's own success test (§0.1) is that *"a new feature built from this document alone… should look like it shipped on the same day as the Dashboard."* Local redesign, however well-intentioned, is the failure of that test.
> *Prevents:* the accumulation of near-miss variants that make a product feel assembled rather than designed.
> *Supports:* design §0.1, `Rule FS-01`, `Rule CP-01`.
> *Exception:* a change proposed through the design system's own amendment path (design §44.2 — *amended by pull request with a changelog entry*). Never in a feature pull request.

> **ENG-124 — No colour, size, radius, duration, font value, shadow, or spacing value is ever hard-coded. Tokens only, and only Tier 2 semantic tokens.**
> *Why:* design `Rule T-01` and §11.1 — *"A component that hard-codes a colour, a radius, a duration, or a font size is a defect regardless of whether it looks correct"* — because `NFR-051` contrast is *"a property of the token set, not per-component decisions"* (`architecture.md` §7.5).
> *Prevents:* accessibility regressions invisible to review; and the foreclosure of a light theme, which `Rule FS-02` says must remain a token exercise.
> *Supports:* `NFR-051`, design `Rule T-01`, `Rule T-02`, `Rule FS-02`, design §42 checks 8 and 9.
> *Exception:* none. If a token does not exist, per design §44.3 rule 2, **stop and ask** — do not introduce a value.

> **ENG-125 — No component branches on theme.**
> *Why:* design `Rule TH-05` — *"If a component needs to know the theme, a semantic token is missing."*
> *Prevents:* theme logic scattering across the component tree, which is what makes a theme change a codebase change rather than a token change.
> *Supports:* design `Rule TH-05`, `Rule T-01`, `Rule FS-02`.
> *Exception:* none.

> **ENG-126 — No component, string, prop, or fixture hard-codes a structure label.**
> *Why:* design `Rule N-06` is, per design §44.3 rule 3, *"the rule most likely to be violated by pattern-matching from an example, and the most damaging when it is."* An engineer copying a Dashboard example that says "Unit 3" into a new component reproduces the violation faithfully.
> *Prevents:* the Meera-test failure — a subject whose units are called "Experiment 7" rendering incorrectly.
> *Supports:* `NN-01`, `D-01`, design `Rule N-06`, `Rule ST-01`, `DP-04`.
> *Exception:* none. Fixtures deliberately use heterogeneous labels, including student-authored ones, per the `AD-41` suite.

> **ENG-127 — Insight, progress, and error copy is taken from the reviewed content catalogue. Engineers and agents do not author it.**
> *Why:* `architecture.md` §7.4 — *"Progress and insight components accept copy only from a reviewed content catalogue; ad-hoc strings are rejected in review. Tone is a component contract, not an author's choice."* `FR-125` and `RAI-06` prohibit shaming, loss-framing and manufactured urgency, and design §6.2 shows how easily well-meant copy violates them.
> *Prevents:* the exact defects design §6.4 records in production today — a training claim that contradicts `NFR-043`, and a streak string that is loss-framing under `RAI-06`.
> *Supports:* `FR-125`, `RAI-06`, `RAI-07`, `NFR-054`, design §6, `architecture.md` §7.4.
> *Exception:* none. New copy is proposed to the catalogue, reviewed, then used.

> **ENG-128 — All user-facing strings live in the message catalogue with ICU pluralisation, from the first commit.**
> *Why:* `architecture.md` §7.5 — the catalogue costs almost nothing now and *"retrofitting i18n after launch is an expensive, error-prone migration"*, even though multi-language ships at V2. Design `AX-22` repeats the obligation.
> *Prevents:* a V2 migration touching every surface; and layouts that cannot absorb the +40% expansion `AX-23` requires.
> *Supports:* `PR-13`, `NFR-054`, design `AX-22`, `AX-23`, `architecture.md` §7.5.
> *Exception:* none. Developer-facing strings — log messages, error codes — are not user-facing and are exempt, subject to `NN-09`.

> **ENG-129 — Every new or changed surface passes the twenty checks in `DESIGN-SYSTEM.md` §42 and the New Surface Checklist in Appendix B before review is requested.**
> *Why:* design §42 states the property plainly: *"A surface passing all twenty will look like Avora; a surface failing three or more will not."* Design §44.3 rule 7 makes this an explicit agent obligation.
> *Prevents:* review cycles spent on checkable items, which crowds out review attention for the items that need judgement.
> *Supports:* design §42, Appendix B, `AG-10`.
> *Exception:* none. Automatable checks (8, 9, 14, 15, 16, 17) are CI-enforced; the rest are self-certified in the pull request and spot-checked in review.

---

## 20. Mobile Standards

`AD-02` makes the mobile client the primary surface; `AOQ-02` is open on the platform and `DQ-04` records the same question from the design side. **These rules hold under either resolution.**

> **ENG-131 — The device matrix is a release gate, not a smoke test.**
> *Why:* `NFR-052` *"requires verified low-end device behaviour, not assumed behaviour"* (`architecture.md` §7.2), and §42.1 makes the Firebase Test Lab low-end Android matrix a pre-release gate. Design `AX-29` requires verification on a real low-end device, *"not on a simulator"*.
> *Prevents:* shipping a build that is fine on an engineer's phone and unusable on the beachhead's.
> *Supports:* `NFR-052`, `architecture.md` §42.1, design `AX-29`.
> *Exception:* none.

> **ENG-132 — The upload intake queue is a global client service, not a screen-scoped component.**
> *Why:* `architecture.md` §7.1 states it as a binding constraint: upload *"survives navigation, backgrounding, and app restart"*, because `PRD §22.1` makes upload a globally available action that must not be nested in navigation (design `Rule N-04`).
> *Prevents:* the loss of queued uploads on navigation — which, per `architecture.md` §27, would damage *"the single most important offline behaviour"*, the upload-on-receipt habit.
> *Supports:* `FR-030`–`FR-032`, `FR-037`, `NFR-006`, design `Rule N-04`.
> *Exception:* none.

> **ENG-133 — Every long-running client operation survives backgrounding, and none requires the app to stay in the foreground.**
> *Why:* `NFR-006`, named in `architecture.md` §7.2 as one of the five requirements that drove the native-client decision.
> *Prevents:* an upload that fails because a student locked their phone — a common, unremarkable act.
> *Supports:* `NFR-006`, `FR-037`, `AD-02`.
> *Exception:* none.

> **ENG-134 — Tokens are stored in platform secure storage — iOS Keychain, Android Keystore — never in application storage or async storage.**
> *Why:* `architecture.md` §11.3 specifies it, to prevent JS-accessible token theft.
> *Prevents:* session theft from a compromised bundle or a shared device.
> *Supports:* `NFR-035`, `architecture.md` §11.3.
> *Exception:* none.

> **ENG-135 — Every interactive target is at least 44 dp with 8 dp separation, achieved with padding where the visual is smaller.**
> *Why:* design `AX-08` and `AX-09`, which single out the flashcard grading row and the bottom navigation as the places *"where mis-taps have the highest cost"*.
> *Prevents:* a wrong grade recorded in a review session — which, because attempts are immutable (`AD-07`), is a permanent entry in the mastery record.
> *Supports:* `NFR-051`, design `AX-08`, `AX-09`, `Rule SZ-01`.
> *Exception:* none.

> **ENG-136 — The local store enforces a budget with LRU eviction that can never evict the outbox, local note buffers, or card states with unsynced attempts.**
> *Why:* `architecture.md` §27.2 states it exactly, and adds *"Eviction of unsynced student work is prohibited by construction."*
> *Prevents:* silent loss of student work on a storage-constrained device — an `NFR-015` and `NN-06` violation that would be nearly undetectable in support.
> *Supports:* `NN-06`, `NFR-015`, `NFR-052`, `AD-29`.
> *Exception:* none.

---

## 21. Offline and Synchronisation

`AD-29` bounds the scope: **Avora is offline-capable, not local-first in the general case.** The capability table in `architecture.md` §27 is canonical.

> **ENG-138 — The outbox carries intent, not state.**
> *Why:* `architecture.md` §27.1 identifies this as *"The design choice that makes this tractable"* — the outbox records *what the student did*, not what the state became, so most merges are set unions with no conflict resolution at all.
> *Prevents:* the conflict-resolution problem entirely for attempts, uploads and card states; and the silent loss of review history that syncing card states would cause (`AD-23`).
> *Supports:* `AD-23`, `AD-29`, `AD-07`, `FR-085`.
> *Exception:* none.

> **ENG-139 — Every queued mutation carries an idempotency key and is safe to replay.**
> *Why:* `EP-04` — retries are assumed. `FR-037` requires resume *"without data loss or silent duplication"*.
> *Prevents:* duplicate attempts, duplicate uploads, duplicate notes after a flaky reconnect.
> *Supports:* `EP-04`, `FR-037`, `AD-26`.
> *Exception:* none.

> **ENG-140 — Note conflicts are surfaced as revisions, never resolved by last-write-wins.**
> *Why:* `architecture.md` §27.1 — note editing from two devices is *"the one genuine conflict case"*, and both `NFR-015` and the PRD's Appendix C item 6 forbid destroying student-authored content. The server keeps both and surfaces the divergence.
> *Prevents:* the silent destruction of a student's writing, which is `NN-06`.
> *Supports:* `NN-06`, `NFR-015`, `architecture.md` §27.1.
> *Exception:* none.

> **ENG-141 — Every offline-capable surface renders the offline state defined in `DESIGN-SYSTEM.md` §28.5, stating what works, what is queued, and what needs a connection.**
> *Why:* `NFR-053` requires *useful* degradation, and design §28.1 makes offline one of the six mandatory states. Silence is not degradation.
> *Prevents:* a student assuming their work is saved when it is queued, or assuming it is lost when it is not.
> *Supports:* `NFR-053`, `NFR-014`, `DP-06`, design §28.5.
> *Exception:* none.

---

# Part 5 — Server and Data

## 22. Backend Standards

`architecture.md` §8.1 fixes the layering: **route handler → contract → policy → domain service → repository / ports**, with domain events written to the outbox in the same transaction as the state change. The rules below make that layering enforceable rather than aspirational.

> **ENG-150 — Route handlers validate, resolve identity, delegate, and serialise. They contain no business logic.**
> *Why:* stated as a binding rule in `architecture.md` §8.1. Logic in a handler is logic that cannot be reached by a worker, a job, or the other client.
> *Prevents:* the same rule existing in two places with one copy out of date — the usual origin of "it works on web but not on mobile".
> *Supports:* `architecture.md` §8.1, `EP-01`.
> *Exception:* none. A handler longer than about forty lines is almost always in violation.

> **ENG-151 — Domain services never touch HTTP and never touch a vendor SDK.**
> *Why:* `architecture.md` §8.1 — vendors are reached through ports. A domain service that knows about a request object cannot be called from a worker; one that knows about a vendor cannot be tested or replaced.
> *Prevents:* `AG-06` erosion; untestable domain logic.
> *Supports:* `architecture.md` §8.1, `AG-06`, `EP-01`.
> *Exception:* none.

> **ENG-152 — Repositories execute as the student's role so that RLS applies to ordinary application traffic.**
> *Why:* `architecture.md` §8.1 and §12.2. Layer 5 is *"the boundary that matters"*: if layers 1–4 all contained bugs simultaneously, RLS would still prevent cross-student access — but only if the query actually runs under the student's role.
> *Prevents:* the entire class of cross-student data exposure that `R-30` rates Critical.
> *Supports:* `NN-04`, `NFR-031`, `AG-04`, `AD-11`.
> *Exception:* the worker plane, under the strict conditions of `ENG-153`.

> **ENG-153 — Service-role credentials exist only in the worker plane. Every service-role operation asserts the owning `student_id` explicitly, on every read and every write.**
> *Why:* `AD-11` states it and gives the concrete rule: a worker *"never queries 'the next chunk to embed' globally and then writes wherever the result points. It loads a job, reads the `student_id` from the job record, and performs every subsequent read and write with that `student_id` as an explicit predicate."* The ownership check is not skipped because RLS is bypassed — it is moved into the worker and made explicit.
> *Prevents:* the highest-severity failure available in this system: a worker writing one student's derived data into another student's graph.
> *Supports:* `NN-04`, `AD-11`, `NFR-031`, `NFR-032`.
> *Exception:* none. A service-role key present in the Vercel client-facing runtime is a production incident, not a configuration choice.

> **ENG-154 — Domain events are written to the outbox in the same transaction as the state change.**
> *Why:* `AD-27` — this makes *"the row committed but the job never ran"* impossible, and eliminates the dual-write problem entirely.
> *Prevents:* orphaned state (a resource that is uploaded but never ingested) and phantom events (a job for a transaction that rolled back).
> *Supports:* `AD-27`, `EP-04`, `NFR-010`.
> *Exception:* none. Publishing directly to a queue from a domain service is prohibited (`ENG-025`).

> **ENG-155 — No synchronous code path may exceed 300 ms under any input.**
> *Why:* `EP-03` and `architecture.md` §47.1 rule 7 — if it can exceed 300 ms, enqueue a job.
> *Prevents:* `NN-05` violations, and the tail-latency failures that appear only under exam-period load.
> *Supports:* `NN-05`, `EP-03`, `NFR-002`, `NFR-006`.
> *Exception:* streaming responses, which are latency-bound rather than duration-bound (`AD-03`, `architecture.md` §8.3).

---

## 23. API Design

> **ENG-156 — Every endpoint has a request and response schema in `@avora/core`, and clients import the same types.**
> *Why:* `architecture.md` §8.2 — typed and contract-first, so that *"contract drift is a compile error"*.
> *Prevents:* the runtime shape mismatch, and the untyped-endpoint precedent that makes the next one easier.
> *Supports:* `architecture.md` §8.2, `AG-10`, `NFR-060`.
> *Exception:* none.

> **ENG-157 — Command/query split by convention: queries are `GET`, cacheable and idempotent; commands are `POST`, carry an `Idempotency-Key`, and return a result or a job handle.**
> *Why:* `architecture.md` §8.2. The convention is what makes cacheability, retry safety and job semantics inferable from the method rather than from documentation.
> *Prevents:* a retried command double-charging a budget, double-creating a note, or double-enqueuing an expensive generation.
> *Supports:* `EP-04`, `architecture.md` §8.2, `BM-02`.
> *Exception:* none.

> **ENG-158 — Errors are structured: a stable machine code, a plain-language message, and a recovery action.**
> *Why:* `architecture.md` §8.2, satisfying `NFR-014` and `NFR-054`. Design `Rule ER-01` forbids apologising, blaming, or exposing internals, and `ErrorState` requires a `recoveryAction` prop — which the API must be able to supply.
> *Prevents:* the client being structurally unable to render an honest error because the server did not send one.
> *Supports:* `NFR-014`, `NFR-054`, design `Rule ER-01`, `ENG-034`.
> *Exception:* none. An error without a recovery action is an incomplete error.

> **ENG-159 — Machine error codes are stable, namespaced, and never reused with a different meaning.**
> *Why:* clients branch on them, and the mobile client is store-distributed — an old build will be in students' hands for weeks after a change.
> *Prevents:* an old client mis-handling a reused code, which presents to the student as nonsense.
> *Supports:* §69 (backward compatibility), `NFR-014`.
> *Exception:* none. Retiring a code is additive: introduce the new one, keep the old one until client telemetry shows it unused.

> **ENG-160 — Entitlement and quota are checked before work is scheduled, never after it is done.**
> *Why:* `architecture.md` §5.4 — *"This is what makes free-tier cost bounded rather than measured (`BM-02`)."* §31.2 repeats it: free-tier cost is *"bounded by enforcement, not observed by reporting."*
> *Prevents:* the unbounded free-tier liability that `R-11` rates Critical.
> *Supports:* `BM-02`, `NFR-022`, `R-11`, `architecture.md` §31.2.
> *Exception:* none.

> **ENG-161 — Request bodies are parsed strictly. Unknown fields are rejected, and no object is constructed by spreading client input.**
> *Why:* `architecture.md` §12.2 layer 3 names mass assignment explicitly. A spread of client input into a domain object is how a client sets `student_id`, `provenance`, or `confidence`.
> *Prevents:* privilege and provenance forgery — including forging `provenance: 'student'` on AI output, which would defeat `NN-08`.
> *Supports:* `NN-08`, `NFR-031`, `NFR-033`, `architecture.md` §12.2.
> *Exception:* none.

> **ENG-162 — Student identity is derived from the verified session and passed as the database role context. It is never read from a body parameter, a query string, or a header the client controls.**
> *Why:* `architecture.md` §5.4 states this as a binding property of the request lifecycle: *"The student identity is never optional and never inferred from a body parameter."*
> *Prevents:* trivial cross-student access — the failure `NFR-031` exists to make impossible.
> *Supports:* `NN-04`, `NFR-031`, `AG-04`.
> *Exception:* none.

---

## 24. Database Standards

The Academic Graph is the durable core (`EP-01`). Schema changes are the slowest, most reviewed changes in the codebase, and the rules reflect that.

> **ENG-163 — `student_id` is a mandatory, non-null, indexed column on every student-scoped table, and is first in composite indexes on hot paths.**
> *Why:* `architecture.md` §8.4 makes this deliberately more explicit than deriving ownership through joins: *"it makes every policy a single-column comparison, keeps policies cheap to evaluate, and makes ownership auditable by inspection."* §9.4 aligns index order with RLS predicates so policy evaluation is index-assisted.
> *Prevents:* expensive policy evaluation, and ownership that can only be determined by reading application code.
> *Supports:* `NN-04`, `NFR-031`, `architecture.md` §8.4, §9.4.
> *Exception:* global reference data — `structure_templates` (`architecture.md` §10.4) — which is explicitly not student data and sits outside RLS and outside the deletion cascade.

> **ENG-164 — Referential integrity is enforced by foreign keys; enumerable invariants are check constraints. Application code is not the integrity layer.**
> *Why:* `EP-02` — *"Application-layer validation is a usability feature; the database is the security boundary."*
> *Prevents:* orphaned rows and impossible states arriving through a code path nobody thought about — a backfill, a worker, a manual fix.
> *Supports:* `EP-02`, `AG-04`.
> *Exception:* constraints that would require a lock incompatible with `NFR-011` during a term are introduced as `NOT VALID` and validated in a later window (§26).

> **ENG-165 — Derived data is marked as derived, is versioned by the strategy that produced it, and is regenerable from originals plus attempts.**
> *Why:* `architecture.md` §9.1 point 4 and `AD-06` — this *"bounds the blast radius of any model change or bug"*, and `AD-40` makes derived data a rebuild target rather than a backup target.
> *Prevents:* an OCR improvement or embedding upgrade becoming a destructive rewrite instead of a controlled backfill with a rollback path.
> *Supports:* `AD-06`, `AD-40`, `NFR-061`, `AG-06`.
> *Exception:* none. A new derived artefact type without a version column is an incomplete design.

> **ENG-166 — Provenance is a first-class column on every artifact: `ai`, `student`, or `co_created`, plus the model version and prompt version that produced it.**
> *Why:* `architecture.md` §9.1 point 5, satisfying `FR-073`, `FR-143` and `AIR-010`. §14.5 adds the operational reason: *"This is what makes a quality regression diagnosable rather than mysterious."*
> *Prevents:* unlabelled AI content (`NN-08`); and an undiagnosable quality regression after a prompt or model change.
> *Supports:* `NN-08`, `FR-143`, `AIR-010`, `RAI-01`, `architecture.md` §14.5.
> *Exception:* none.

> **ENG-167 — Attempts are append-only. `review_attempts` and `quiz_attempts` are never updated or deleted outside the deletion subsystem.**
> *Why:* `AD-07` — attempts are immutable event records and mastery is a materialised derivation. `architecture.md` §9.3 states the payoff: *"When the mastery model improves — and it will — history is replayed rather than lost."* `AD-23` adds that this is what makes offline sync a conflict-free set union.
> *Prevents:* the loss of review history; and the reintroduction of conflict resolution into the sync model.
> *Supports:* `AD-07`, `AD-23`, `FR-096`, `NN-06`.
> *Exception:* none outside the deletion cascade (§50).

> **ENG-168 — Every citation-bearing relation is a foreign key to `chunks`. No table, DTO, cache entry, export or analytics property may store a citation as free text.**
> *Why:* `architecture.md` §9.2 makes this the *"schema-level enforcement of `AIR-006`"*, and §45.8 explains why the alternative is fatal: if a citation is a string the model produced, *"'fabricated citation' is indistinguishable from 'correct citation' without a separate resolution step, and `AIR-006` becomes unenforceable."*
> *Prevents:* the severity-one defect class, at the layer where it is cheapest to prevent.
> *Supports:* `NN-11`, `AIR-006`, `AIR-002`, `architecture.md` §45.8.
> *Exception:* none.

> **ENG-169 — Every column holding student data carries a classification and a stated purpose in the schema.** Classifications: `identity`, `academic_content`, `derived_artifact`, `behavioural`, `operational`.
> *Why:* `AD-37` — a new column without a classification and purpose fails CI, which makes `NFR-040` (minimisation) and `NFR-041` (documented purpose) *"continuously true rather than periodically audited"*, and makes `docs/PRIVACY.md` a build artefact rather than a document that drifts.
> *Prevents:* the privacy notice diverging from the schema, and the accumulation of data with no stated purpose.
> *Supports:* `AD-37`, `NFR-040`, `NFR-041`, `FR-141`.
> *Exception:* none. This is `architecture.md` §47.1 rule 4.

> **ENG-170 — Queries are parameterised. String-built SQL is prohibited, including in migrations, backfills, and analytics scripts.**
> *Why:* `architecture.md` §36.1 lists injection as a High-impact threat with *"Parameterised queries only"* as the control.
> *Prevents:* SQL injection, including through the many free-text fields the product deliberately has — `structure_type_label`, titles, note bodies, search queries.
> *Supports:* `NFR-033`, `architecture.md` §36.1.
> *Exception:* none.

> **ENG-171 — Vector search always pre-filters by `student_id` and scope before searching; it never searches globally and filters after.**
> *Why:* `AD-19` — post-filtering is *"both a correctness hazard… and a privacy hazard (cross-tenant vectors participating in the same search)."* Pre-filtering is also what keeps a single Postgres sufficient (`AS-01`, `AS-02`).
> *Prevents:* cross-tenant vector participation, and relevant in-scope content being pushed out of the candidate set.
> *Supports:* `NN-04`, `AD-19`, `NFR-031`, `NFR-005`.
> *Exception:* none.

---

## 25. Supabase Development Rules

> **ENG-172 — RLS is enabled with no permissive policy on every student-scoped table before any column is added to it.**
> *Why:* `architecture.md` §12.3 — deny by default, because *"A new table without a policy is unreadable, which is the correct failure mode."*
> *Prevents:* the window between table creation and policy authoring, which is where a forgotten policy lives forever.
> *Supports:* `NN-04`, `NFR-031`, `architecture.md` §12.3.
> *Exception:* none.

> **ENG-173 — Policies are single-predicate (`student_id = auth.uid()`) and separate per operation: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.**
> *Why:* `architecture.md` §12.3 — cheap, index-assisted, auditable by inspection; and separate policies because *"a student may read a derived artifact they may not directly write."*
> *Prevents:* a permissive `ALL` policy granting write access to derived tables that only the service role should write.
> *Supports:* `NN-04`, `architecture.md` §12.3.
> *Exception:* the share projection path, which reads through a grant-scoped view (`architecture.md` §12.5) rather than a student-ownership predicate.

> **ENG-174 — Derived and system-written tables are student-readable and service-writable only.**
> *Why:* `architecture.md` §12.3. Embeddings, mastery signals and coverage snapshots are computed by the system; a client-writable path to them is a path to forged mastery.
> *Prevents:* the integrity failure `architecture.md` §45.9 rejects — a manipulated client corrupting the signals that drive planning and insights.
> *Supports:* `NN-04`, `AD-07`, `architecture.md` §45.9.
> *Exception:* none.

> **ENG-175 — A new student-scoped table ships with negative-authorisation tests, or the build fails.**
> *Why:* `architecture.md` §12.3 and §42.1 — a dedicated suite attempts every cross-student access pattern against every table on every CI run, and *"a table without these tests fails the build."* `architecture.md` §47.1 rule 3 states it as an agent rule.
> *Prevents:* an RLS policy that exists but is wrong — which is indistinguishable from a correct one without a negative test.
> *Supports:* `NN-04`, `NFR-031`, `architecture.md` §42.1.
> *Exception:* none.

> **ENG-176 — Storage paths begin with `student_id`, and every read is a short-lived signed URL issued after an ownership check. No public buckets, no long-lived URLs.**
> *Why:* `architecture.md` §13.1 and §13.3. Putting `student_id` first *"lets storage policies enforce ownership on the path itself, giving the storage layer the same single-predicate property as the database."* Short TTLs also bound the residual access window after share revocation (§12.5).
> *Prevents:* insecure direct object reference on stored files, and unbounded access after a revoked share.
> *Supports:* `NN-04`, `AG-04`, `FR-132`, `architecture.md` §13.3.
> *Exception:* none.

> **ENG-177 — Edge Functions handle only short, data-adjacent work: webhook receipt, signed URL issuance, lightweight triggers. Long-running work runs on the container worker plane.**
> *Why:* `AD-08` — serverless request functions and Edge Functions impose execution ceilings, cold-start variance and memory limits that make multi-minute document work unreliable, and *"Retrying a 90-second job because a platform limit was hit is both a cost defect (`BM-03`) and a reliability defect (`NFR-013`)."*
> *Prevents:* ingestion failures on exactly the large scanned documents that matter most — `R-01` is the highest-rated product risk.
> *Supports:* `AD-08`, `NFR-004`, `R-01`, `BM-03`.
> *Exception:* none.

---

## 26. Migrations

> **ENG-178 — Migrations are versioned SQL in the repository, applied through CI, never by hand.**
> *Why:* `architecture.md` §9.5. A hand-applied migration exists in production and nowhere else.
> *Prevents:* environment divergence, and a schema whose history cannot be replayed into a preview environment.
> *Supports:* `architecture.md` §9.5, §33.1.
> *Exception:* none. Emergency changes are still written as migrations and merged immediately after.

> **ENG-179 — Expand/contract only: add nullable, backfill, dual-write, switch reads, then drop. No migration takes a lock that would breach `NFR-011` during a term.**
> *Why:* `architecture.md` §9.5. The clients are store-distributed and long-lived; a migration that assumes all readers upgrade simultaneously is wrong on mobile by construction.
> *Prevents:* availability breaches during a term, and old app builds crashing against a new schema.
> *Supports:* `NFR-011`, §69, `architecture.md` §9.5.
> *Exception:* none.

> **ENG-180 — Every migration is paired with a tested rollback, or an explicit reviewed statement that it is irreversible.**
> *Why:* `architecture.md` §9.5 and §33.2 (CI checks a rollback plan is present).
> *Prevents:* discovering during an incident that the way back was never designed.
> *Supports:* §59, `NFR-011`.
> *Exception:* none. "Irreversible" is a valid answer; "unspecified" is not.

> **ENG-181 — No destructive migration runs during an academic examination window.**
> *Why:* `R-31` and `AD-34` — release freezes during examination windows for institutions in the active cohort, *"encoded in CI, not a thing someone remembers."* `architecture.md` §39.3 rates availability failure during an exam period as the single most damaging operational event possible.
> *Prevents:* the worst-timed outage available to this product.
> *Supports:* `AD-34`, `R-31`, `NFR-012`.
> *Exception:* an emergency fix with an explicit override and a named approver, per `AD-34`.

> **ENG-182 — A re-extraction, re-chunking, or re-embedding is a versioned backfill with a rollback path, never a destructive rewrite.**
> *Why:* `AD-06` — versioning by extractor, chunking-strategy and embedding-model version is what makes an upgrade *"a controlled backfill with a rollback path instead of a destructive rewrite."*
> *Prevents:* an OCR or embedding change becoming an unrecoverable corpus-wide event.
> *Supports:* `AD-06`, `NFR-061`, `AG-06`, `AD-40`.
> *Exception:* none.

---

## 27. Authentication

`AD-09` fixes the model: **no password credential at V0.** OAuth plus email OTP/magic link. `DQ-07` and `RE-13` record that production currently diverges (email + password); that is a product decision in flight and is not resolved here.

> **ENG-183 — Authentication is reached through `AuthPort` and Supabase Auth. No module implements its own credential handling, session issuance, or token verification.**
> *Why:* `architecture.md` §6 and `AD-09` — the cheapest way to meet `NFR-035`'s "current best practice for credential handling" is *"having no credentials to handle."* A second implementation reintroduces the surface the architecture deliberately removed.
> *Prevents:* credential storage, rotation, breach and reset surface appearing by accident.
> *Supports:* `AD-09`, `NFR-035`, `AG-06`.
> *Exception:* none.

> **ENG-184 — Access tokens are short-lived; refresh tokens rotate, are single-use, and are revoked on reuse detection.**
> *Why:* `architecture.md` §11.3, satisfying `NFR-035`.
> *Prevents:* long-lived session theft; and undetected refresh-token replay.
> *Supports:* `NFR-035`, `architecture.md` §11.3.
> *Exception:* none.

> **ENG-185 — Step-up re-authentication is required for: account deletion, data export, email change, subscription changes, bulk deletion, and sharing an entire structure unit.**
> *Why:* `FR-002`, enumerated in `architecture.md` §11.3.
> *Prevents:* a stolen session performing an irreversible or disclosing action.
> *Supports:* `FR-002`, `NFR-035`, `AD-38`.
> *Exception:* none. The list is exact; adding to it is safe, removing from it is a requirement change.

> **ENG-186 — Institution and programme live on an enrolment record with validity dates, never as columns on `students`.**
> *Why:* `AD-10` — `FR-006` requires a single continuous identity across terms *and institution changes*, so *"A student who transfers institutions keeps one identity, one Academic Graph, and full history — which is precisely the `D-06` continuity moat."*
> *Prevents:* the schema shape that would make transfer a data migration or a history loss.
> *Supports:* `AD-10`, `FR-006`, `D-06`.
> *Exception:* none.

---

## 28. Authorization

`NFR-031` is, per `architecture.md` §12.1, *"the most operationally consequential security requirement in the PRD."* Six layers exist; **layer 5 — RLS — is the boundary that matters.**

> **ENG-187 — Authorisation is never by identifier alone. An unguessable id is not an access control.**
> *Why:* the explicit wording of `NFR-031`, restated in `architecture.md` §12.1 and §47 rule 4.
> *Prevents:* insecure direct object reference, rated High in `architecture.md` §36.1.
> *Supports:* `NN-04`, `NFR-031`.
> *Exception:* none. A share link's capability token is *not* an exception: it is a grant checked for validity, expiry and revocation state (`architecture.md` §12.5), not a bare identifier.

> **ENG-188 — Sharing is a capability grant read through a projection view, never an ACL on the resource.**
> *Why:* `architecture.md` §12.5 and §30 — the exclusions of notes, mastery, attempts and conversations are *"a property of the view definition, not of a filter someone remembered to write"*, so *"A future engineer adding a field to the shared payload must edit the view, which is a reviewed change, rather than forgetting a filter."*
> *Prevents:* the accidental exposure of a sharer's private artifacts, which `FR-133` prohibits.
> *Supports:* `FR-130`–`FR-133`, `architecture.md` §12.5.
> *Exception:* none.

> **ENG-189 — Sharing is never on by default and always requires an explicit per-action consent step.**
> *Why:* `FR-131`, and `architecture.md` §30 — *"There is no 'share with class' toggle, no default-public state, no discoverability surface."* `NG-03` forbids the product becoming a social network.
> *Prevents:* the default-public drift that has damaged every product that allowed it.
> *Supports:* `FR-131`, `NG-03`.
> *Exception:* none.

> **ENG-190 — Every authorisation denial is logged as a security event.**
> *Why:* `architecture.md` §12.2 and `NFR-036` — the security and audit stream records authorisation denials, retained long, tamper-evident and append-only.
> *Prevents:* an enumeration or probing attack being invisible.
> *Supports:* `NFR-036`, `architecture.md` §35.
> *Exception:* none — subject to `NN-09`: the log records identifiers and event types, never content.

---

## 29. Background Jobs

`AD-26` is the contract: **every job is idempotent, checkpointed, resumable, and observable. A worker may be killed at any instant without data loss or duplicate effect.**

> **ENG-191 — Every job declares an idempotency key, and the key is checked at claim.**
> *Why:* `AD-26` and `EP-04`. `architecture.md` §24.1 gives the key composition per job class — for example `resource_id + content_hash`, `scope_hash + prompt_version + request_id`.
> *Prevents:* duplicate expensive work, which is simultaneously a cost defect (`BM-03`) and a correctness defect (duplicate artifacts in a student's graph).
> *Supports:* `EP-04`, `AD-26`, `FR-037`, `BM-03`.
> *Exception:* none.

> **ENG-192 — Multi-step jobs checkpoint after every expensive step.**
> *Why:* `AD-26` — *"A failure after extraction never re-runs extraction — the expensive step is never repeated for free."*
> *Prevents:* re-paying for OCR or generation because a later step failed.
> *Supports:* `AD-26`, `BM-03`, `NFR-004`.
> *Exception:* none where a step involves inference or a paid external call.

> **ENG-193 — Retries are bounded with exponential backoff and jitter, then dead-lettered. A dead letter surfaces an honest student-facing state with a recovery action.**
> *Why:* `AD-26` — *"never silent loss"* — and `NFR-014`. `architecture.md` §24.2 also requires poison-message isolation: a file that crashes a parser is quarantined for offline analysis, *"not retried indefinitely at cost"*.
> *Prevents:* infinite retry loops that burn budget; and silent job death that the student experiences as a document that never became ready.
> *Supports:* `AD-26`, `NFR-014`, `NFR-013`, `BM-03`.
> *Exception:* none.

> **ENG-194 — Every job transition writes to `job_events` and publishes on Realtime.**
> *Why:* `AD-26` and `FR-036`. Progress observability is what makes `NN-05` visible to the student rather than merely true.
> *Prevents:* the blank-progress experience that makes students re-upload, doubling cost and confusion.
> *Supports:* `NN-05`, `FR-036`, `AD-26`.
> *Exception:* none.

> **ENG-195 — Every job records its inference and compute cost against the student.**
> *Why:* `AD-26` and `AD-39` — cost per student is a first-class runtime signal, not a monthly report.
> *Prevents:* cost regressions being discovered in a finance review rather than by an alert (`BM-03`, `NFR-072`).
> *Supports:* `AD-39`, `BM-03`, `NFR-072`, `AG-07`.
> *Exception:* none.

> **ENG-196 — Every job declares a priority class from the four defined in `architecture.md` §24.3 — Interactive, Deferred, Batch, Background — and respects per-student fairness caps.**
> *Why:* `architecture.md` §24.3 — fairness caps prevent one student's bulk upload of 200 files from starving the queue, *"a real scenario — Persona 5, the class resource hub, does exactly this."* The four classes are also the load-shedding ladder for exam periods.
> *Prevents:* queue starvation, and an ad-hoc shedding decision made under pressure during the worst possible week.
> *Supports:* `AG-08`, `NFR-021`, `R-31`, `architecture.md` §39.3.
> *Exception:* none. A job without a declared class defaults to Background, which is deliberately the least useful default.

> **ENG-197 — Read paths never shed load. The shedding order is fixed: Background, then Batch, then Deferred, then Interactive generation.**
> *Why:* `architecture.md` §39.3 and `EP-06` — *"A student in exam week must always be able to open their material and their existing notes, cards, and quizzes, even if new generation is queued."*
> *Prevents:* degrading the corpus, which `EP-06` prohibits absolutely.
> *Supports:* `EP-06`, `NFR-012`, `NFR-013`, `R-31`.
> *Exception:* none.

---

## 30. Domain Events

> **ENG-198 — Event names are `domain.action`, past tense, and match the catalogue in `architecture.md` §25.2.**
> *Why:* the catalogue defines subscribers and effects. An event named outside it has no defined subscriber, which means it either does nothing or does something undocumented.
> *Prevents:* parallel event vocabularies; and invalidation logic that misses because it subscribed to a name that no longer exists.
> *Supports:* `AD-27`, `AG-10`.
> *Exception:* a new event is an architectural amendment to §25.2, proposed before it is emitted (`EP-09`).

> **ENG-199 — Event payloads carry identifiers and typed metadata. They never carry student academic content.**
> *Why:* events fan out to analytics, realtime, audit and the cost ledger (`architecture.md` §25.1). `NFR-046` and `NN-09` both apply at the far end of that fan-out.
> *Prevents:* content leaking into analytics or logs by way of an event payload — the least visible path to an `NFR-036` violation.
> *Supports:* `NN-09`, `NFR-046`, `NFR-036`, `AD-36`.
> *Exception:* none.

> **ENG-200 — Consumers are idempotent and tolerate at-least-once delivery and out-of-order arrival.**
> *Why:* `EP-04`. The outbox dispatcher guarantees delivery, not exactly-once delivery or ordering.
> *Prevents:* duplicate plan recomputations, duplicate insights (which `FR-124` rate-limits), and duplicate cost entries.
> *Supports:* `EP-04`, `AD-27`, `FR-124`.
> *Exception:* none.

> **ENG-201 — Analytics events carry only allowlisted properties from `docs/ANALYTICS.md`. Free-text properties are prohibited at the type level.**
> *Why:* `architecture.md` §25.3 — *"This is not a policy document; it is a compile-time constraint. The PostHog adapter cannot transmit a property that is not in the allowlisted schema."* A subject is reported as a discipline category, never its title; a resource as a type and size bucket, never its filename; a tutor interaction as scope level, latency, citation count and grounding outcome, never the question.
> *Prevents:* `NFR-046` violations, which are irreversible once transmitted to a third party.
> *Supports:* `NFR-046`, `NN-09`, `architecture.md` §25.3.
> *Exception:* none.

---

# Part 6 — AI Engineering

This part carries the highest defect cost in the system. `architecture.md` §41.3 places a fabricated citation delivered to a student at **SEV-1, alongside a data breach**, because `R-10` rates trust destruction from hallucination as Critical and irrecoverable. The rules here are correspondingly strict and have almost no exceptions.

## 31. AI Integration Rules

> **ENG-210 — All model access flows through the AI Gateway. No feature module holds a provider SDK, a provider key, or a model name.**
> *Why:* `AD-12`. The Gateway is the single enforcement point for budget, envelope sealing, routing, output validation, citation verification, provenance stamping and telemetry — every AI-related requirement that would otherwise be scattered across a dozen call sites.
> *Prevents:* an ungrounded, unbudgeted, unlabelled, unverified generation path existing anywhere in the product.
> *Supports:* `NN-02`, `AD-12`, `NFR-061`, all `AIR-###`.
> *Exception:* **none, including for "just a quick classification"** — `architecture.md` §47.1 rule 6 names this exact rationalisation.

> **ENG-211 — Callers declare a task, never a model.** `task: 'tutor.answer'`, `qualityTier`, and scope — never a provider or model identifier.
> *Why:* `AD-13`. `NFR-061` requires providers and versions to be replaceable *without changes to product surfaces*; `architecture.md` §14.3 states plainly that *"If a model name appears in a feature module, that requirement is already violated."*
> *Prevents:* a provider migration becoming a codebase-wide change.
> *Supports:* `NN-02`, `AD-13`, `NFR-061`, `BM-05`.
> *Exception:* none.

> **ENG-212 — Routing policy is versioned configuration, not code, and is environment-scoped and flag-gated with automatic quality-regression rollback.**
> *Why:* `AD-13` and `architecture.md` §34.4 — a routing change that degrades grounding fidelity triggers automatic rollback.
> *Prevents:* a silent quality regression shipped as a config tweak.
> *Supports:* `AD-13`, `AD-35`, `NFR-070`.
> *Exception:* none.

> **ENG-213 — Every task declares a fallback chain and a degradation outcome, and degradation never touches the corpus.**
> *Why:* `AD-14` and `EP-06`. In degraded mode: original resources available, existing notes/cards/quizzes available, keyword search available, new generation queued or honestly declined.
> *Prevents:* a provider outage presenting to a student as their material disappearing.
> *Supports:* `EP-06`, `AD-14`, `AIR-012`, `NFR-013`.
> *Exception:* none.

> **ENG-214 — The direct-provider adapter is maintained in parity with the orchestration adapter and is exercised continuously in CI and in a small percentage of production traffic.**
> *Why:* `AD-16` — *"A fallback path that has never run is not a fallback."* An orchestration layer is a deeper dependency than a model provider because it sits between Avora and every provider at once.
> *Prevents:* discovering at the moment of vendor failure that the escape hatch does not open.
> *Supports:* `AD-16`, `AG-06`, `R-12`, `D-08`.
> *Exception:* none. The `AD-16` exit test — disabling the orchestration adapter in staging and verifying every AI surface still meets its latency and quality SLOs — is a pre-launch gate.

> **ENG-215 — No code path exists from a generation surface directly to a model provider.**
> *Why:* `AIR-001` and `architecture.md` §14.1 — generation never bypasses grounding, and the generation subsystem *"cannot construct model context itself — it can only receive an assembled, validated context envelope from the grounding subsystem."*
> *Prevents:* the forbidden shortcut in the four-layer intelligence model, which is the mechanism by which an ungrounded answer reaches a student.
> *Supports:* `NN-02`, `AIR-001`, `architecture.md` §14.1.
> *Exception:* none.

---

## 32. Prompt Management

> **ENG-216 — Prompts are versioned artefacts in the repository, reviewed like code, with an id and a semantic version.**
> *Why:* `architecture.md` §14.5. Every `ai_invocations` record stores the prompt version and model version used — *"what makes a quality regression diagnosable rather than mysterious."*
> *Prevents:* an unattributable quality change; and the prompt-in-a-dashboard pattern, where the deployed behaviour has no diff and no review.
> *Supports:* `architecture.md` §14.5, `AD-35`, `NFR-070`.
> *Exception:* none.

> **ENG-217 — Prompts are assembled from typed parts. String concatenation of student content into an instruction is a prohibited pattern.**
> *Why:* `architecture.md` §14.5 and `AD-17`. `architecture.md` §47.1 rule 5 states it as an agent rule: *"Never construct model context by string concatenation. Use the six-part envelope."*
> *Prevents:* prompt injection via uploaded or shared material — `R-13`, rated High.
> *Supports:* `NN-03`, `AIR-013`, `AD-17`, `R-13`.
> *Exception:* none.

> **ENG-218 — Every prompt change runs the AI evaluation suite in CI. A change that regresses grounding fidelity or citation validity fails the build.**
> *Why:* `architecture.md` §14.5 — *"exactly like a failing unit test."* §42.3 makes citation validity a 100% gate: any failure blocks.
> *Prevents:* a prompt improvement in one dimension silently degrading another — the most common failure mode in prompt work.
> *Supports:* `AD-35`, `AIR-006`, `AIR-001`, `architecture.md` §42.3.
> *Exception:* none.

> **ENG-219 — Prompts refer to "the selected scope" and treat structure labels as runtime data. No prompt names a hierarchy level.**
> *Why:* `SM-07`, and `ENG-029`. A prompt saying "summarise this chapter" is an `NN-01` violation that no schema lint will catch.
> *Prevents:* the adaptivity thesis failing at the one layer where it is invisible to every structural test except the `AD-41` suite.
> *Supports:* `NN-01`, `SM-07`, `D-01`.
> *Exception:* none.

> **ENG-220 — Avora is the source of truth for prompt assets. An orchestration vendor may cache them; it may not own them.**
> *Why:* `architecture.md` §15.2 assigns prompt asset delivery as shared, with Avora authoritative, because *"Prompts are reviewed code."*
> *Prevents:* the production behaviour of the product living in a vendor's console.
> *Supports:* `AD-15`, `AG-06`, `architecture.md` §15.2.
> *Exception:* none.

---

## 33. Context and Grounding

`AD-17` and `architecture.md` §16.1 define the **six-part context envelope** with explicit authority levels: system policy (highest), task contract, academic frame (data), personalisation frame (data), **evidence envelope (untrusted data — zero authority)**, interaction history (low authority). The structure is canonical and is not restated.

> **ENG-221 — Student material enters model context only inside the sealed, delimited, explicitly-labelled evidence envelope, and is never interpolated into an instruction sentence.**
> *Why:* `AD-17`, the architectural answer to `AIR-013` and `R-13`.
> *Prevents:* a retrieved chunk issuing instructions to the model — including from *shared* material, which `architecture.md` §16.2 calls *"exactly the injection vector `R-13` describes."*
> *Supports:* `NN-03`, `AIR-013`, `AD-17`, `R-13`, `EP-05`.
> *Exception:* none.

> **ENG-222 — Extracted content is sanitised at ingestion, when the chunk is created — not at prompt time.** Control characters, boundary-mimicking sequences and delimiter collisions are neutralised at chunk creation; prompt-time sanitisation is a second layer, never the only one.
> *Why:* `AD-17`. Sanitising only at prompt time means every new call site must remember to do it.
> *Prevents:* envelope escape through a call site that forgot.
> *Supports:* `NN-03`, `AIR-013`, `EP-02`.
> *Exception:* none.

> **ENG-223 — No tool or function authority is granted to any request whose context contains untrusted evidence.**
> *Why:* `AD-17` — *"A retrieved chunk cannot cause a database write, an outbound call, or a state change. This is the strongest available structural mitigation and it is cheap at V0 because no tutor tool-calling is required by any V0 requirement."*
> *Prevents:* the escalation of a prompt injection from a bad answer into a state change.
> *Supports:* `NN-03`, `AIR-013`, `R-13`.
> *Exception:* **none, and this constraint must not be quietly relaxed.** `architecture.md` §43.1 point 2 states that any future tool-calling must either exclude untrusted evidence from that request context, or operate under a capability model where a retrieved chunk provably cannot influence tool selection. Introducing tools is an architectural amendment, never a feature decision.

> **ENG-224 — Context assembly is deterministic and budgeted, and the exact supplied `chunk_id` set is recorded on every invocation.**
> *Why:* `architecture.md` §16.3 step 6 — *"A model may only cite what it was given."* This record is the ground truth against which citations are verified, and it is *"the mechanism that makes `AIR-006` enforceable rather than aspirational."*
> *Prevents:* verification degrading into a plausibility check.
> *Supports:* `NN-11`, `AIR-006`, `architecture.md` §16.3.
> *Exception:* none.

> **ENG-225 — Scope resolves to an explicit chunk-id predicate before any vector operation.**
> *Why:* `AD-19`. Pre-filtering is simultaneously the correctness control, the privacy control, and the reason a single Postgres suffices.
> *Prevents:* cross-tenant retrieval and out-of-scope answers.
> *Supports:* `NN-04`, `AD-19`, `FR-051`, `NFR-031`.
> *Exception:* none.

> **ENG-226 — Retrieval insufficiency is a retrieval-side threshold decision, never a hope that the model will refuse.**
> *Why:* `architecture.md` §17.4 — *"`AIR-003` requires the system to say when the corpus cannot answer; that behaviour is produced by a retrieval-side threshold decision, not by hoping the model volunteers a refusal."* Refusal correctness is an evaluated metric measured against that threshold.
> *Prevents:* the model confabulating when the corpus is thin, which is the precise failure `A-04`'s premise depends on avoiding.
> *Supports:* `AIR-003`, `architecture.md` §17.4, §42.3.
> *Exception:* none.

> **ENG-227 — General-knowledge answers are a separate, explicitly labelled mode, entered only on an insufficiency result. Never a silent fallback.**
> *Why:* `architecture.md` §18.1 — *"a silent fallback is exactly the failure mode that destroys `A-04`'s premise."* Design `Rule RP-01` states the same rule on the UI side.
> *Prevents:* a student believing an answer came from their material when it did not.
> *Supports:* `AIR-004`, `FR-054`, design `Rule RP-01`, `AI-5`.
> *Exception:* none.

> **ENG-228 — Depth is a parameter of the task contract, always visible and always overridable by the student.**
> *Why:* `architecture.md` §16.4 — *"Personalisation that a student cannot see or override is a trust defect, and `PR-10`'s 'improves for each individual' is not licence for opacity."*
> *Prevents:* hidden adaptation, which students experience as inconsistency.
> *Supports:* `FR-056`, `AIR-009`, `PR-10`.
> *Exception:* none.

---

## 34. Response Validation

> **ENG-229 — Every citation is machine-resolved against the supplied envelope set and against stored locators before the message is marked final.**
> *Why:* `architecture.md` §16.3 and §18.1 — verification asks *"whether that exact chunk was in the envelope and whether its locator resolves to real stored content"*, not whether the citation looks plausible.
> *Prevents:* the SEV-1 defect class.
> *Supports:* `NN-11`, `AIR-006`, `AIR-002`.
> *Exception:* none.

> **ENG-230 — A response whose citations do not resolve is never shown to a student. It is blocked, logged severity-one, and either regenerated or replaced with an honest statement of inability.**
> *Why:* `AD-14` and `architecture.md` §14.4 — *"Not softened, not caveated — blocked."* `architecture.md` §34.3 alerts on **any occurrence**.
> *Prevents:* the unrecoverable brand damage `AG-02` and `R-10` describe.
> *Supports:* `NN-11`, `AIR-006`, `R-10`, `architecture.md` §41.3.
> *Exception:* **none.** There is no deadline, no demo, and no fallback that justifies relaxing this.

> **ENG-231 — Every AI output passes an output-contract validation stage before citation verification: structure, schema, and safety.**
> *Why:* `architecture.md` §14.2 stage 7, satisfying `AIR-007`, `AIR-008` and `R-14`. Assessment generation carries the strictest contract, because *"a mis-keyed or off-syllabus question is a direct quality failure the student experiences as being wrong."*
> *Prevents:* malformed structured output reaching a client that cannot render it, and invalid assessment items reaching a student.
> *Supports:* `AIR-007`, `AIR-008`, `R-14`, `architecture.md` §22.
> *Exception:* none.

> **ENG-232 — Generated assessment items are validated for answerability against the supplied evidence, key correctness, and distractor quality. Failures are regenerated, not shipped.**
> *Why:* `architecture.md` §22.1 — *"Answerability is verified against the evidence envelope, not asserted."*
> *Prevents:* the `R-14` failure the student experiences as the product being wrong about their own syllabus.
> *Supports:* `AIR-007`, `R-14`, `architecture.md` §22.
> *Exception:* none.

> **ENG-233 — Card quality validation is a separate pass with a checkable contract — atomicity, answerability, non-ambiguity — not an instruction embedded in the generation prompt.**
> *Why:* `architecture.md` §21.1 — these are testable properties, and *"generation failures are cheaper to catch here than in a student's review session."*
> *Prevents:* low-quality cards entering a spaced-repetition schedule, where they cost the student weeks of reviews.
> *Supports:* `FR-086`, `architecture.md` §21.1.
> *Exception:* none.

> **ENG-234 — Deterministic grading is used wherever the format permits it. Multiple choice and true/false never invoke a model.**
> *Why:* `architecture.md` §22.1 — *"Deterministic grading where possible is both a cost decision (`BM-05`) and a correctness decision."*
> *Prevents:* variance and cost in an operation with a known right answer.
> *Supports:* `BM-05`, `NFR-022`, `architecture.md` §22.1.
> *Exception:* none.

> **ENG-235 — Every AI output is stamped with provenance, model version and prompt version at persistence, and carries a report affordance at presentation.**
> *Why:* `architecture.md` §14.2 stages 9 and 10; `AIR-011` and `NFR-071` require reportability, and every report enters the evaluation queue with full invocation context (`AD-35`).
> *Prevents:* unlabelled AI content (`NN-08`); and an undiagnosable report with no way back to the invocation.
> *Supports:* `NN-08`, `AIR-010`, `AIR-011`, `NFR-071`, design `AI-2`, `AI-6`.
> *Exception:* none.

> **ENG-236 — Regeneration never overwrites a `student` or `co_created` artifact. It produces a new revision alongside, and the student chooses.**
> *Why:* `FR-075`, stated in `architecture.md` §20.1 as *"an absolute rule"* and enforced at the repository layer: *"there is no code path that overwrites a `co_created` or `student` note with AI output."*
> *Prevents:* destruction of student work — `NN-06`.
> *Supports:* `NN-06`, `FR-075`, `FR-073`, `NFR-015`.
> *Exception:* none.

---

## 35. AI Cost Discipline

`NFR-022` makes cost per student a release-gating constraint and `R-11` rates cost overrun as Critical. Cost is an engineering responsibility, not a finance report.

> **ENG-237 — The cheapest inference is the one not performed. Before adding a model call, exhaust the deterministic path.**
> *Why:* `architecture.md` §40.1 lever 1 — text-layer extraction for digital PDFs, deterministic grading, deterministic planning (`AD-25`), classical OCR for clean print. *"Never send to a model what the file already contains."*
> *Prevents:* the largest and most avoidable category of spend.
> *Supports:* `BM-05`, `NFR-022`, `AD-20`, `AD-25`, `AG-07`.
> *Exception:* a model call justified by a measured quality improvement, recorded in the pull request.

> **ENG-238 — Extraction and embedding are content-addressed by hash and model/extractor version. Identical content is never processed twice at the same version.**
> *Why:* `AD-30` — in the beachhead an identical faculty PDF circulates through an entire class, so *"the marginal cost of the hundredth student uploading that file approaches zero."* This is one of the largest available levers on cost per student.
> *Prevents:* paying N times for one document.
> *Supports:* `AD-30`, `BM-02`, `R-11`, `NFR-022`.
> *Exception:* none. **Binding privacy constraint, per `AD-30`:** the cache stores only derived computation results keyed by content hash. It never stores the file, never an association between students, and no cache entry is attributable to any student. Cache hits are invisible in every student-facing surface. Each student's `chunks` rows remain their own, RLS-protected and independently deletable.

> **ENG-239 — Every task class has a context token budget, and retrieval returns the smallest sufficient evidence set.**
> *Why:* `architecture.md` §40.1 lever 4 — context economy is *"the largest lever on tutor cost, the highest-volume path."*
> *Prevents:* unbounded context growth as conversations lengthen.
> *Supports:* `NFR-022`, `BM-05`, `architecture.md` §16.3.
> *Exception:* none. Conversation history is compacted, not truncated (`architecture.md` §18.1).

> **ENG-240 — Identical scope, parameters and prompt version return the existing artifact. Regeneration requires an explicit student action.**
> *Why:* `architecture.md` §28 and §40.1 lever 5 — generation dedupe *"prevents accidental duplicate spend."*
> *Prevents:* a double-tap or a retry costing a second full generation.
> *Supports:* `BM-05`, `EP-04`.
> *Exception:* none.

> **ENG-241 — A change that materially increases cost per student without a measured quality improvement does not ship.**
> *Why:* `AD-39` — *"Unit economics as a release gate. This is the operational form of `BM-01`."*
> *Prevents:* the slow margin erosion that `R-11` rates Critical, discovered too late to reverse cheaply.
> *Supports:* `BM-01`, `BM-03`, `NFR-022`, `AG-07`.
> *Exception:* an explicitly approved, time-boxed experiment with a named owner and a cost ceiling.

---

# Part 7 — Cross-Cutting Standards

## 36. Error Handling

### 36.1 The two error classes

Avora distinguishes **expected outcomes** from **defects**, and handles them with different mechanisms. Conflating them is what produces the generic catch block that design `Rule ER-01` prohibits.

| Class | Examples | Mechanism | Student sees |
| --- | --- | --- | --- |
| **Expected outcome** | Quota exhausted, retrieval insufficient, share revoked or expired, unsupported file type, offline, plan limit reached | Typed result (`ENG-056`), structured API error (`ENG-158`) | A designed state from `DESIGN-SYSTEM.md` §28 with a recovery action |
| **Defect** | Invariant violated, impossible state, unhandled provider shape, programming error | Throw; caught at the boundary; reported to Sentry | An honest, non-technical error state with a recovery action |

> **ENG-250 — Every surfaced failure is honest, comprehensible, and paired with a recovery action.**
> *Why:* `NFR-014`, enforced structurally by `ErrorState` requiring a `recoveryAction` prop — per design §18.2, *"There is no error component without one."*
> *Prevents:* the dead-end error, which converts a recoverable moment into abandonment.
> *Supports:* `NFR-014`, `NFR-054`, design `Rule ER-01`, `DP-06`.
> *Exception:* none.

> **ENG-251 — Errors never apologise, never blame the student, and never expose internals.**
> *Why:* design `Rule ER-01` and voice rule *"Never apologise; explain and offer the next step"* (design §6.1). *"Couldn't read 4 pages. Retake those pages?"* is the standard; *"Sorry! Something went wrong."* is a defect.
> *Prevents:* both a trust cost and a security cost — internal detail in an error message is reconnaissance.
> *Supports:* `NFR-014`, `NFR-054`, design §6.1, `Rule ER-01`.
> *Exception:* none.

> **ENG-252 — A failure in one artifact never removes access to another.**
> *Why:* design `Rule ER-03` and `EP-06`. A failed summary does not hide the resource; a failed quiz generation does not hide the deck.
> *Prevents:* corpus degradation through error handling — the quiet way `EP-06` gets violated.
> *Supports:* `EP-06`, `NFR-013`, design `Rule ER-03`.
> *Exception:* none.

> **ENG-253 — Errors are never swallowed. A caught error is handled, converted to a typed outcome, or re-thrown with context.**
> *Why:* an empty catch block is a defect that has been made invisible.
> *Prevents:* silent data loss, which for `NN-06` and `FR-037` is the highest-cost failure mode available.
> *Supports:* `NN-06`, `NFR-010`, `FR-037`.
> *Exception:* none. A deliberately ignored error is annotated with why, and is logged at debug level.

> **ENG-254 — Extraction and processing failures degrade to an honest partial state; the original remains fully usable.**
> *Why:* `architecture.md` §19.2 — `partial` is a first-class state, not a hidden failure: *"A resource in `partial` is still readable, still shareable, still summarisable at reduced confidence — the corpus is never withheld because the machine struggled."* This is the `R-01` mitigation.
> *Prevents:* a student losing access to their own material because the pipeline underperformed.
> *Supports:* `EP-06`, `R-01`, `NFR-014`, `architecture.md` §19.2.
> *Exception:* none.

---

## 37. Logging

`AD-36` defines **three log streams with different retention, access, and content rules**, and one absolute constraint: **student academic content never appears in any of them.**

> **ENG-255 — No student academic content is logged, including filenames.**
> *Why:* `NFR-036` and `AD-36` — *"Logging a resource id is correct; logging its filename or text is not. Filenames are student-authored content and frequently reveal subject, institution, and personal information."* `architecture.md` §47.1 rule 8 states it as an agent rule.
> *Prevents:* content leakage into a system with weaker access control and longer retention than the database.
> *Supports:* `NN-09`, `NFR-036`, `NFR-046`.
> *Exception:* none.

> **ENG-256 — The logger accepts typed fields only. There is no `log(anything)` signature, and attempting to log a content-carrying type fails type-checking.**
> *Why:* `AD-36` — *"Redaction is structural."* A redaction function that must be remembered will be forgotten.
> *Prevents:* accidental serialisation of a domain object containing content — the most common route to an `NFR-036` violation.
> *Supports:* `NN-09`, `EP-02`, `AD-36`.
> *Exception:* none.

> **ENG-257 — Every log line carries the trace id.**
> *Why:* `AD-36` — *"an investigation can reconstruct a student action end-to-end without ever reading their material."*
> *Prevents:* the trade-off between debuggability and privacy, which is a false trade-off if identifiers are propagated properly.
> *Supports:* `NFR-036`, `architecture.md` §34.1.
> *Exception:* none.

> **ENG-258 — Audit log entries are append-only and immutable, written in the same transaction as the audited change where possible.**
> *Why:* `AD-36`. Authentication events, authorisation denials, privilege use, share creation and revocation, deletion requests and completions, admin access and consent changes are all audit events.
> *Prevents:* an audit trail that can be edited by whoever needs it edited.
> *Supports:* `NFR-036`, `architecture.md` §35.
> *Exception:* none.

> **ENG-259 — Log levels are used consistently: `error` means a human should look; `warn` means a trend should be watched; `info` means a domain-significant event; `debug` is off in production.**
> *Why:* a log level that means nothing produces alert fatigue, which is the mechanism by which real alerts get ignored.
> *Prevents:* the `NFR-072`-mandated alerts being lost in noise.
> *Supports:* `NFR-072`, `EP-08`.
> *Exception:* none.

---

## 38. Monitoring and Observability

`EP-08` — *measure the thing the PRD cares about, not the thing that is easy to measure.* The signal layers, golden signals and alert list in `architecture.md` §34 are canonical.

> **ENG-260 — Every alert traces to a requirement identifier.**
> *Why:* `architecture.md` §34.3 — *"Alerts are tied to PRD requirements, so every page has a stated reason to exist."*
> *Prevents:* alerts nobody can justify, which become alerts nobody acts on.
> *Supports:* `NFR-072`, `NFR-063`, `EP-08`.
> *Exception:* none.

> **ENG-261 — AI quality is instrumented as a production signal with alerts, not as an offline analysis.**
> *Why:* `EP-08` and `AD-35` — grounding fidelity, citation validity, extraction accuracy and cost per student are production signals. Citation verification failure alerts on **any occurrence**.
> *Prevents:* a quality regression running for a release cycle before anyone measures it.
> *Supports:* `AD-35`, `NFR-070`, `AIR-006`, `EP-08`.
> *Exception:* none.

> **ENG-262 — Every student action produces one trace spanning client → API → retrieval → provider → response.**
> *Why:* `architecture.md` §34.1 — one trace id per student action, using vendor-neutral OpenTelemetry.
> *Prevents:* latency investigations that stop at a service boundary, which for `AD-03`'s time-to-first-token SLO is exactly where the answer usually is.
> *Supports:* `AD-03`, `NFR-003`, `architecture.md` §34.1.
> *Exception:* none.

> **ENG-263 — A new subsystem ships with its four golden signals instrumented: latency, traffic, errors, saturation.**
> *Why:* `architecture.md` §34.2 defines them per subsystem. A subsystem without them is a subsystem whose failure is discovered by a student.
> *Prevents:* blind spots in exactly the components that are new and therefore least trusted.
> *Supports:* `NFR-070`, `NFR-072`, `EP-08`.
> *Exception:* none.

---

## 39. Configuration Management

> **ENG-264 — Configuration is typed, validated at boot, and fails startup loudly when missing or malformed.**
> *Why:* `architecture.md` §36.3 — *"A missing or malformed secret fails startup loudly rather than producing a runtime surprise in front of a student."*
> *Prevents:* a misconfiguration presenting as a feature that silently does nothing.
> *Supports:* `architecture.md` §36.3, `EP-02`, `NFR-014`.
> *Exception:* none.

> **ENG-265 — Tunable thresholds are configuration, not constants in code, and each declares its owner and its default.** This includes: the classification ask-versus-assume threshold, extraction confidence thresholds, retrieval score thresholds, token budgets per task class, review-load defaults, and structure depth limits.
> *Why:* `architecture.md` §19.4 makes the ask-threshold *"a tunable configuration value with per-cohort experimentation, so the product can answer the question with data rather than opinion"*; `SM-03` makes depth limits *"product policy expressed as configuration"*; `AD-24` ships review load as configuration pending `OQ-04`.
> *Prevents:* an unresolved product question being hard-coded into a release, which converts an open question into an accidental decision.
> *Supports:* `SM-03`, `AD-22`, `AD-24`, `architecture.md` §19.4, §80.
> *Exception:* none.

> **ENG-266 — Configuration never branches business logic by environment.**
> *Why:* code that behaves differently in production is code that was never tested in the form that runs for students.
> *Prevents:* the "works in staging" class of incident.
> *Supports:* `architecture.md` §33.1, §56.
> *Exception:* infrastructure endpoints, credentials, sampling rates, and feature flags — none of which change the logic itself.

---

## 40. Environment Variables

> **ENG-267 — Every environment variable is declared in a typed schema in `packages/config`, with its trust tier, its owner, and whether it is required.**
> *Why:* `architecture.md` §36.3 defines three physically separated trust tiers: client-public values (bundled), server values (Vercel encrypted env), and worker values including the service role and provider keys (worker secret store).
> *Prevents:* the undeclared variable that works on one engineer's machine and is absent in production.
> *Supports:* `architecture.md` §36.3, `AD-11`.
> *Exception:* none.

> **ENG-268 — A variable's trust tier determines where it may be read, and a server or worker value is never read from client-reachable code.**
> *Why:* `AD-11` — *"A service-role key never exists in a runtime that accepts client input."*
> *Prevents:* the single highest-severity secret exposure available in this architecture.
> *Supports:* `NN-04`, `AD-11`, `NFR-032`.
> *Exception:* none. Client-public variables are named with the platform's public prefix so the tier is visible at every use site (`EP-07`).

> **ENG-269 — No secret is ever read directly by feature code. Secrets reach vendors through adapters only.**
> *Why:* `AD-12` — no feature module holds a provider key. Combined with `ENG-018`, this makes secret access grep-checkable.
> *Prevents:* a secret being logged, forwarded, or bundled by code that had no business holding it.
> *Supports:* `NN-02`, `AD-12`, `AD-11`.
> *Exception:* none.

---

## 41. Secret Management

> **ENG-270 — No secret is committed, ever. Secret scanning runs in CI and pre-commit; a committed secret blocks the build and triggers rotation.**
> *Why:* `architecture.md` §36.3. Rotation is triggered by the commit, not by an assessment of whether it was exposed — because that assessment is unreliable.
> *Prevents:* a secret living in git history indefinitely, where it survives every subsequent deletion.
> *Supports:* `architecture.md` §36.3, §36.1.
> *Exception:* none.

> **ENG-271 — Rotation is routine, not incident-driven, with dual-key windows so rotation never requires downtime.**
> *Why:* `architecture.md` §36.3. A rotation procedure first exercised during an incident is a procedure that fails during an incident.
> *Prevents:* the choice between rotating and staying available.
> *Supports:* `architecture.md` §36.3, `NFR-011`.
> *Exception:* none.

> **ENG-272 — No secret is present in a client bundle, a source map, an error report, an analytics payload, or a log line.**
> *Why:* `architecture.md` §36.1 rates secret leakage High.
> *Prevents:* the extraction of a key from a store-distributed binary, which is trivially decompilable.
> *Supports:* `architecture.md` §36.1, `NN-09`.
> *Exception:* none.

---

## 42. Input Validation

> **ENG-273 — Every input crossing a trust boundary is validated against a typed schema before use, and validation happens at the boundary, not deep inside.**
> *Why:* `architecture.md` §12.2 layer 3, and `EP-05`. Boundaries include: client requests, webhook payloads, provider responses, uploaded file metadata, imported shared content, and job payloads.
> *Prevents:* untyped data reaching domain logic, where every subsequent assumption is unfounded.
> *Supports:* `EP-05`, `EP-02`, `NFR-033`.
> *Exception:* none.

> **ENG-274 — Application-layer validation is a usability feature. It is never the security boundary.**
> *Why:* `EP-02` states this precisely. The database is the security boundary.
> *Prevents:* the assumption that a validated request is an authorised one — two different properties that a single validation function invites conflating.
> *Supports:* `EP-02`, `NN-04`, `NFR-031`.
> *Exception:* none.

> **ENG-275 — Validation never rejects an unrecognised structure type label.**
> *Why:* `AD-05` — the label is free text with a suggestion library, and *"Coding agents must never introduce validation that rejects an unrecognised label."* `SM-05` makes arbitrary and student-authored labels an invariant.
> *Prevents:* the most plausible-looking `NN-01` violation available: a well-intentioned "valid label" check.
> *Supports:* `NN-01`, `AD-05`, `SM-05`, `FR-020`.
> *Exception:* length and character-safety limits, which are hygiene rather than vocabulary. They are generous, they are not a whitelist, and they never reject a word for being unfamiliar.

> **ENG-276 — Webhook payloads are signature-verified, replay-protected, and idempotent by event id.**
> *Why:* `EP-04` — every webhook carries an idempotency key. Billing webhooks in particular drive entitlement state (`AD-31`).
> *Prevents:* forged or replayed entitlement changes.
> *Supports:* `EP-04`, `AD-31`, `NFR-033`.
> *Exception:* none.

---

## 43. Output Encoding

> **ENG-277 — Output is encoded for its destination context, and no student-supplied or model-generated content is ever rendered as raw markup.**
> *Why:* `architecture.md` §36.1 lists XSS among the High-impact injection threats with output encoding as the control. Model output is untrusted in this respect exactly as student content is.
> *Prevents:* stored XSS via a note body, a structure label, a filename, or a model-generated block.
> *Supports:* `NFR-033`, `EP-05`.
> *Exception:* none. Rich content — mathematics, code, tables (`FR-058`) — is rendered through the defined output contract, where *"the model emits standard notation, the client renders it"* (`architecture.md` §18.1), never by injecting markup.

> **ENG-278 — Original files are never rendered in an application-origin context; viewers are sandboxed.**
> *Why:* `architecture.md` §13.4 — rendering isolation is one of the eight upload controls.
> *Prevents:* an uploaded document executing in the application's security context.
> *Supports:* `NFR-034`, `EP-05`, `architecture.md` §13.4.
> *Exception:* none.

> **ENG-279 — No user-controlled value ever becomes an outbound URL.**
> *Why:* `architecture.md` §36.1 lists SSRF among High-impact injection threats, with *"no user-controlled outbound URLs; allowlisted worker egress"* as the control.
> *Prevents:* server-side request forgery from a document, a share import, or a model output.
> *Supports:* `NFR-033`, `EP-05`.
> *Exception:* none.

---

## 44. File Uploads

Uploads are treated as hostile (`EP-05`, `NFR-034`). The eight controls in `architecture.md` §13.4 are canonical and mandatory.

> **ENG-280 — Every upload lands in quarantine and is promoted to `originals` only after type sniffing, allowlist checking, scanning and sanitisation.**
> *Why:* `architecture.md` §13.2 and §13.4 — quarantine is the enforcement point, and the declared MIME type *"is a hint, never trusted."*
> *Prevents:* malicious content entering the corpus, and a rejected file ever being reachable.
> *Supports:* `NFR-034`, `EP-05`, `architecture.md` §13.4.
> *Exception:* none.

> **ENG-281 — Structural sanitisation is applied on promotion: active content stripped, PDFs re-serialised, images re-encoded with EXIF including GPS removed.**
> *Why:* `architecture.md` §13.4 — the EXIF strip is *"a privacy measure the student never has to think about (`PR-02`)."*
> *Prevents:* location disclosure from a photographed page, and active content surviving into the corpus.
> *Supports:* `NFR-034`, `PR-02`, `architecture.md` §13.4.
> *Exception:* none.

> **ENG-282 — Parsers run in the worker plane with constrained memory and CPU and no outbound network beyond allowlisted provider endpoints.**
> *Why:* `architecture.md` §13.4 — extraction isolation. A parser is a large attack surface processing hostile input.
> *Prevents:* a parser exploit reaching the network or exhausting a shared runtime.
> *Supports:* `NFR-034`, `NFR-033`, `AD-08`.
> *Exception:* none.

> **ENG-283 — Uploads are resumable and idempotent by content hash. Re-uploading identical bytes to the same resource is a no-op, never a second copy.**
> *Why:* `architecture.md` §13.2 — *"Resumable protocol handles the transport; a content-hash idempotency key handles the semantics."* `FR-037` requires resume without silent duplication.
> *Prevents:* duplicate resources after a flaky connection, which in the beachhead is the normal connection.
> *Supports:* `FR-037`, `EP-04`, `AD-30`.
> *Exception:* none.

> **ENG-284 — Multi-page camera capture produces one logical resource with ordered page derivatives, never N unrelated images.**
> *Why:* `architecture.md` §13.2 — *"This is a domain decision, not a UI convenience: a photographed six-page handout must chunk, cite, and summarise as one document."*
> *Prevents:* a handout that cannot be cited or summarised coherently because it was stored as fragments.
> *Supports:* `FR-032`, `AIR-002`, `architecture.md` §13.2.
> *Exception:* none.

> **ENG-285 — Quota is checked before upload, not after, and the student is warned approaching the limit rather than at it.**
> *Why:* `architecture.md` §13.2, satisfying `FR-042` and `BM-02`.
> *Prevents:* a student completing an upload on a slow connection and then being told it was not allowed.
> *Supports:* `FR-042`, `BM-02`, `NFR-014`.
> *Exception:* none.

---

## 45. Rate Limiting

`architecture.md` §36.4 defines four layers with different purposes: **edge** (volumetric abuse), **identity** (application abuse), **cost** (economic control), and **fairness** (queue equity).

> **ENG-286 — The cost layer is distinct from the abuse layer and remains enforced for entirely legitimate, well-behaved usage.**
> *Why:* `architecture.md` §36.4 states this explicitly — the cost layer *"is not a security control — it is a business-viability control."*
> *Prevents:* the reasoning error that leads to disabling cost limits for "good" users, which is exactly how `BM-02`'s bound is lost.
> *Supports:* `BM-02`, `NFR-022`, `R-11`, `AG-07`.
> *Exception:* none.

> **ENG-287 — A rate-limited or quota-limited response is an honest limit state with a clear action, never a silent failure and never a degraded-quality response pretending to be a normal one.**
> *Why:* `architecture.md` §31.2, satisfying `NFR-014`, `FR-042` and `FR-144`. Design §28.1 specifies the limit-reached state: current usage, the limit, what still works, how to proceed.
> *Prevents:* the most damaging form of dishonesty available to an AI product — quietly serving a worse answer.
> *Supports:* `NFR-014`, `FR-144`, `EP-06`, design §28.
> *Exception:* none.

> **ENG-288 — Authentication and recovery endpoints carry their own limits, with device and location signals and notification on recovery.**
> *Why:* `architecture.md` §36.1 rates account takeover via recovery as High, with OTP rate limits, step-up for sensitive actions, and notification as the control set.
> *Prevents:* OTP brute force and silent account takeover.
> *Supports:* `FR-003`, `NFR-035`.
> *Exception:* none.

---

## 46. Caching

The cache table in `architecture.md` §28 is canonical, including its invalidation triggers.

> **ENG-289 — Every cache declares its key, its TTL, and its invalidation trigger at the point it is introduced.**
> *Why:* an undocumented cache is a source of stale data whose staleness nobody can bound. `architecture.md` §28 documents all seven current caches this way.
> *Prevents:* the stale-projection bug: a student restructures their subject and the Today surface keeps showing the old plan.
> *Supports:* `architecture.md` §28, `NFR-001`, `AD-27`.
> *Exception:* none.

> **ENG-290 — Cache invalidation is driven by domain events, not by timers, wherever a domain event exists for the change.**
> *Why:* `architecture.md` §28 maps invalidation to `structure.changed`, `resource.ready`, `plan.invalidated`, `attempt.recorded` and others. Time-based invalidation of student-visible state is a guess.
> *Prevents:* the window in which the product shows a student something they have already changed.
> *Supports:* `AD-27`, `architecture.md` §28, `NFR-002`.
> *Exception:* content-addressed extraction and embedding caches, which are *never* invalidated by design — a new version is a new key (`AD-06`, `AD-30`).

> **ENG-291 — Signed-media cache keys are identity-scoped. A cache entry is never shared across identities.**
> *Why:* `architecture.md` §13.3 and §28 — *"keyed so that a signed URL's cache entry is never shared across identities."*
> *Prevents:* cross-student content delivery through a CDN, which would be an `NFR-031` failure outside the database's reach.
> *Supports:* `NN-04`, `NFR-031`, `architecture.md` §13.3.
> *Exception:* none.

> **ENG-292 — No cache stores student academic content outside the systems already designed to hold it.**
> *Why:* every new store is a new deletion surface, and `NFR-042` requires deletion to be complete and *verifiable* across every store (`AD-38`).
> *Prevents:* a cache becoming an undiscovered copy of deleted content.
> *Supports:* `NFR-042`, `AD-38`, `NFR-040`.
> *Exception:* the caches enumerated in `architecture.md` §28, each of which is inside the deletion cascade.

---

## 47. Performance

`architecture.md` §38 gives each performance NFR a named mechanism, *"because a performance requirement without a mechanism is a wish."* The mechanisms are canonical.

> **ENG-293 — Every performance requirement has a named mechanism and a CI-enforced budget. A breach fails the build.**
> *Why:* `architecture.md` §38 — budgets are enforced in CI: bundle size, cold-start on a reference low-end device profile, p95 API latency in load tests, and retrieval latency.
> *Prevents:* regression discovered by students on mid-range Android, which is the target environment rather than an edge case (`AG-05`).
> *Supports:* `AG-05`, `NFR-001`–`NFR-006`, `NFR-052`, `architecture.md` §38.
> *Exception:* none. A budget change is a reviewed decision with a recorded reason.

> **ENG-294 — Time-to-first-token is the tutor latency SLO, not time-to-completion.**
> *Why:* `AD-03` — `NFR-003` says responses *begin streaming* within five seconds, so the architecture optimises retrieval and context assembly aggressively (sub-1.2 s p95 to first token) and treats total generation time as secondary.
> *Prevents:* optimising the wrong metric, and the multi-hop agent loop that would breach the SLO in the common case.
> *Supports:* `AD-03`, `NFR-003`.
> *Exception:* none.

> **ENG-295 — The Today surface renders from a precomputed projection. It is never computed on page load.**
> *Why:* `architecture.md` §23.1 and §28 — the single next action *"must render instantly (`NFR-001`)"*, and `NFR-001` *"forbids a slow home screen"* (§9.4).
> *Prevents:* the home screen becoming the slowest surface, which is where every session begins.
> *Supports:* `NFR-001`, `FR-105`, `architecture.md` §28.
> *Exception:* none.

> **ENG-296 — Search returns partial results on timeout rather than nothing; a slow artifact type degrades its own results, never the whole search.**
> *Why:* `architecture.md` §29 — the `NFR-005` two-second budget is met with pre-filtering, parallel per-type queries and a hard timeout.
> *Prevents:* one slow index making search unusable.
> *Supports:* `NFR-005`, `EP-06`, `architecture.md` §29.
> *Exception:* none.

---

## 48. Accessibility

`NFR-051` requires WCAG 2.1 AA. Per `architecture.md` §7.5, contrast ratios are properties of the token set, and verification is automated in CI on primitives and manual in review on surfaces. `DESIGN-SYSTEM.md` §41 is the full standard; this section states the engineering obligations only.

> **ENG-297 — Accessibility obligations are satisfied at the primitive layer and inherited, never re-solved per feature.**
> *Why:* `architecture.md` §7.4 and design §18.1 — contrast, target size, focus and screen-reader semantics are satisfied *there*.
> *Prevents:* per-feature accessibility work, which is per-feature accessibility debt.
> *Supports:* `NFR-051`, `PR-11`, design §18.1.
> *Exception:* none.

> **ENG-298 — Automated accessibility checks run on primitives on every pull request, and surfaces are manually reviewed pre-release.**
> *Why:* `architecture.md` §7.5 and §42.1.
> *Prevents:* AA regressions shipping unnoticed, since most are invisible to a sighted engineer on a fast device.
> *Supports:* `NFR-051`, `architecture.md` §42.1.
> *Exception:* none.

> **ENG-299 — Zoom is never disabled, and text remains readable and functional at 200% scale.**
> *Why:* design `AX-27` and `AX-28`, WCAG SC 1.4.4. Design `RE-02` records that production currently violates this on all five surfaces and that it is a two-line fix, with `Rule TY-05` (16 sp minimum input text) removing the iOS auto-zoom motivation.
> *Prevents:* an outright AA failure, and therefore an `NFR-051` release-gate failure.
> *Supports:* `NFR-051`, design `AX-27`, `RE-02`.
> *Exception:* none.

> **ENG-300 — Focus is always visible, never suppressed, and is never moved by an event the student did not initiate.**
> *Why:* design `AX-03` and `AX-07` — a streaming response, an arriving toast, and an insight appearing must not steal focus. In a product with realtime job updates and streaming answers, this is a real and frequent hazard.
> *Prevents:* the loss of a keyboard or switch user's place mid-task.
> *Supports:* `NFR-051`, design `AX-03`, `AX-07`.
> *Exception:* none.

> **ENG-301 — Streaming AI responses use a polite live region and announce completion, not every token.**
> *Why:* design `AX-15`. Token-level announcement makes streaming unusable with a screen reader.
> *Prevents:* the flagship AI surface being inaccessible.
> *Supports:* `NFR-051`, `PR-11`, design `AX-15`.
> *Exception:* none.

> **ENG-302 — `AIGeneratedBadge` is announced as text, and `CitationChip` announces its resolved source.**
> *Why:* design `AX-17` — *"This is a `FR-143` requirement, not only an accessibility one"* — and `AX-16`. Provenance conveyed by colour or glyph alone is provenance not conveyed.
> *Prevents:* an `NN-08` violation for non-sighted students.
> *Supports:* `NN-08`, `FR-143`, `AIR-010`, design `AX-16`, `AX-17`.
> *Exception:* none.

---

## 49. Security-First Development

Security is a default engineering responsibility, not a separate team's concern. `architecture.md` §36 defines ten defence-in-depth layers and the threat model; `docs/SECURITY.md` owns the full treatment. The rules here are the engineering obligations that apply to every contributor on every change.

> **ENG-303 — Every change is assessed against the layer it touches, and no change weakens a layer to make another layer's job easier.**
> *Why:* `architecture.md` §12.2 — layers 1–4 are defence in depth; *"if all four contained bugs simultaneously, RLS would still prevent cross-student data access."* That property only holds if layers are not traded off against each other.
> *Prevents:* the trade that turns defence in depth into a single point of failure.
> *Supports:* `AG-04`, `NFR-031`, `architecture.md` §36.2.
> *Exception:* none.

> **ENG-304 — Secure defaults. A new feature is closed until deliberately opened; a new table is unreadable until a policy is written; a new share is private until explicitly granted.**
> *Why:* the deny-by-default posture of `architecture.md` §12.3 and the never-on-by-default posture of `FR-131`, generalised. The correct failure mode of a forgotten decision is denial.
> *Prevents:* the omission becoming an exposure.
> *Supports:* `NN-04`, `FR-131`, `architecture.md` §12.3.
> *Exception:* none.

> **ENG-305 — Least privilege for people and for processes. Production access requires approval and is audited.**
> *Why:* `architecture.md` §36.1 rates insider exfiltration Critical, with least privilege (`NFR-032`), approved and audited production access, and *"no bulk export tooling in the application"* as the controls.
> *Prevents:* the largest-blast-radius access path in any system, which is a legitimate one being over-provisioned.
> *Supports:* `NFR-032`, `architecture.md` §36.1.
> *Exception:* none.

> **ENG-306 — Security review before every major release, with AI-specific surfaces reviewed as their own class.**
> *Why:* `NFR-037` and `architecture.md` §36.5 — injection, envelope integrity, output validation and tool authority are reviewed separately, because they are a genuinely different threat class from conventional web security.
> *Prevents:* AI surfaces being reviewed with a web checklist that does not contain their failure modes.
> *Supports:* `NFR-037`, `AIR-013`, `architecture.md` §36.5.
> *Exception:* none.

> **ENG-307 — Automated scanning runs continuously: dependencies, static analysis, secret detection, container images.**
> *Why:* `architecture.md` §36.5.
> *Prevents:* a known vulnerability persisting because nobody was assigned to look.
> *Supports:* `NFR-037`, §62.
> *Exception:* none.

---

## 50. Privacy-First Development

The PRD makes four public trust commitments (`architecture.md` §19.3 reference); two are architectural, and one — *"deletion means deletion"* — is described in `architecture.md` §37 as *"the hardest engineering commitment in the document."*

> **ENG-308 — Collect the minimum, state the purpose, and record both in the schema.**
> *Why:* `AD-37` — a new column without a classification and purpose fails CI, and `docs/PRIVACY.md` is generated from that metadata, so *"the privacy notice [is] a build artifact rather than a document that drifts from reality."*
> *Prevents:* data accumulating without justification, and a privacy notice that describes a system that no longer exists.
> *Supports:* `NFR-040`, `NFR-041`, `FR-141`, `AD-37`.
> *Exception:* none.

> **ENG-309 — Deletion is implemented as an orchestrated, verified, multi-store cascade with a verification pass that asserts absence in every store.**
> *Why:* `AD-38` — *"'We ran the delete statement' is not evidence of deletion."* The cascade spans primary rows, object storage, search and vector indices, caches, analytics, the evaluation store, shares, and backups; incomplete verification alerts and escalates rather than silently marking complete.
> *Prevents:* a deletion commitment that is true in the database and false everywhere else.
> *Supports:* `NFR-042`, `FR-005`, `FR-140`, `AD-38`.
> *Exception:* none.

> **ENG-310 — Any new store, index, cache or third-party destination that can hold student data must be added to the deletion cascade in the same pull request that introduces it.**
> *Why:* `AD-38` requires verification in *every* store; `architecture.md` §17.6 makes deletion-completeness an eligibility criterion for any replacement retrieval index — *"a new index must support complete, verifiable per-student deletion, or it is not eligible."*
> *Prevents:* the deletion cascade silently becoming incomplete, which is undetectable until it matters legally.
> *Supports:* `NFR-042`, `AD-38`, `AD-17`.
> *Exception:* none. This is the single most important rule in this section, because it is the one that decays without enforcement.

> **ENG-311 — Access revocation is immediate; physical erasure completes within the published window. Both facts are stated to the student in plain language.**
> *Why:* `AD-38` — *"A student who deletes something never sees it again, in any surface, from that instant."*
> *Prevents:* the gap between promise and mechanism being papered over with vagueness.
> *Supports:* `NFR-042`, `NFR-054`, `AD-38`.
> *Exception:* none.

> **ENG-312 — The opt-out flag is checked at every point of aggregate use, as a precondition.**
> *Why:* `architecture.md` §37.3 — `FR-142` is *"a checked flag at every point of aggregate use, not a preference stored and forgotten."* The two aggregate uses that exist are structure-template enrichment (§10.4) and AI evaluation corpora (§34.4).
> *Prevents:* a stored preference with no enforcement, which is the most common form of consent theatre.
> *Supports:* `FR-142`, `NFR-046`, `architecture.md` §37.3.
> *Exception:* none.

> **ENG-313 — A provider that cannot offer no-training terms is not eligible for the routing policy.**
> *Why:* `architecture.md` §37.3 — `NFR-043` and trust commitment 2 are enforced contractually *and* architecturally, with provider eligibility a documented gate in `docs/PRIVACY.md`.
> *Prevents:* the public trust commitment being violated by a routing configuration change.
> *Supports:* `NFR-043`, `AD-13`, `architecture.md` §37.3.
> *Exception:* none. Design `RE-01` records that a production string currently misstates this commitment; correcting the string does not change the engineering rule, which was always this.

> **ENG-314 — Aggregate learning uses structural patterns only — label vocabulary, depth distributions, correction signals — never titles, filenames, or content.**
> *Why:* `architecture.md` §10.4 and `AD-22`. Corrections are used per-student first; any cross-student use is aggregate-only and opt-out-respecting.
> *Prevents:* secondary exploitation of student content, which the PRD prohibits.
> *Supports:* `NFR-046`, `FR-142`, `AD-22`, `architecture.md` §10.4.
> *Exception:* none.

---

# Part 8 — Process

## 51. Git and Branching

> **ENG-320 — Trunk-based development: short-lived branches off `main`, merged behind flags when incomplete.** `[RECOMMENDED]`
> *Why:* `architecture.md` §33.2 describes a release process built on per-PR preview deployments and progressive production rollout, which assumes small, frequent, independently deployable changes. Long-lived branches defeat both.
> *Prevents:* merge conflicts of the kind that break invariants silently — particularly around schema, tokens, and shared contracts.
> *Supports:* `architecture.md` §33.2, §60.
> *Exception:* a deliberate, time-boxed spike branch that is never merged.

> **ENG-321 — Branch names carry the requirement identifier: `<type>/<identifier>-<slug>`.** For example `feat/FR-039-classification-correction`, `fix/AIR-006-citation-verifier`, `chore/ENG-018-adapter-lint`.
> *Why:* `NFR-063` requires every shipped capability to trace to an identifier, and `architecture.md` §33.2 step 1 requires a linked identifier on every pull request. Putting it in the branch name means it is decided before the work starts, not retrofitted at review.
> *Prevents:* untraceable work — which per `architecture.md` §0 should not exist at all.
> *Supports:* `NN-10`, `NFR-063`.
> *Exception:* pure tooling or dependency changes, which trace to `ENG-###` from this document instead.

> **ENG-322 — `main` is always releasable, and protected paths require additional review.** Protected paths: `supabase/migrations/`, `supabase/policies/`, `packages/design-tokens/`, `packages/ai/prompts/`, `packages/config/`, CI configuration, and any file implementing an `NN-##` guard.
> *Why:* these are the files where a small diff has a disproportionate blast radius: a policy, a token, a prompt, a budget, or a gate.
> *Prevents:* an invariant being weakened in a diff that looked like housekeeping (`NN-12`, `ENG-004`).
> *Supports:* `NN-12`, `architecture.md` §33.2.
> *Exception:* none.

> **ENG-323 — Never force-push a shared branch, never rewrite published history, and never commit generated artefacts, `node_modules`, build output, or `.env` files.**
> *Why:* rewritten history destroys the audit trail that review and incident analysis depend on.
> *Prevents:* lost work, and an unauditable record of who changed what.
> *Supports:* `architecture.md` §33.2, `NFR-036`.
> *Exception:* none.

---

## 52. Commit Messages

> **ENG-324 — Conventional Commits, imperative mood, with the requirement identifier in the body.** `[RECOMMENDED]`

```
<type>(<scope>): <subject in the imperative, under 72 characters>

<body: why this change exists, not what it does>

Refs: FR-039, AIR-006
```

Types: `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `revert`. Scope is the module or package name from §5 and §6.

> *Why:* the log is the only durable record of *why*. Six months later, `git blame` on a strange-looking guard clause should answer the question rather than pose it.
> *Prevents:* the archaeology problem; and a changelog that has to be reconstructed by hand.
> *Supports:* `NN-10`, `NFR-063`, `AG-10`.
> *Exception:* none once adopted. Marked `[RECOMMENDED]` because the exact type list needs sign-off.

> **ENG-325 — One logical change per commit. Refactors and behaviour changes are never combined.**
> *Why:* a diff that both moves code and changes it is a diff that cannot be reviewed. The behaviour change hides inside the noise.
> *Prevents:* an unreviewed behaviour change — which, in the files listed in `ENG-322`, is how an invariant dies.
> *Supports:* §54, `NN-12`.
> *Exception:* none.

---

## 53. Pull Requests

> **ENG-326 — Every pull request links a requirement identifier, states what it changes, and declares which gates it affects.**
> *Why:* `architecture.md` §33.2 step 1 and `NFR-063`. `architecture.md` §47 rule 10 makes this an agent rule.
> *Prevents:* work that cannot be traced, and gate changes that go unnoticed.
> *Supports:* `NN-10`, `NFR-063`.
> *Exception:* none.

**The pull request template requires, at minimum:**

- Requirement identifier(s) satisfied
- What changed, and why this approach
- Which of the twelve non-negotiables (§4) this change touches, if any
- Structure adaptivity: does this render for zero, one and three levels, and for a subject labelled "Experiment"?
- New tables: RLS policy present, negative-authorisation tests present
- New columns: classification and purpose present
- AI changes: evaluation suite result, prompt version, routing impact
- Cost impact: expected change to cost per student
- Design: §42 checks self-certified; new patterns promoted per `CP-01`
- States: all six applicable states designed and implemented
- Rollback: how this is reverted, including any migration
- Documentation: which upstream document this required amending, if any

> **ENG-327 — Pull requests are small. A change beyond roughly 400 lines of substantive diff is split unless it is mechanical.** `[RECOMMENDED]`
> *Why:* review quality falls off a cliff with size, and this codebase's most important review checks — authorisation, grounding, structure adaptivity, provenance — are exactly the ones a fatigued reviewer skips.
> *Prevents:* rubber-stamped review of a change that needed real attention.
> *Supports:* §54, `NN-04`, `NN-11`.
> *Exception:* generated files, lockfiles, and mechanical renames, which are reviewed by inspecting the transformation rather than the diff.

> **ENG-328 — A pull request is not opened until CI passes locally on the changed area and the author has reviewed their own diff.**
> *Why:* reviewer attention is the scarcest resource in the system. Spending it on a failing build is spending it on nothing.
> *Prevents:* review latency; and the habit of using reviewers as a first-pass test runner.
> *Supports:* §54.
> *Exception:* an explicitly marked draft opened for early direction.

---

## 54. Code Review

> **ENG-329 — Review verifies correctness against requirements, not conformity to the reviewer's style. Anything mechanically checkable is not a review comment; it is a missing lint rule.**
> *Why:* `ENG-001` — the lowest enforcement layer that can work. A style debate in review is a lint rule that was never written, paid for at the most expensive rate available.
> *Prevents:* review time being consumed by formatting while an authorisation bug passes.
> *Supports:* `EP-02`, `ENG-001`.
> *Exception:* none. If a style point recurs, the fix is a lint rule, not a firmer comment.

> **ENG-330 — The reviewer is accountable for what they approve.**
> *Why:* approval is a claim that the change is correct, not that it is plausible. Shared accountability is what makes review a control rather than a ceremony.
> *Prevents:* the diffusion of responsibility that turns two approvals into zero.
> *Supports:* §76, quality.
> *Exception:* none.

> **ENG-331 — Changes touching authorisation, AI grounding, deletion, provenance, or an `NN-##` guard require a reviewer other than the author, with domain familiarity.**
> *Why:* these are the areas where a plausible-looking change causes a SEV-1. `ENG-004` applies the same requirement to the guards themselves.
> *Prevents:* the highest-severity defect classes reaching production with one pair of eyes.
> *Supports:* `NN-02`, `NN-04`, `NN-11`, `NFR-042`, `ENG-004`.
> *Exception:* none.

> **ENG-332 — Review comments distinguish blocking from non-blocking.** Prefix non-blocking observations with `nit:` or `suggestion:`.
> *Why:* an ambiguous comment either blocks unnecessarily or is ignored improperly.
> *Prevents:* review stalling on preference; and genuine objections being read as preference.
> *Supports:* review throughput.
> *Exception:* none.

> **ENG-333 — AI-generated code is reviewed to the same standard as human-written code, by a human who understands it.**
> *Why:* §74 states the quality bar. An agent produces more code with less context; volume is not a reason to review less carefully, it is a reason to review more carefully.
> *Prevents:* the specific failure mode of agent-assisted development — plausible code that violates an invariant the agent did not know about.
> *Supports:* `AG-10`, §74, all `NN-##`.
> *Exception:* none. **"The AI wrote it" is never an explanation for an approved defect.**

---

## 55. Documentation Standards

> **ENG-334 — The document merges before the code that implements it.**
> *Why:* `EP-09` — *"The document is the plan of record; the code is its consequence."*
> *Prevents:* documentation written to describe what was built, which never captures the rejected alternatives and therefore never prevents their re-proposal.
> *Supports:* `EP-09`, `AG-10`.
> *Exception:* a spike whose purpose is to answer a question the document cannot. The spike is not merged; the document is written from what it taught.

> **ENG-335 — Every architectural decision is recorded as an ADR in `docs/adr/`, one per `AD-##`, with context, decision, consequences and rejected alternatives.**
> *Why:* `architecture.md` §32.1 rule 6 — *"This document is the synthesis; the ADRs are the history."* `architecture.md` §45's rejected-alternatives list exists because rejected options come back.
> *Prevents:* re-litigating a settled decision, and re-adopting a rejected one.
> *Supports:* `EP-09`, `AG-10`, `architecture.md` §45.
> *Exception:* none for architectural decisions. Ordinary implementation choices belong in the commit body.

> **ENG-336 — When code and an upstream document disagree, the disagreement is raised, never silently resolved in either direction.**
> *Why:* design §44.3 rule 8 states it for design; `architecture.md` §47.1 rule 10 states it for architecture. Silent resolution destroys the documents' authority in one direction and the product's correctness in the other.
> *Prevents:* documentation drift, which is how a specification becomes decoration.
> *Supports:* `EP-09`, design §47, `AG-10`.
> *Exception:* none.

> **ENG-337 — Documentation that has drifted is fixed in the pull request that discovered the drift.**
> *Why:* drift compounds. The moment of discovery is the cheapest possible moment to fix it, and the only moment at which someone definitely understands both versions.
> *Prevents:* a backlog of documentation debt that is never prioritised against features.
> *Supports:* `EP-09`, §67.
> *Exception:* where the fix requires a decision the author cannot make — in which case it becomes an issue with an owner, per `ENG-002`.

---

## 56. Testing

`architecture.md` §42.1 defines the test layers and their gates; `docs/TEST-PLAN.md` owns the detailed strategy. This section states the engineering obligations.

### 56.1 Testing philosophy

Tests exist to make the system's invariants continuously true, not to reach a coverage number. Avora's test priorities follow its risk ordering: **authorisation, grounding, structure adaptivity, and data preservation are tested most heavily**, because they are the areas where a defect is unrecoverable rather than merely expensive.

> **ENG-338 — Coverage percentage is a diagnostic, never a target.**
> *Why:* a coverage target is satisfied most cheaply by testing the code that is easiest to test, which is rarely the code that matters. `AD-41` and the RLS suite exist because specific invariants need specific proof.
> *Prevents:* a high-coverage suite that does not test whether one student can read another's data.
> *Supports:* `architecture.md` §42, `EP-08`.
> *Exception:* none. Coverage *drops* on critical paths are investigated.

> **ENG-339 — Every bug fix ships with a test that fails without the fix.**
> *Why:* the bug proved the test was missing. Without it, the regression is a matter of luck.
> *Prevents:* the recurring defect, which is the most demoralising and most avoidable class.
> *Supports:* quality, §67.
> *Exception:* none.

> **ENG-340 — Tests are deterministic. A flaky test is fixed or deleted within one working day, never retried.**
> *Why:* a tolerated flake trains the team to re-run failing builds, which is exactly the habit that lets a real failure through a blocking gate (`NN-12`).
> *Prevents:* the erosion of every gate in §57 simultaneously.
> *Supports:* `NN-12`, `architecture.md` §42.1.
> *Exception:* none. `ENG-065` makes determinism achievable by injecting time, randomness and identifiers.

### 56.2 Layer obligations

| Layer | What it must cover | Gate |
| --- | --- | --- |
| **Unit** | Domain invariants, scheduler, scoring, scope resolution, planner arithmetic, state machines | Every PR |
| **RLS negative-authorisation** | Every table, every cross-student access pattern | **Every PR — a table without these fails the build** |
| **Structural adaptivity (`AD-41`)** | Zero/one/three/five-level subjects; heterogeneous coexisting labels; restructure preserving every artifact; arbitrary and student-authored labels; no query, prompt or output assuming a level name; template application producing ordinary editable units | **Every PR** |
| **Integration** | API contracts, job state machines, pipelines end to end | Every PR |
| **Contract** | Client/server type parity across web, mobile and worker | Every PR |
| **AI evaluation** | Grounding fidelity, citation validity (**100%**), refusal correctness, extraction accuracy, assessment validity | **Every prompt, routing or retrieval change** |
| **Accessibility** | Automated on primitives; manual on surfaces | Every PR / pre-release |
| **End to end** | Onboarding, upload to ready, tutor with citations, review, quiz, deletion | Pre-release |
| **Device matrix** | Firebase Test Lab low-end Android; TestFlight iOS beta | **Pre-release** |
| **Load** | Exam-period simulation at multiples of expected peak | Pre-release and pre-exam-window |
| **Security** | Automated scanning continuously; review before major releases | Continuous / pre-release |

> **ENG-341 — The `AD-41` structural-adaptivity suite is never skipped, never marked pending, and never weakened to accommodate a new feature.**
> *Why:* `AD-41` — it exists *"solely to prove `D-01` has not been violated"* and is *"the suite most likely to catch a well-intentioned coding agent going wrong."*
> *Prevents:* the loss of the product's central claim, one convenience at a time.
> *Supports:* `NN-01`, `D-01`, `AD-41`.
> *Exception:* none.

> **ENG-342 — Tests never use production data.**
> *Why:* `architecture.md` §33.1 — local and preview environments use seeded synthetic data, *"Never production data."*
> *Prevents:* student content spreading into environments with weaker controls, longer retention, and no deletion cascade.
> *Supports:* `NFR-040`, `NFR-042`, `architecture.md` §33.1.
> *Exception:* the consented evaluation corpora in `evals/corpora/`, which per `AD-21` are collected under explicit consent from alpha participants and are access-controlled.

---

## 57. CI/CD Expectations

The gate list in `architecture.md` §33.2 is canonical: types, lint including architecture lint, unit, integration, **RLS negative-authorisation suite**, **AI evaluation suite**, bundle size, accessibility checks; then migration checks for expand/contract compliance, lock analysis and rollback plan.

> **ENG-343 — A blocking gate is never bypassed, disabled, or made advisory to unblock a release.**
> *Why:* `NN-12`. Every gate in the list encodes a requirement that someone decided was worth blocking for.
> *Prevents:* the one-time exception becoming the new baseline, which is how every gate is eventually lost.
> *Supports:* `NN-12`, `architecture.md` §33.2.
> *Exception:* none.

> **ENG-344 — Architecture lint runs on every PR and enforces the mechanical invariants.** Minimum set: no vendor names outside adapter directories; no forbidden hierarchy identifiers; no unlabelled AI-content renderers; no hard-coded design values; no prohibited directory names; no Tier 1 token references in components; no student-content types reaching the logger.
> *Why:* `architecture.md` §33.2 names architecture lint explicitly. These are exactly the rules that are cheap to check and expensive to catch late.
> *Prevents:* `NN-01`, `NN-02`, `NN-08` and `NN-09` violations reaching review at all.
> *Supports:* `NN-01`, `NN-02`, `NN-08`, `NN-09`, `AG-10`, design §42.
> *Exception:* none.

> **ENG-345 — Every pull request produces a preview deployment with seeded synthetic data.**
> *Why:* `architecture.md` §33.1 and §6 — preview environments per PR are part of the platform selection rationale, and design review depends on them.
> *Prevents:* design and behaviour review happening against a screenshot rather than a running surface.
> *Supports:* `architecture.md` §33.1, §33.2, design §42.
> *Exception:* none.

> **ENG-346 — CI is fast enough to be run before every push, and slow suites are staged rather than removed.**
> *Why:* a slow pipeline is a pipeline people work around, which converts blocking gates into post-hoc discoveries.
> *Prevents:* the erosion of `ENG-343` by inconvenience rather than by decision.
> *Supports:* `NN-12`, `ENG-343`.
> *Exception:* none. Load, device-matrix and full end-to-end suites are legitimately pre-release rather than per-PR.

---

## 58. Deployment

> **ENG-347 — Deployments are progressive, with automatic rollback on error-rate, latency, or grounding-quality regression.**
> *Why:* `architecture.md` §33.2 step 5. Grounding quality being a rollback trigger alongside error rate is deliberate: `AIR-006` and `R-10` make it an availability-class concern.
> *Prevents:* a quality regression running to full traffic before a human notices.
> *Supports:* `AD-35`, `NFR-070`, `architecture.md` §33.2.
> *Exception:* none.

> **ENG-348 — Deployment freezes during examination windows for institutions in the active cohort, encoded in CI.**
> *Why:* `AD-34` — the academic calendar is an input to the release process, *"not a thing someone remembers."*
> *Prevents:* the highest-cost operational event available to this product (`R-31`).
> *Supports:* `AD-34`, `NFR-012`, `R-31`.
> *Exception:* an emergency fix with an explicit override and a named approver, per `AD-34`.

> **ENG-349 — Mobile releases are staged, and the low-end device matrix must pass before store submission.**
> *Why:* `architecture.md` §33.2 step 6 and `NFR-052`. A mobile release cannot be rolled back the way a web deployment can; staged rollout is the only available brake.
> *Prevents:* a broken build reaching every student at once, with a multi-day review cycle before the fix lands.
> *Supports:* `NFR-052`, `architecture.md` §33.2, §69.
> *Exception:* none.

> **ENG-350 — Schema and client changes deploy in the order expand → deploy → migrate reads → contract, never as a coupled release.**
> *Why:* `ENG-179` and `architecture.md` §9.5. Old app builds remain in students' hands after every release.
> *Prevents:* a schema change breaking a client that cannot be updated on demand.
> *Supports:* §69, `NFR-011`, `architecture.md` §9.5.
> *Exception:* none.

---

## 59. Rollback

> **ENG-351 — Every change declares how it is reverted before it is merged.**
> *Why:* `architecture.md` §33.2 step 3 requires a rollback plan on migrations; this generalises it. An undesigned rollback is discovered during an incident, which is the worst time to design anything.
> *Prevents:* a forward-only fix under pressure, which is how one incident becomes two.
> *Supports:* `architecture.md` §33.2, §41.
> *Exception:* none. "Irreversible, and here is why that is acceptable" is a valid declaration.

> **ENG-352 — Rollback never destroys student data. Where a rollback would, the change is redesigned rather than shipped.**
> *Why:* `NN-06` and `AG-03` — no single-component failure loses an uploaded resource or a student edit, and that includes the failure of a release.
> *Prevents:* an operational recovery causing an unrecoverable product harm.
> *Supports:* `NN-06`, `AG-03`, `NFR-010`.
> *Exception:* none.

> **ENG-353 — A routing-policy or prompt-version change is rolled back by configuration, without a code deployment.**
> *Why:* `AD-13` and `architecture.md` §34.4 — routing policy is versioned configuration with automatic quality-regression rollback. Requiring a deployment to undo a quality regression adds hours to the exposure window.
> *Prevents:* extended exposure to a degraded AI experience.
> *Supports:* `AD-13`, `AD-35`, `NFR-070`.
> *Exception:* none.

---

## 60. Feature Flags

> **ENG-354 — Flags are for release control, not for permanent behavioural branching.**
> *Why:* every permanent flag doubles the state space of the code it guards. `EP-10`'s budget does not fund a combinatorial explosion of untested paths.
> *Prevents:* a codebase whose actual behaviour depends on a configuration nobody has fully enumerated.
> *Supports:* `EP-10`, §56.
> *Exception:* operational kill switches — provider disable, generation disable, shedding controls — which are permanent by design and are tested as such.

> **ENG-355 — Every flag has an owner, a purpose, and a removal date. An expired flag fails CI.**
> *Why:* `ENG-002`'s waiver principle applied to flags. Flags outlive their reasons faster than any other artefact.
> *Prevents:* flag debt, and the dead code that hides behind it (`ENG-044`).
> *Supports:* §67, `ENG-002`, `ENG-044`.
> *Exception:* operational kill switches, which have owners and purposes but no removal date.

> **ENG-356 — A flag never gates a security control, an authorisation check, a citation verification, or a provenance label.**
> *Why:* these are the `NN-##` invariants. A flag that can disable one is a mechanism for disabling it.
> *Prevents:* an invariant becoming configurable, which means it is no longer an invariant.
> *Supports:* `NN-12`, all `NN-##`.
> *Exception:* none.

---

## 61. Incident Engineering

The severity ladder in `architecture.md` §41.3 is canonical. `SEV-1` covers student data loss, unauthorised access, **and a fabricated citation delivered to a student**.

> **ENG-357 — A fabricated citation delivered to a student is a SEV-1, handled with the same urgency as a data breach.**
> *Why:* `architecture.md` §41.3 — *"a deliberate encoding of the PRD's own language: 'A fabricated citation is a severity-one defect' (`AIR-006`)"*, and `R-10` rates trust destruction as Critical and irrecoverable.
> *Prevents:* the normalisation of grounding failures as quality issues rather than incidents.
> *Supports:* `NN-11`, `AIR-006`, `R-10`.
> *Exception:* none.

> **ENG-358 — Every SEV-1 and SEV-2 produces a blameless post-incident review with a documented systemic correction, and the correction is scheduled before new feature work in the affected area.**
> *Why:* `architecture.md` §41.3. A review without a scheduled correction is a record of an incident, not a response to one.
> *Prevents:* the same incident twice.
> *Supports:* `architecture.md` §41.3, §67.
> *Exception:* none.

> **ENG-359 — Student-facing incident communication is honest and specific.**
> *Why:* `architecture.md` §41.3, satisfying `NFR-014` and `PR-12`. Design `Rule ER-01` forbids apologising instead of explaining, and that holds at incident scale too.
> *Prevents:* the vague status update, which costs more trust than the incident.
> *Supports:* `NFR-014`, `PR-12`, design `Rule ER-01`.
> *Exception:* security incidents under active investigation, where disclosure timing is a legal and security decision rather than an engineering one — and where the commitment to eventual specificity still stands.

> **ENG-360 — Recovery procedures are drilled, not documented and trusted.**
> *Why:* `architecture.md` §41.2 — *"A DR plan never exercised is a document, not a capability."* A full restore-and-verify drill runs on staging before each major horizon.
> *Prevents:* discovering during an incident that the backup restores to an unusable state.
> *Supports:* `NFR-010`, `NFR-011`, `architecture.md` §41.2.
> *Exception:* none.

---

# Part 9 — Dependencies and Licensing

## 62. Dependency Management

> **ENG-361 — Lockfiles are committed, exact, and never bypassed. Installs in CI are frozen.**
> *Why:* `architecture.md` §36.1 lists supply chain as a Medium threat with lockfiles, dependency scanning and provenance checks as controls. A non-reproducible install is an unreviewable one.
> *Prevents:* a transitive dependency changing between review and deployment.
> *Supports:* `architecture.md` §36.1, §57.
> *Exception:* none.

> **ENG-362 — Dependency updates are routine, small, and reviewed; security updates are expedited.**
> *Why:* the alternative is a large, risky, deferred upgrade — which is deferred again because it is large and risky.
> *Prevents:* the version cliff, where an urgent security patch requires a major-version migration first.
> *Supports:* `NFR-037`, §67.
> *Exception:* none. Updates are still subject to `ENG-348`'s freeze windows.

> **ENG-363 — Dependency scanning runs in CI, and an unresolved critical vulnerability blocks release.**
> *Why:* `architecture.md` §36.5 — automated scanning in CI covering dependencies, static analysis, secret detection and container images.
> *Prevents:* shipping a known-vulnerable dependency.
> *Supports:* `NFR-037`, `architecture.md` §36.5.
> *Exception:* a documented, time-boxed acceptance with a named owner where no fix exists and the risk is assessed as not applicable to Avora's usage.

---

## 63. Package Selection

> **ENG-364 — Prefer the platform, then a small focused package, then a large framework. Never add a dependency for something the standard library does.**
> *Why:* `EP-10` and `NFR-052`. Every dependency is bundle weight on a low-end device, a supply-chain surface, and a future upgrade obligation.
> *Prevents:* the transitive-dependency sprawl that makes both bundle budgets and vulnerability triage unmanageable.
> *Supports:* `EP-10`, `NFR-052`, `architecture.md` §36.1.
> *Exception:* none.

> **ENG-365 — A dependency that would appear in domain code, in `packages/core`, or in a client bundle is held to a higher bar than one confined to an adapter or a build tool.**
> *Why:* `EP-01` — the domain model is sacred. A dependency in domain code shapes the domain; a dependency in an adapter is replaceable by definition.
> *Prevents:* a vendor's model of the world leaking into Avora's.
> *Supports:* `EP-01`, `AG-06`, `ENG-013`.
> *Exception:* none.

---

## 64. Third-Party Library Evaluation

> **ENG-366 — Every new dependency is evaluated against the checklist below and the result is recorded in the pull request.**
> *Why:* dependency decisions are architectural decisions with a lower ceremony threshold, which is precisely why they need a written standard.
> *Prevents:* the dependency added on a Friday that becomes load-bearing by the following quarter.
> *Supports:* `EP-01`, `AG-06`, `architecture.md` §36.1.
> *Exception:* none.

| Dimension | Question | Disqualifying answer |
| --- | --- | --- |
| **Necessity** | Can the platform, an existing dependency, or fifty lines of our own code do this? | Yes |
| **Licence** | Is it permissive and compatible (§65)? | Copyleft in a distributed client; ambiguous or absent licence |
| **Maintenance** | Recent releases, responsive maintainers, more than one maintainer? | Unmaintained, or a single point of failure with no fork path |
| **Size** | What is the bundle cost on mobile, including transitives? | Material against the `NFR-052` budget with no tree-shaking |
| **Surface** | How many transitive dependencies does it pull? | A large tree for a small feature |
| **Security** | Open critical advisories? Provenance verifiable? | Yes / no |
| **Portability** | Does it work on both React Native and the web where it must? | Web-only in shared code (`ENG-013`) |
| **Reversibility** | If it disappears tomorrow, what is the exit? | No exit; its API has become our architecture |
| **Data** | Does it transmit anything? To where? | Any telemetry containing student content or identifiers |
| **Domain fit** | Would it shape our domain types? | Yes — put it behind an adapter instead |

> **ENG-367 — A dependency that transmits data off-device is treated as a vendor, not a library: it goes behind a port, is listed in the data inventory, and is subject to provider eligibility (§50).**
> *Why:* `AD-37`, `NFR-043` and `architecture.md` §37.3's provider eligibility gate. A library that phones home is a processor.
> *Prevents:* an undisclosed data processor entering the system through `package.json`.
> *Supports:* `NFR-040`, `NFR-043`, `AD-37`, `ENG-313`.
> *Exception:* none.

---

## 65. Copyright and Licence Compliance

> **ENG-368 — Every dependency's licence is recorded, and an SBOM is generated per release.** `[RECOMMENDED]`
> *Why:* licence obligations are cheap to satisfy continuously and expensive to reconstruct retroactively, particularly for a product distributed through app stores.
> *Prevents:* a distribution-blocking discovery at store submission.
> *Supports:* `architecture.md` §36.1 (supply chain), legal compliance.
> *Exception:* none once adopted.

> **ENG-369 — Licences are allowlisted, not denylisted. An unrecognised licence blocks the build until reviewed.** `[RECOMMENDED]`
> *Why:* a denylist fails open on anything novel, which is the wrong default for a legal obligation.
> *Prevents:* an incompatible licence entering through a transitive dependency nobody chose.
> *Supports:* `ENG-368`, legal compliance.
> *Exception:* review may add a licence to the allowlist with a recorded rationale.

Indicative allowlist, requiring legal sign-off before it becomes binding: MIT, ISC, Apache-2.0, BSD-2-Clause, BSD-3-Clause, Unlicense, CC0. **Requires review:** MPL-2.0, LGPL. **Prohibited in distributed clients:** GPL, AGPL. **Prohibited everywhere:** unlicensed code, code of unclear provenance, and any code copied from a source whose licence has not been checked.

> **ENG-370 — Code is not copied from external sources — including Stack Overflow, blog posts, other repositories, or AI-generated output that reproduces a recognisable third-party implementation — without verifying its licence and recording attribution.**
> *Why:* copyright obligations attach regardless of how the code arrived, and an AI coding agent can reproduce licensed code without either party noticing.
> *Prevents:* an undetectable licence violation in a distributed binary.
> *Supports:* legal compliance, §74.
> *Exception:* none. Where attribution is required, it is recorded in a `NOTICES` file shipped with the client.

> **ENG-371 — Student content is not a training asset, and no engineering process may make it one.**
> *Why:* `NFR-043` and the public trust commitment that student content is never used to train third-party foundation models (`architecture.md` §37.3). This binds engineering practice as well as vendor contracts: evaluation corpora are consented (`AD-21`), access-controlled, and retention-bounded under `AOQ-06`.
> *Prevents:* a violation of the product's most differentiating public promise, through an internal process rather than a vendor.
> *Supports:* `NFR-043`, `AD-21`, `ENG-313`, `architecture.md` §37.3.
> *Exception:* none.

---

## 66. Open Source Usage

> **ENG-372 — Consuming open source carries an obligation to report upstream. Forking carries an obligation to justify and to plan the un-fork.** `[RECOMMENDED]`
> *Why:* a fork is a permanent maintenance liability that is invisible until the upstream security patch arrives and does not apply.
> *Prevents:* silently maintaining a vendored copy of an abandoned library.
> *Supports:* `ENG-362`, §67.
> *Exception:* a temporary patch pending an accepted upstream fix, recorded as debt with an owner (`ENG-002`).

> **ENG-373 — Nothing published from this repository may contain student content, credentials, prompts under review, evaluation corpora, or internal identifiers.**
> *Why:* `AD-21` names the evaluation corpus as *"the single most valuable engineering asset created before launch"*, collected under explicit consent and access-controlled. Prompts are proprietary reviewed code (`architecture.md` §14.5).
> *Prevents:* the accidental publication of consented student material or competitive assets.
> *Supports:* `NFR-040`, `AD-21`, `architecture.md` §14.5.
> *Exception:* none.

---

# Part 10 — Evolution

## 67. Technical Debt

> **ENG-380 — Debt is recorded, owned, and dated. Unrecorded debt does not exist and therefore never gets paid.**
> *Why:* `ENG-002` and `ENG-047` establish the mechanism; this states the principle. Debt that lives only in an engineer's memory leaves with that engineer.
> *Prevents:* the slow accumulation that eventually presents as "we need a rewrite".
> *Supports:* `EP-10`, maintainability.
> *Exception:* none.

> **ENG-381 — Debt is classified by what it threatens, and debt threatening an `NN-##` invariant is not debt. It is a defect, fixed immediately.**
> *Why:* the invariants have no acceptable violation period. A missing RLS policy is not a task for next sprint.
> *Prevents:* an invariant violation being triaged as a backlog item.
> *Supports:* all `NN-##`, `NFR-031`, `AIR-006`.
> *Exception:* none.

| Class | Definition | Handling |
| --- | --- | --- |
| **Invariant breach** | Threatens an `NN-##` | Not debt. Fix now. Stop other work if necessary. |
| **Structural** | Wrong boundary, wrong layer, wrong ownership | Scheduled deliberately; grows most expensive with time |
| **Quality** | Missing tests, missing states, weak error handling | Paid down alongside the next change in that area |
| **Cosmetic** | Naming, formatting, small inconsistency | Fixed opportunistically; never blocks |

> **ENG-382 — A recurring incident, a recurring review comment, or a recurring bug in one area is treated as evidence of structural debt and triggers a design review.**
> *Why:* repeated symptoms in one place are a design signal, not a discipline signal. Asking engineers to be more careful is not a fix.
> *Prevents:* the same defect being fixed indefinitely at the leaf while its cause persists at the root.
> *Supports:* `ENG-358`, `EP-10`.
> *Exception:* none.

---

## 68. Refactoring

> **ENG-383 — Refactoring never changes behaviour, and behaviour changes never accompany refactoring.**
> *Why:* `ENG-325`. A combined diff is unreviewable, and this codebase's most important review checks are the ones a large diff defeats.
> *Prevents:* an unreviewed behaviour change reaching production inside a "cleanup".
> *Supports:* §54, `NN-12`.
> *Exception:* none.

> **ENG-384 — Refactoring requires tests that pass before and after, unchanged.**
> *Why:* if the tests must change, behaviour changed, which means it was not a refactor.
> *Prevents:* a refactor that quietly relaxes an invariant assertion.
> *Supports:* §56, `ENG-383`.
> *Exception:* tests that assert on internal structure rather than behaviour, which are themselves the problem and are fixed first.

> **ENG-385 — Refactor when the next change requires it, not when the code offends.**
> *Why:* `EP-10`. A refactor consumes complexity budget and review attention while adding no student value; it is justified by what it unblocks.
> *Prevents:* speculative restructuring, and the churn that makes `git blame` useless.
> *Supports:* `EP-10`, philosophy value 7.
> *Exception:* debt in the classes above, refactored on schedule rather than on demand.

> **ENG-386 — A large refactor is delivered incrementally behind an unchanged public surface, never as a single merge.**
> *Why:* `ENG-320` and `ENG-327`. A three-week refactor branch will conflict with a migration, a token change, or a contract change — and the resolution of those conflicts is exactly where invariants get lost.
> *Prevents:* the big-bang merge, which is the highest-risk event a codebase can experience.
> *Supports:* `ENG-320`, `NN-12`.
> *Exception:* none.

---

## 69. Backward Compatibility

Avora ships a store-distributed mobile client. Old builds remain in students' hands for weeks, and cannot be updated on demand. **Every contract is therefore a versioned public API**, whether or not it looks like one.

> **ENG-387 — Contract changes are additive. Fields are added optional; fields are removed only after telemetry shows no client reads them.**
> *Why:* the deployment asymmetry above, and `ENG-179`'s expand/contract discipline applied to the API surface.
> *Prevents:* an old build crashing or silently mis-rendering after a server deployment.
> *Supports:* `NFR-011`, `ENG-179`, `ENG-350`.
> *Exception:* none.

> **ENG-388 — A client never assumes it is the newest client, and a server never assumes all clients are current.**
> *Why:* both assumptions are false by construction on a store-distributed app.
> *Prevents:* a class of defect that is invisible in testing, because test devices always run the newest build.
> *Supports:* `NFR-011`, `ENG-349`.
> *Exception:* none.

> **ENG-389 — A minimum supported client version is defined, enforced with an honest upgrade prompt, and moved forward deliberately rather than by accident.**
> *Why:* infinite compatibility is not achievable; the alternative to a stated floor is an unstated and unknown one.
> *Prevents:* a student stranded on a build the server no longer supports, with no explanation.
> *Supports:* `NFR-014`, `ENG-387`.
> *Exception:* none. The prompt follows design `Rule ER-01`: explain and offer the next step.

> **ENG-390 — Persisted local data is versioned and migrated forward, never discarded.**
> *Why:* the local store holds the outbox, note buffers and unsynced attempts (`architecture.md` §27.2), and `ENG-136` forbids evicting them. A schema change that clears local storage destroys unsynced student work.
> *Prevents:* an `NN-06` violation delivered by an app update.
> *Supports:* `NN-06`, `NFR-015`, `AD-29`.
> *Exception:* none.

---

## 70. Production Readiness

> **ENG-391 — A capability is not production-ready until every item below is true. "Working" is not the same as "ready".**
> *Why:* every item is an upstream requirement, and every one of them is routinely deferred under delivery pressure — which is exactly why the list exists as a gate rather than as guidance.
> *Prevents:* the shipped-but-unowned feature: no states, no alerts, no rollback, no traceability.
> *Supports:* all of Part 7, `NFR-063`, `architecture.md` §33.2.
> *Exception:* none.

**Production readiness checklist**

*Requirements and design*
- [ ] Traces to a requirement identifier; module README updated
- [ ] Passes the twenty checks in `DESIGN-SYSTEM.md` §42 and Appendix B
- [ ] All six applicable states implemented (`DP-06`)
- [ ] Copy taken from the reviewed content catalogue; passes the tone floor

*Correctness*
- [ ] Structure adaptivity verified at zero, one and three levels, with a non-standard label
- [ ] `AD-41` suite passes; new cases added if the capability touches structure
- [ ] Unit and integration tests present; bug-fix regression tests present

*Security and privacy*
- [ ] RLS policy present; negative-authorisation tests present
- [ ] New columns classified with a stated purpose
- [ ] Included in the deletion cascade, with verification
- [ ] No student content in logs, analytics or events
- [ ] Inputs validated at the boundary; outputs encoded

*AI, where applicable*
- [ ] Flows through the AI Gateway; no model name in the feature module
- [ ] Evidence sealed in the envelope; zero tool authority
- [ ] Citations verified; blocked delivery path exercised
- [ ] Provenance stamped; badge rendered; report affordance present
- [ ] Evaluation suite passes; prompt version recorded

*Operations*
- [ ] Golden signals instrumented; alerts defined and traced
- [ ] Cost per student measured; within budget or justified
- [ ] Job classes and idempotency keys declared
- [ ] Rollback declared and tested; migration expand/contract compliant
- [ ] Load behaviour understood at exam-period multiples
- [ ] Performance budgets met on the low-end device matrix

*Accessibility*
- [ ] Contrast verified against the actual background used
- [ ] 44 dp targets with 8 dp separation; visible focus; correct order
- [ ] Greyscale-legible; readable at 200%; screen-reader labels present

---

## 71. Future Scalability

`architecture.md` §43 states what each roadmap horizon requires and why it is already possible. §43.1 names six anticipated pressure points. The engineering obligation is to keep those escape hatches open.

> **ENG-392 — New capabilities extend existing patterns; they do not introduce parallel ones.**
> *Why:* design `Rule FS-01` — *"Every new pattern is a permanent tax on every future screen"* — and `architecture.md` §43, where every V1–V3 capability is additive precisely because no parallel mechanism was introduced.
> *Prevents:* the second way of doing things, which becomes the third.
> *Supports:* `NFR-060`, `PR-13`, design `Rule FS-01`, `EP-10`.
> *Exception:* a genuine category mismatch, argued in an ADR.

> **ENG-393 — A new resource type, discipline, language or artifact class must be additive. If it requires a graph redesign, the design is wrong.**
> *Why:* `NFR-060` and `AG-09`. `architecture.md` §43 makes V3 lecture capture *"the test of that requirement"* — a new resource type entering the existing ingestion pipeline without redesigning the graph.
> *Prevents:* a schema that accommodates only what was imagined at V0.
> *Supports:* `NFR-060`, `AG-09`, `PR-13`.
> *Exception:* none.

> **ENG-394 — Ports stay narrow. A port that has grown to mirror one vendor's API is no longer a port.**
> *Why:* `AG-06` and `architecture.md` §17.6 — `RetrievalPort` remains replaceable because its surface is `retrieve(scope, query, budget) → EvidenceEnvelope`, not because it was labelled a port.
> *Prevents:* the pre-built escape hatch (`AS-01`) being welded shut by accretion.
> *Supports:* `AG-06`, `AS-01`, `NFR-061`.
> *Exception:* none.

> **ENG-395 — Cross-student features and agentic tutor behaviour are architectural changes, never feature decisions.**
> *Why:* `architecture.md` §43.1 points 2 and 3 — tool-calling collides directly with `AD-17`'s zero-tool-authority rule, and any collaborative feature reopens both the authorization model and the deletion cascade, which currently assume single ownership.
> *Prevents:* the two changes most likely to breach a security invariant while looking like product work.
> *Supports:* `NN-03`, `NN-04`, `AD-17`, `NFR-042`, `NG-03`.
> *Exception:* none.

---

# Part 11 — AI Coding Agents

`AG-10` makes an agent-legible codebase an architecture goal and names AI coding agents as declared consumers of the specification. This part is written directly to them. **Every rule in this document applies to agents; the rules here are additional.**

## 72. Agent Operating Instructions

> **ENG-400 — Read `PRD.md`, `architecture.md`, `DESIGN-SYSTEM.md` and this document before generating code. A screenshot, a code sample, or a task description is not a specification.**
> *Why:* design §44.3 rule 1 states it for UI; `architecture.md` §47 states it for the system. An agent that infers the specification from surrounding code will faithfully reproduce that code's mistakes.
> *Prevents:* the propagation of an existing defect — including the eleven inconsistencies design §47 records in production today.
> *Supports:* `AG-10`, design §44.3.
> *Exception:* none.

> **ENG-401 — Never contradict approved documentation. When this document and an instinct conflict, the document wins. When this document and `architecture.md` conflict, `architecture.md` wins. When either conflicts with the PRD, the PRD wins, and the conflict is a defect that must be reported.**
> *Why:* `architecture.md` §47.1 rule 10, extended down one layer to include this document.
> *Prevents:* silent divergence, which is undetectable and compounding.
> *Supports:* `EP-09`, §0.2, `AG-10`.
> *Exception:* none.

> **ENG-402 — Never invent architecture. Never redesign approved UI.**
> *Why:* the architecture is approved and the design system is canonical. A new pattern introduced by an agent carries the permanent tax of `Rule FS-01` without ever having been reviewed.
> *Prevents:* an unreviewed architectural or visual decision entering the product at the speed of code generation.
> *Supports:* `AD-01`–`AD-41`, design §0.1, `Rule FS-01`.
> *Exception:* none. Propose; do not implement.

> **ENG-403 — Prefer extending existing code over rewriting it, and reuse an existing component before creating one.**
> *Why:* design `Rule CP-01` and `Rule FS-01`. A rewrite discards accumulated correctness — the edge cases, the requirement guards, the accessibility work — that is invisible in the code but expensive to recover.
> *Prevents:* the loss of undocumented-but-real correctness.
> *Supports:* `Rule CP-01`, `Rule FS-01`, `EP-10`.
> *Exception:* a rewrite explicitly requested and scoped by a human, with the discarded behaviour enumerated first.

> **ENG-404 — Introduce no new dependency without explicit human approval.**
> *Why:* §63 and §64 make dependency selection a reviewed decision with licence, security, size and portability dimensions. An agent cannot assess the legal and supply-chain dimensions.
> *Prevents:* an unvetted package entering the bundle, the SBOM, and the attack surface.
> *Supports:* `ENG-364`, `ENG-366`, `ENG-368`.
> *Exception:* none.

> **ENG-405 — Ask rather than assume. State assumptions explicitly and separate them from documented facts.**
> *Why:* an agent's assumption is indistinguishable from a specification once it is code. `architecture.md` §47.2 lists eleven open items and instructs: **do not guess** — *"If a task appears to require one of them, stop and escalate."*
> *Prevents:* an open product question being silently decided in an implementation detail.
> *Supports:* `AG-10`, §75, `architecture.md` §47.2.
> *Exception:* none.

> **ENG-406 — Never disable, weaken, or work around a failing gate to make a task complete.**
> *Why:* `NN-12`. A blocking gate that blocks is working. Every gate in this system encodes an invariant someone decided was worth blocking for.
> *Prevents:* the single most damaging thing an agent can do in this codebase: satisfy the letter of a task by removing the mechanism that would have caught the violation.
> *Supports:* `NN-12`, `ENG-343`, `ENG-004`.
> *Exception:* **none.** If a gate blocks legitimate work, report it and stop.

---

## 73. Code Generation Rules

Consolidated, in the order an agent will encounter them. These restate obligations defined elsewhere in this document; they are gathered here because an agent working on a single task should not have to reconstruct them from twelve sections.

| # | Rule | Source |
| --- | --- | --- |
| 1 | Never introduce a fixed academic hierarchy — no table, column, enum, type, constant, prompt assumption, prop, or string encoding a level | `NN-01`, `ENG-028`, `ENG-029` |
| 2 | Never hard-code a structure label, including in fixtures and examples | `ENG-126`, design `Rule N-06` |
| 3 | Never introduce validation that rejects an unrecognised structure label | `ENG-275`, `AD-05` |
| 4 | Never import a vendor SDK outside an adapter directory — model/embedding/orchestration providers under `packages/ai/adapters/`, all other vendors under `packages/adapters/` | `ENG-018`, `architecture.md` §47.1 |
| 5 | Never write a model name into a feature module — declare a task | `ENG-211`, `AD-13` |
| 6 | Never bypass the AI Gateway, including for a quick classification | `ENG-210`, `AD-12` |
| 7 | Never construct model context by string concatenation — use the six-part envelope | `ENG-217`, `AD-17` |
| 8 | Never grant tool authority to a request containing untrusted evidence | `ENG-223`, `AD-17` |
| 9 | Never render an AI artifact without `AIGeneratedBadge`, or a citation without `CitationChip` | `ENG-034`, design `AI-2`, `AI-3` |
| 10 | Never represent a citation as free text at any layer | `NN-11`, `ENG-168` |
| 11 | Never add a student-scoped table without an RLS policy and negative-authorisation tests | `ENG-172`, `ENG-175` |
| 12 | Never add a column holding student data without a classification and a purpose | `ENG-169`, `AD-37` |
| 13 | Never authorise by identifier alone | `ENG-187`, `NFR-031` |
| 14 | Never introduce a synchronous path that can exceed 300 ms — enqueue a job | `ENG-155`, `EP-03` |
| 15 | Never overwrite a `student` or `co_created` artifact | `ENG-236`, `FR-075` |
| 16 | Never log student content, including filenames | `ENG-255`, `AD-36` |
| 17 | Never introduce a colour, size, radius, duration or font value — tokens only; if none exists, stop and ask | `ENG-124`, design §44.3 |
| 18 | Never author insight, progress or error copy — take it from the content catalogue | `ENG-127`, `architecture.md` §7.4 |
| 19 | Never ship a component without its applicable states | `ENG-036`, design `Rule CP-02` |
| 20 | Never use a prohibited vocabulary term as an identifier, path, schema object or string | `ENG-027`, `Rule CP-03` |
| 21 | Never use `any`, a non-null assertion, or a type assertion in domain code | `ENG-051`, `ENG-052` |
| 22 | Never place a service-role credential in a client-facing runtime | `ENG-153`, `ENG-268` |
| 23 | Never add a store, cache or destination for student data without adding it to the deletion cascade in the same change | `ENG-310`, `AD-38` |
| 24 | Always trace work to a requirement identifier | `NN-10`, `ENG-326` |
| 25 | Always assume mobile-first constraints and a low-end device | `ENG-131`, `NFR-052` |

---

## 74. Quality Bar for AI-Generated Code

> **ENG-407 — AI-generated code is held to a higher standard than human-written code, not a lower one.**
> *Why:* an agent produces more code, faster, with less context and no accountability. Volume is a reason for more scrutiny, not less. `ENG-333` makes the reviewer accountable regardless of authorship.
> *Prevents:* the normalisation of plausible-but-wrong code at a rate no review process can absorb.
> *Supports:* `AG-10`, `ENG-333`.
> *Exception:* none.

**The bar, concretely.** Generated code is not acceptable unless all of the following hold:

1. It compiles under full strictness with no suppressions, no `any`, and no assertions (§12).
2. It is traceable — the pull request names the requirement it satisfies (`NN-10`).
3. It is consistent — it uses the existing pattern rather than a new one, and the existing vocabulary rather than a synonym (§9, §73).
4. It is complete — states, errors, empty cases and offline behaviour are implemented, not stubbed (`ENG-036`).
5. It is tested — including a negative-authorisation test for any new table and a structure-adaptivity case for any structure-touching change (§56).
6. It is honest — assumptions are stated in the pull request, marked as assumptions, and separated from what the documents actually say (`ENG-405`).
7. It is bounded — it changes only what the task requires. Unrelated "improvements" are removed before review (`ENG-325`).
8. It contains no invented citation, invented requirement identifier, invented token name, or invented API. **A fabricated identifier in a code comment is the same defect class as a fabricated citation in a student answer: a confident reference to something that does not exist.**

> **ENG-408 — An agent never fabricates a reference. If an identifier, token, component, endpoint or requirement cannot be verified in the repository or an upstream document, it is not cited.**
> *Why:* the product's entire trust posture is built on verifiable references (`AG-02`, `AIR-006`). A codebase whose comments cite requirements that do not exist is a codebase whose traceability is decorative.
> *Prevents:* the erosion of `NFR-063` traceability into a set of plausible-looking strings.
> *Supports:* `NN-10`, `NFR-063`, `AG-02`.
> *Exception:* none.

---

## 75. Escalation and Unresolved Items

> **ENG-409 — The following are open. They must not be silently decided in code. If a task appears to require one, stop and escalate.**
> *Why:* `architecture.md` §47.2 states this list and this instruction. `DESIGN-SYSTEM.md` §48 adds the design-side equivalents. An implementation detail that answers an open founder question is a product decision made by whoever happened to be typing.
> *Prevents:* the most consequential form of scope creep available — deciding the product by default.
> *Supports:* `architecture.md` §47.2, design §48, `AG-10`.
> *Exception:* none.

**Architecture-side (`architecture.md` §47.2):** `AOQ-01` Antigravity capability surface — build on the direct adapter meanwhile · `AOQ-02` mobile client platform · `AOQ-03` Indian payment provider · `AOQ-04`/`OQ-03` free-tier limit unit · `AOQ-05` data residency posture · `AOQ-06` evaluation payload retention · `AOQ-07`/`OQ-04` scheduler algorithm and default review load · `OQ-01` default structure depth at setup · `OQ-02` classification ask-versus-assume threshold · `OQ-05` shared structures: live reference or copy · `OQ-06` how prerequisite relationships are established.

**Design-side (`DESIGN-SYSTEM.md` §48):** `DQ-01` canonical background value · `DQ-02` confirmed accent hue and its contrast on fill · `DQ-03` light theme target · `DQ-04` primary client platform · `DQ-05` classification confidence threshold · `DQ-06` Attendance as a tracked capability · `DQ-07` email + password versus OTP · `DQ-08` readiness percentage visibility on the Subjects list. **Twelve token values (`VB-01`–`VB-12`) require verification against `packages/design-tokens/` before the design system is promoted from Draft.**

**Engineering-side:** the `EOQ-##` register in §80.

> **ENG-410 — Where an unresolved item must be given a value to proceed, it is implemented as configuration with a documented default and a link to the open question — never as a constant.**
> *Why:* `ENG-265`. `architecture.md` §19.4 uses exactly this approach for the ask-threshold *"so the product can answer the question with data rather than opinion."*
> *Prevents:* an open question hardening into an undocumented decision that nobody remembers making.
> *Supports:* `ENG-265`, `SM-03`, `AD-22`, `AD-24`.
> *Exception:* none.

> **ENG-411 — When a coding agent finds this document and the code in disagreement, or two upstream documents in disagreement, it reports the disagreement and stops. It does not choose.**
> *Why:* design §44.3 rule 8 — *"When this document and a live screen disagree, raise it — do not silently follow either."* The disagreement is signal; resolving it privately destroys the signal.
> *Prevents:* an inconsistency being resolved differently by each agent that encounters it.
> *Supports:* `ENG-336`, `ENG-401`, design §47.
> *Exception:* none.

---

# Part 12 — Checklists and Registers

## 76. Code Review Checklist

Work down. Anything mechanically checkable should already have failed CI; if it did not, the missing check is itself a review finding (`ENG-329`).

**Traceability**
- [ ] A requirement identifier is named, and it exists
- [ ] The module README is updated if the module's scope changed
- [ ] Upstream documents were amended first where the change required it

**The twelve non-negotiables**
- [ ] No fixed hierarchy introduced — schema, code, prompt, prop, fixture or string
- [ ] All model access flows through the Gateway; no SDK, key or model name in a feature module
- [ ] Student material sealed in the evidence envelope; no tool authority granted
- [ ] RLS policy present and negative tests present; workers assert `student_id`
- [ ] No new synchronous path over 300 ms; expensive commands return a job handle
- [ ] No overwrite path for `student` or `co_created` content
- [ ] Artifacts reference `structure_unit_id`; `path` remains derived
- [ ] AI content labelled everywhere, including export
- [ ] No student content in logs, events, analytics or error reports
- [ ] Work traces to a requirement
- [ ] Citations are foreign keys, never strings
- [ ] No gate weakened or disabled

**Correctness**
- [ ] Errors handled, converted or re-thrown — never swallowed
- [ ] All state-machine branches handled exhaustively
- [ ] Idempotency keys present on mutations, jobs and webhooks
- [ ] Structure adaptivity holds at zero, one and three levels, with a non-standard label

**Security and privacy**
- [ ] Inputs validated at the boundary; no mass assignment
- [ ] Identity derived from the session, never from the body
- [ ] Outputs encoded; no raw markup from student or model content
- [ ] New columns classified with a purpose
- [ ] New data destinations added to the deletion cascade

**Design system**
- [ ] Tokens only; no hard-coded visual values; no Tier 1 references
- [ ] One primary action per viewport; card anatomy respected
- [ ] All six applicable states present, each error with a recovery action
- [ ] Copy from the catalogue; canonical vocabulary; passes the tone floor
- [ ] 44 dp targets, visible focus, greyscale-legible, readable at 200%

**Operations**
- [ ] Cost impact understood; budgets respected
- [ ] Signals and alerts present for anything new
- [ ] Rollback declared; migration expand/contract compliant
- [ ] Performance budgets met

**Craft**
- [ ] Names are long, unambiguous, and use the glossary
- [ ] Functions do one thing; complexity within budget
- [ ] No dead code, no unowned TODOs, no commented-out blocks
- [ ] Tests present, deterministic, and meaningful

---

## 77. Engineering Do's

| Do | Because |
| --- | --- |
| Read all four documents before writing code | Inferring the spec from the code reproduces its defects — `ENG-400` |
| Push correctness into the lowest layer that can enforce it | `EP-02` — the API layer will eventually contain a bug |
| Make the rule structurally impossible to violate, not merely discouraged | `architecture.md` §7.4 — the rules an agent forgets are the ones to make impossible |
| Treat every student upload as hostile bytes *and* hostile text | `EP-05` — two threat classes, two control sets |
| Return a job handle for anything expensive | `EP-03`, `NN-05` — nothing blocks the student |
| Store a citation as a foreign key | `NN-11`, `architecture.md` §45.8 — the alternative makes `AIR-006` unenforceable |
| Version every derived artifact by the strategy that produced it | `AD-06` — upgrades become backfills, not incidents |
| Write the negative-authorisation test before the feature | `ENG-175` — a policy without a negative test is a policy nobody has checked |
| Test against "Experiment 7" and against a subject with no structure | `AD-41` — the Meera test is the product's central claim |
| Name the unit in the variable | `ENG-032` — unit mismatches type-check |
| Design the empty, offline, partial and failed states first | `DP-06` — they are where trust is decided |
| State the evidence beside every claim | `DP-03`, `PR-06` — an unexplained assertion about a student is not usable |
| Record the decision as an ADR | `architecture.md` §32.1 — rejected options come back |
| Fix documentation drift in the pull request that found it | `ENG-337` — drift compounds |
| Escalate an open question rather than answering it in code | `architecture.md` §47.2 — do not guess |
| Delete code with no traceable requirement | `architecture.md` §0 — deleted, not documented |

---

## 78. Engineering Don'ts

| Don't | Because |
| --- | --- |
| Add an "other" bucket to a hierarchy | `architecture.md` §45.7 — it is a fixed hierarchy with a disclaimer |
| Validate a structure label against a whitelist | `AD-05` — a student in an unseen discipline would be rejected |
| Put a model name or a provider SDK in a feature module | `AD-12`, `AD-13` — `NFR-061` is already violated at that point |
| Concatenate student content into an instruction string | `AD-17` — this is the `R-13` injection vector |
| Grant a tool to a request containing retrieved evidence | `AD-17`, `architecture.md` §43.1 — and this must not be quietly relaxed |
| Soften or caveat an unresolvable citation | `AD-14` — blocked, logged severity one, never shown |
| Authorise with an unguessable identifier | `NFR-031` — the wording is explicit |
| Skip RLS because "the API already checks" | `architecture.md` §12.2 — layer 5 is the boundary that matters |
| Put a service-role key anywhere that accepts client input | `AD-11` — the highest-risk privilege in the system |
| Log a filename | `AD-36` — filenames reveal subject, institution and identity |
| Overwrite an AI note that a student has edited | `FR-075` — an absolute rule |
| Sync card states instead of attempts | `AD-23` — it would require conflict resolution and could lose review history |
| Poll for job progress | `architecture.md` §7.3 — a battery and data tax on metered connections |
| Use offset pagination | `architecture.md` §8.2 — a latency time bomb on a graph that never resets |
| Hard-code a colour, radius, duration or font size | design `Rule T-01` — a defect regardless of whether it looks correct |
| Write "Sorry, something went wrong" | design `Rule ER-01` — explain and offer the next step |
| Disable zoom | design `AX-27` — an outright WCAG AA failure |
| Ship a spinner for work over one second | design `Rule LD-03` — skeletons make the same wait feel shorter |
| Add a streak, a countdown to nothing, or a celebration | `RAI-06`, `RAI-07` |
| Introduce a dependency to save fifty lines | `NFR-052` — it is bundle weight, supply-chain surface, and an upgrade obligation |
| Disable a failing gate to ship | `NN-12` — a gate that blocks is working |
| Decide an open question in an implementation detail | `architecture.md` §47.2 — stop and escalate |

---

## 79. Rule Register

Rule identifiers are permanent. A retired rule is marked retired and keeps its number; numbers are never reused. Gaps between bands are deliberate, to allow insertion without renumbering.

| Band | Section | Domain |
| --- | --- | --- |
| `ENG-000`–`ENG-004` | §0, §4 | Document mechanics; non-negotiable enforcement |
| `ENG-010`–`ENG-014` | §5 | Project structure and package dependencies |
| `ENG-015`–`ENG-019` | §6 | Folder organisation |
| `ENG-020`–`ENG-022` | §7 | File naming |
| `ENG-023`–`ENG-026` | §8 | Module boundaries and ports |
| `ENG-027`–`ENG-032` | §9 | Vocabulary, forbidden identifiers, general naming |
| `ENG-033`–`ENG-036` | §10 | Component naming, layering, contracts, states |
| `ENG-040`–`ENG-047` | §11 | Code quality and complexity budgets |
| `ENG-050`–`ENG-058` | §12 | TypeScript |
| `ENG-060`–`ENG-063` | §13 | Documentation and comments |
| `ENG-065`–`ENG-067` | §14 | Testability by design |
| `ENG-100`–`ENG-103` | §15 | Frontend |
| `ENG-105`–`ENG-110` | §16 | React |
| `ENG-112`–`ENG-115` | §17 | State management |
| `ENG-117`–`ENG-121` | §18 | Data fetching |
| `ENG-123`–`ENG-129` | §19 | Design system compliance |
| `ENG-131`–`ENG-136` | §20 | Mobile |
| `ENG-138`–`ENG-141` | §21 | Offline and synchronisation |
| `ENG-150`–`ENG-155` | §22 | Backend layering |
| `ENG-156`–`ENG-162` | §23 | API design |
| `ENG-163`–`ENG-171` | §24 | Database |
| `ENG-172`–`ENG-177` | §25 | Supabase |
| `ENG-178`–`ENG-182` | §26 | Migrations |
| `ENG-183`–`ENG-186` | §27 | Authentication |
| `ENG-187`–`ENG-190` | §28 | Authorization |
| `ENG-191`–`ENG-197` | §29 | Background jobs |
| `ENG-198`–`ENG-201` | §30 | Domain events |
| `ENG-210`–`ENG-215` | §31 | AI integration |
| `ENG-216`–`ENG-220` | §32 | Prompt management |
| `ENG-221`–`ENG-228` | §33 | Context and grounding |
| `ENG-229`–`ENG-236` | §34 | Response validation |
| `ENG-237`–`ENG-241` | §35 | AI cost discipline |
| `ENG-250`–`ENG-254` | §36 | Error handling |
| `ENG-255`–`ENG-259` | §37 | Logging |
| `ENG-260`–`ENG-263` | §38 | Monitoring |
| `ENG-264`–`ENG-266` | §39 | Configuration |
| `ENG-267`–`ENG-269` | §40 | Environment variables |
| `ENG-270`–`ENG-272` | §41 | Secrets |
| `ENG-273`–`ENG-276` | §42 | Input validation |
| `ENG-277`–`ENG-279` | §43 | Output encoding |
| `ENG-280`–`ENG-285` | §44 | File uploads |
| `ENG-286`–`ENG-288` | §45 | Rate limiting |
| `ENG-289`–`ENG-292` | §46 | Caching |
| `ENG-293`–`ENG-296` | §47 | Performance |
| `ENG-297`–`ENG-302` | §48 | Accessibility |
| `ENG-303`–`ENG-307` | §49 | Security-first development |
| `ENG-308`–`ENG-314` | §50 | Privacy-first development |
| `ENG-320`–`ENG-323` | §51 | Git and branching |
| `ENG-324`–`ENG-325` | §52 | Commit messages |
| `ENG-326`–`ENG-328` | §53 | Pull requests |
| `ENG-329`–`ENG-333` | §54 | Code review |
| `ENG-334`–`ENG-337` | §55 | Documentation |
| `ENG-338`–`ENG-342` | §56 | Testing |
| `ENG-343`–`ENG-346` | §57 | CI/CD |
| `ENG-347`–`ENG-350` | §58 | Deployment |
| `ENG-351`–`ENG-353` | §59 | Rollback |
| `ENG-354`–`ENG-356` | §60 | Feature flags |
| `ENG-357`–`ENG-360` | §61 | Incident engineering |
| `ENG-361`–`ENG-363` | §62 | Dependency management |
| `ENG-364`–`ENG-365` | §63 | Package selection |
| `ENG-366`–`ENG-367` | §64 | Third-party evaluation |
| `ENG-368`–`ENG-371` | §65 | Copyright and licensing |
| `ENG-372`–`ENG-373` | §66 | Open source usage |
| `ENG-380`–`ENG-382` | §67 | Technical debt |
| `ENG-383`–`ENG-386` | §68 | Refactoring |
| `ENG-387`–`ENG-390` | §69 | Backward compatibility |
| `ENG-391` | §70 | Production readiness |
| `ENG-392`–`ENG-395` | §71 | Future scalability |
| `ENG-400`–`ENG-406` | §72 | Agent operating instructions |
| `ENG-407`–`ENG-408` | §74 | AI-generated code quality |
| `ENG-409`–`ENG-411` | §75 | Escalation |

**Rules marked `[RECOMMENDED]`, requiring sign-off before they bind:** `ENG-002`, `ENG-004`, `ENG-019` (colocation preference only — its `e2e/` exception is `[TRACED]`), `ENG-022`, the complexity budgets in §11, `ENG-320`, `ENG-324`, `ENG-327`, `ENG-368`, `ENG-369`, `ENG-372`, and the file-naming table in §7. All other rules are `[TRACED]` or `[DERIVED]` and are binding on adoption of this document.

---

## 80. Engineering Open Questions

Questions this document cannot resolve alone. Each needs an owner and a decision before Status moves from Draft. **None may be answered in code (`ENG-409`).**

| ID | Question | Owner | Why it matters |
| --- | --- | --- | --- |
| **EOQ-01** | Are the complexity budgets in §11 the right thresholds for this codebase? | Engineering Lead | They are CI-blocking; wrong values will be routinely waived, which trains the team to waive |
| **EOQ-02** | What is the waiver format and expiry policy (`ENG-002`)? | Engineering Lead | Without a mechanism, deviations go unrecorded and precedent forms by accident |
| **EOQ-03** | Who are the second approvers for `NN-##` guard changes (`ENG-004`), and what is the coverage model out of hours? | CTO | A two-approver rule with one qualified approver is a one-approver rule with delay |
| **EOQ-04** | What is the minimum supported client version policy and the cadence for advancing it (`ENG-389`)? | CTO + Product | Determines how long backward compatibility obligations persist and how much dual-path code is carried |
| **EOQ-05** | What is the licence allowlist, confirmed by counsel (§65)? | Counsel + CTO | Store distribution makes this a release blocker, not a hygiene item |
| **EOQ-06** | What is the CI wall-clock budget, and which suites are per-PR versus pre-release (`ENG-346`)? | Engineering Lead | A slow pipeline is worked around, which silently converts blocking gates into advisory ones |
| **EOQ-07** | What is the review SLA, and what is the escalation path when it is missed? | Engineering Lead | Review is the enforcement layer for everything the type system and CI cannot catch |
| **EOQ-08** | Which AI coding agents are approved, at what autonomy level, and what is the audit trail for agent-authored commits? | CTO | `AG-10` makes agents declared consumers; §74 sets the bar, but attribution and autonomy policy are not decided |
| **EOQ-09** | Do the `[RECOMMENDED]` conventions in §7, §51 and §52 stand as written? | Engineering Lead | They are the most visible rules in daily work and the cheapest to change now |
| **EOQ-10** | Which engineering metrics are tracked, and are any of them used in individual evaluation? | CTO | A metric used for evaluation becomes a target and stops measuring; this must be decided deliberately |

---

## 81. Governance

| Aspect | Policy |
| --- | --- |
| **Ownership** | Founding Software Architect / Engineering Standards Author |
| **Review cadence** | At each release horizon boundary; whenever `PRD.md`, `architecture.md` or `DESIGN-SYSTEM.md` is amended; and after any SEV-1 or SEV-2 whose systemic correction is a standards change |
| **Amendment process** | Proposed change → stated problem it prevents and enforcement layer (`ENG-001`) → impact assessment against `EP-01`–`EP-10` and `AG-01`–`AG-10` → engineering-lead approval → version increment → changelog entry |
| **Conflict resolution** | `PRD.md` › `architecture.md` › `DESIGN-SYSTEM.md` › this document. A conflict between this document and any of them is a defect in this document (§0.2) |
| **Adding a rule** | Must name the debt it removes in twelve months (§2), declare its enforcement layer (`ENG-001`), and carry the four-part justification (§0.3). Rules that only enforce taste are rejected |
| **Retiring a rule** | Marked retired with a date and a reason; the identifier is never reused (§79) |
| **Relationship to `NN-##`** | The twelve non-negotiables in §4 may only be amended by amending their upstream source. This document cannot weaken them |
| **Upstream documents** | `docs/PRD.md`, `docs/architecture.md`, `docs/DESIGN-SYSTEM.md` |
| **Sibling documents** | `DATA-MODEL.md`, `AI-SPEC.md`, `SECURITY.md`, `PRIVACY.md`, `UX-FLOWS.md`, `ANALYTICS.md`, `TEST-PLAN.md`, `ROADMAP.md`, `adr/` — each owns its detail; this document owns how engineers comply |

### Changelog

| Version | Date | Status | Summary |
| --- | --- | --- | --- |
| 1.0 | 2026-08-01 | Draft | Initial Engineering Rules and Development Standards. Derived from `architecture.md` v1.0 and `DESIGN-SYSTEM.md` v1.0. Establishes twelve non-negotiable invariants, the four-layer enforcement model, and rules spanning structure, code quality, client, server, data, AI, security, privacy, process, dependencies, evolution, and AI coding agents. Twelve `[RECOMMENDED]` rules and ten `EOQ-##` questions require sign-off before Status moves to Approved. |

---

*End of document. This document is subordinate to `docs/PRD.md`, `docs/architecture.md` and `docs/DESIGN-SYSTEM.md`. Every rule here exists to make a decision taken in one of those documents survive contact with a deadline. A rule that cannot be traced to one of them, or justified as a `[RECOMMENDED]` gap, is removed — not retained because it sounds sensible.*
