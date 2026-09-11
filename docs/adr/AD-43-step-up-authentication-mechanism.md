# AD-43 — MFA/factor-based authentication as the step-up security primitive

| | |
| --- | --- |
| **Status** | **Decided (mechanism family) — implementation not started.** See [Implementation Status](#implementation-status) before treating this as authorization to build. **Addended 2026-09-11** with the V0 factor (TOTP) and further policy boundaries — see [Addendum](#addendum--totp-factor-and-step-up-policy-boundaries-2026-09-11). Implementation is still not authorized: recovery policy and audit substrate remain open. |
| **Date** | 2026-09-11 |
| **Resolves** | `SOQ-03` (`docs/SECURITY.md` §75 Open Questions register) |
| **Traces to** | `ENG-185`, `SEC-052`, `SEC-470`, `FR-002`, `AD-09` |
| **Reversibility** | Medium — the underlying primitive is a security property, not a vendor lock-in; the installed Supabase Auth SDK already exposes an alternative primitive (reauthentication) behind the same `AuthPort` boundary, so a future change of mechanism would be a contained adapter-level change, not a re-architecture |
| **Supersedes evaluation in** | `docs/SECURITY.md` SOQ-03 entry (preserved, marked resolved, not deleted); analysis basis: the Step-Up Readiness Audit and SOQ-03 Decision Support Analysis conducted in this repository's own working history |

---

## Context

`ENG-185` (`docs/ENGINEERING-RULES.md:1194`) requires step-up re-authentication before six sensitive operations: `account_deletion`, `data_export`, `email_change`, `subscription_change`, `bulk_deletion`, `structure_unit_share_creation` (the exact `StepUpReason` union already declared at `packages/domain/identity/contracts/StepUpReason.contract.ts`). `SEC-052` (`docs/SECURITY.md:681`) requires that step-up be bound to the specific operation, hold a short validity window, and never be satisfiable by a general recent-login flag. `SEC-470` (`docs/SECURITY.md:2119`) additionally requires step-up specifically for account/bulk deletion, with every deletion request recorded as an auditable event with a receipt.

The domain contract for this already exists — `AuthPort.requireStepUp` (`packages/domain/identity/ports/AuthPort.ts:49`) — but has zero implementation anywhere: absent from `SupabaseAuthAdapter`'s own type (`packages/adapters/supabase/auth/contracts.ts`), and explicitly stubbed to throw on mobile (`apps/mobile/src/auth/httpAuthPort.ts:128-130`, `MobileAuthPortNotYetAvailableError`). Which underlying authentication *primitive* `requireStepUp` should be built on was left open as `SOQ-03` (`docs/SECURITY.md:2758`), owned by CTO: *"What is the step-up mechanism when the only auth method is an email OTP — re-OTP, or a distinct second factor?"*

This ADR records the founder/CTO resolution of that open question, following a Step-Up Readiness Audit and a SOQ-03 Decision Support Analysis conducted against this repository (covering the current OTP/OAuth-only auth model, the existing `AuthPort`/`SupabaseAuthAdapter`/mobile boundary, and the installed `@supabase/auth-js@2.110.8`'s already-available `reauthenticate()` and `mfa.*`/AAL API surface). Neither audit is repeated here; this document records the decision and its consequences only.

## Decision

**Avora's step-up re-authentication contract (`AuthPort.requireStepUp`) will be built on MFA/factor-based authentication — proof of possession of an enrolled, independent second factor — as the underlying security primitive, for all six `StepUpReason` operations `ENG-185` already enumerates.**

This decision selects the **security primitive only**. It is explicitly narrower than a full implementation plan — see [Explicit Non-Decisions](#explicit-non-decisions).

**`MFA verification alone is not the complete Avora step-up contract.`** Per `SEC-052`, satisfying step-up requires all of:
1. A successfully completed MFA factor challenge (the primitive this ADR decides), **and**
2. Avora-enforced binding of that successful proof to the *specific* `StepUpReason` that triggered it, **and**
3. Avora-enforced short validity window on that proof, distinct from ordinary session/login freshness.

Items 2 and 3 are Avora's own responsibility regardless of which primitive underlies step-up — the Supabase MFA API family does not itself know about `StepUpReason` or enforce an operation-specific short window. This ADR does not weaken, and must not be read as weakening, `SEC-052`'s requirement that step-up "cannot be satisfied by a general recent-login flag."

## Rationale

- **Stronger protection against stolen-session abuse than same-channel re-proof.** A stolen session token combined with a compromised email inbox defeats a re-OTP-based step-up; it does not defeat a genuinely independent second factor (TOTP app, WebAuthn key, etc.), provided that factor is itself uncompromised. This directly addresses the threat `ENG-185`'s own rationale names: "a stolen session performing an irreversible or disclosing action."
- **No new authentication vendor is required.** The installed `@supabase/auth-js@2.110.8` already exposes a complete MFA API (`enroll`, `challenge`, `verify`, `unenroll`, `listFactors`, `getAuthenticatorAssuranceLevel`) — repository-verified from the package's own shipped type declarations. This decision does not add a dependency and does not open a new vendor-review question under `SEC-490`/`SEC-491`.
- **The SDK's own AAL (Authenticator Assurance Level) response is documented by the vendor as intended for exactly this use** — `AuthMFAGetAuthenticatorAssuranceLevelResponse`'s own doc comment states its `currentAuthenticationMethods` field exists so a caller can "detect the last time a user verified a factor, for example if implementing a step-up scenario."
- **Operation-specific binding and short validity remain Avora's enforcement responsibility**, not something MFA verification provides automatically — stated here so this decision is not later read as having satisfied `SEC-052` by itself.
- **Implementation is materially larger than the rejected alternative** (re-OTP) — an enrollment flow does not exist anywhere in this codebase today, on either web or mobile, and must be designed and built before factor-based step-up can be exercised by any student.
- **Enrollment and recovery policy are not decided by this ADR** — see [Explicit Non-Decisions](#explicit-non-decisions) and [SOQ-02 Boundary](#soq-02-boundary).

## Rejected Alternative

**Reauthentication / re-OTP** (`client.auth.reauthenticate()` + `verifyOtp()`, already present in the installed SDK) was considered and is **not selected as the step-up primitive**, because it re-proves control of the *same* channel (the student's email, or in principle a phone) already used for ordinary sign-in. For the six operations `ENG-185` protects — several of them irreversible or disclosing — this makes step-up's security guarantee only as strong as the ordinary-login guarantee, which does not add an independent barrier against a session-and-inbox compromise occurring together. This is not a statement that re-OTP is technically unworkable — the Step-Up Readiness Audit confirmed the underlying provider calls exist and a structurally similar OTP-verification pattern is already implemented elsewhere in this codebase (`AuthPort.verifyEmailOtp`). It was rejected on security-property grounds specific to the severity of the six protected operations, not on technical feasibility grounds.

## Explicit Non-Decisions

This ADR decides the security primitive only. It does **not** decide, and each of the following remains open for a future implementation/design decision unless a separately-cited authoritative document already resolves it:

- TOTP vs. WebAuthn/passkey vs. phone-based factor (or which subset of these Avora supports).
- Factor enrollment policy: when enrollment is offered or required, and what happens for a student who has not enrolled a factor when a step-up-gated operation is requested.
- Factor recovery policy (lost-factor/lost-device recovery).
- The exact validity-window duration satisfying `SEC-052`'s "short-lived" requirement.
- Whether the short-lived step-up proof is represented as database-persisted state, a signed token, or another mechanism.
- Exact API route design, on web or mobile.
- Exact changes to `AuthPort`/`SupabaseAuthAdapter` (this ADR does not amend either).
- Exact mobile implementation (screens, boundary-crossing mechanism).
- Exact web implementation (any new client-interactive UI surface this may require).
- `SOQ-02` — see below.

## SOQ-02 Boundary

`SOQ-02` (`docs/SECURITY.md:2757`, owner CISO + Product) — *"Is multi-factor authentication offered, and is it required for any operation beyond the `ENG-185` step-up list?"* — is a **separate, still-open question**. This ADR resolves only *which primitive underlies the already-mandated step-up gate for the existing six operations*. It must not be read as:
- a decision that all students must enroll MFA;
- a decision that MFA is mandatory globally;
- a decision that MFA is required at ordinary login;
- a decision of which specific factor type must be enrolled.

Relationship, stated explicitly for future readers:
- **`SOQ-03`** — *What authentication primitive satisfies sensitive-action step-up?* → **Decided by this ADR: MFA/factor-based authentication.**
- **`SOQ-02`** — *Whether/when MFA is generally offered or required across Avora, beyond step-up.* → **Remains separate and open.** Not resolved, narrowed, or pre-empted by this ADR.

## Implementation Status

- **SOQ-03 mechanism decision is resolved** (this ADR).
- **Step-up implementation is not yet started.** No `AuthPort` change, no adapter change, no route, no enrollment/recovery flow, and no mobile or web UI exists as a result of this ADR.
- **Group 11 (Multi-Store Deletion Cascade) deletion implementation remains blocked until the step-up implementation contract is specified and implemented** — `MASTER-ROADMAP.md`'s Group 11 deliverable #2 ("Step-up authentication challenge for bulk/account deletion," `SEC-052`/`SEC-470`) is a prerequisite for the account/bulk deletion path specifically, per the prior Deletion Contract Decision-Boundary Audit's finding that Group 11 could not be completed end-to-end without this decision. This ADR removes the *mechanism-selection* blocker; it does not itself unblock Group 11, since the implementation named above does not yet exist.

## Governance and Approval Status

| Gate | Status |
|---|---|
| Mechanism-family decision (SOQ-03), owner CTO | **Satisfied** — recorded in this ADR, per founder/CTO decision communicated 2026-09-11 |
| ADR opened in `docs/adr/`, `architecture.md` §44 register amended in the same change | **Satisfied by this change** |
| New dependency approval (`ENG-404`) | **Not triggered by this ADR** — the decided primitive is already available in the installed `@supabase/auth-js@2.110.8`; a factor-type sub-choice involving a new library (e.g., a native WebAuthn/passkey client) is expressly not decided here and would trigger this gate separately, at that later decision point |
| New vendor review (`SEC-490`/`SEC-491`) | **Not triggered** — no new vendor is introduced; step-up stays within the already-adopted Supabase relationship |
| Second, non-authoring reviewer (`ENG-322`/`ENG-004` — `docs/**` is a protected path; `ENG-331` — changes touching authorisation/deletion) | **Pending** — a repository-process step for when this change is reviewed as a real pull request, not something this session certifies |
| SOQ-02 resolution | **Not applicable to this ADR** — remains separately open, per [SOQ-02 Boundary](#soq-02-boundary) |

## Recommended Next Step

Not authorized to begin by this ADR. The next decision/design step is specifying the step-up *implementation contract* (validity window, proof representation, enrollment/recovery policy, and the resulting `AuthPort`/adapter/route/mobile/web changes) — only after which Group 11's account/bulk-deletion path can proceed. This ADR does not begin that work.

*(Historical note, added 2026-09-11: the Step-Up Implementation Contract / Design Readiness Audit and the subsequent Step-Up MFA Implementation Contract this "Recommended Next Step" called for were both conducted against this repository. The [Addendum](#addendum--totp-factor-and-step-up-policy-boundaries-2026-09-11) below records the policy decisions the CTO subsequently approved from that contract. It does not retroactively authorize implementation — see the Addendum's own status.)*

---

## Addendum — TOTP Factor and Step-Up Policy Boundaries (2026-09-11)

**Status:** Policy decisions recorded. **Implementation is still not authorized** — see [Implementation Status](#implementation-status) (unchanged by this addendum) and the open items below. This addendum does not reopen, restate, or weaken the primitive decision above (MFA/factor-based authentication); it resolves specific items the original ADR listed under [Explicit Non-Decisions](#explicit-non-decisions) and records additional policy boundaries surfaced by the subsequent Step-Up Implementation Contract audits conducted against this repository.

**Approved by:** CTO, communicated 2026-09-11 — same decision authority as the original ADR.

### A1. Factor type — resolved

**V0 Step-Up factor: TOTP**, using the already-installed `@supabase/auth-js@2.110.8` `mfa.enroll`/`mfa.challenge`/`mfa.verify` (`factor_type: 'totp'`) capability. No new authentication vendor, no new dependency (`ENG-404` not triggered — consistent with the original ADR's own governance table).

**Rejected for V0** (not ruled out permanently, simply not chosen now): WebAuthn/passkeys, phone/SMS MFA, and reauthentication/re-OTP as the step-up primitive. Re-OTP was already rejected by the original ADR on security-property grounds (see [Rejected Alternative](#rejected-alternative)); WebAuthn/passkey and phone/SMS remain technically available in the installed SDK (per the Step-Up Implementation Contract Design Readiness Audit's factor comparison) but are not selected for V0.

### A2. Normal login — unchanged

Google OAuth, Apple Sign-In, and email OTP/magic-link remain Avora's ordinary authentication methods, unchanged from `AD-09`/`architecture.md` §11.1. **TOTP is not required for ordinary login.** It gates only the six `StepUpReason` operations `ENG-185` already enumerates.

### A3. Enrollment policy — resolved (policy boundary only; UX not specified)

- TOTP enrollment is **not** required for ordinary Avora login.
- A student **must** have an enrolled TOTP factor before successfully completing a step-up-gated operation.
- A student who reaches a step-up-gated operation without an enrolled factor must be guided through TOTP enrollment — step-up must never be silently bypassed for an unenrolled student.
- This is a narrow policy scoped to the six `StepUpReason` operations only. It is **not** a global MFA requirement and does **not** resolve `SOQ-02`.
- The exact enrollment UX (screens, flow, copy) is not specified by this addendum and remains implementation/design work.

### A4. Recovery policy — boundary decided; mechanism remains OPEN

**Decided:** a lost TOTP factor must not be bypassable using the ordinary login factor alone. Specifically: email OTP or recent login is never treated as an equivalent step-up factor, and a student who has lost their authenticator cannot fall back to ordinary login authentication to perform `account_deletion` or any other step-up-gated operation.

**Still OPEN:** the dedicated secure recovery process itself (how a student who has genuinely lost their factor regains access to step-up-gated operations) is not decided. **Owner: CISO. Blocking for production readiness.** This addendum does not invent, and prohibits inventing, a recovery bypass that would weaken the boundary just stated.

### A5. Step-up proof validity — resolved

**Avora-enforced step-up proof validity window: 5 minutes.** This is distinct from Supabase's own vendor-controlled MFA challenge expiration (`mfa.challenge`'s own `expires_at`, which governs only how long a student has to enter the TOTP code). The Avora 5-minute window begins after successful step-up verification completes and governs how long the resulting operation-specific proof may authorize the protected operation.

### A6. Operation binding — resolved (restates `SEC-052`, made explicit for TOTP)

A successful step-up proof is bound to exactly one `StepUpReason`. A proof produced for `account_deletion` must not authorize `email_change`, `data_export`, `subscription_change`, `bulk_deletion`, or `structure_unit_share_creation`, and vice versa for any pair among the six. Completing TOTP verification must never create a generic "all sensitive actions authorized" session state.

### A7. Session binding — resolved (direction); exact mechanism is implementation work

The step-up proof must bind to the **specific authenticated Supabase session** that requested it, using the Supabase JWT `session_id` claim where practical — not to the student identity alone. This binding must not be weakened to student-identity-only binding without a future, separately documented security decision explicitly approving that change.

`AuthSession` (`packages/domain/identity/contracts/AuthSession.contract.ts`) does not currently expose a session identifier (it carries `studentId`, `accessToken`, `refreshToken`, `expiresAt` only). The eventual implementation must extend the auth contract to carry the session-binding value this addendum requires; the exact field name and mechanism are implementation-PR work, not decided here.

### A8. Proof representation — approved engineering direction (not yet implemented)

**Approved direction:** a short-lived, database-persisted, single-use, operation-bound proof, following the existing `mobile_auth_handoffs` pattern (`supabase/migrations/20260826130000_mobile_auth_handoffs.sql` — short-lived, single-use, student-scoped, deny-by-default RLS, `security definer` delete-on-read consumption). This direction is recorded as approved engineering guidance because it follows directly from already-binding requirements (`SEC-360`'s audit-trail need, `SEC-052`'s single-operation binding) and an existing, already-reviewed repository pattern — it does not reopen the primitive decision above and remains subject to ordinary PR/migration review (`ENG-322`), not to this ADR's own elevated approval chain.

**No database table is created by this addendum.** When implemented, the proof must be: unguessable; server-validated; reason-bound (A6); session-bound (A7); student-bound; expiry-checked (A5); single-use; and never authorizable merely from possession of its identifier (`ENG-187`).

### A9. `AuthPort` contract — direction only; no code changed

`RequireStepUpInput = { reason: StepUpReason }` is preserved unchanged. The eventual `AuthPort.requireStepUp` implementation must represent expected step-up failures (invalid code, expired proof, missing enrollment, operation mismatch, session mismatch) as typed results, following the repository's existing expected-outcome convention (`ENG-056`), rather than as generic thrown exceptions — throwing remains reserved for genuine defects (invariant violations, impossible provider responses), consistent with `ENG-056`'s own expected-outcome/defect distinction. This addendum does not modify `AuthPort.ts`, `SupabaseAuthAdapter`, or any other source file; the exact result-type shape is implementation-PR work.

### A10. Product/UX principle — added

Avora's step-up experience must read as a mature, production-grade flow, not a bolted-on security gate. It must: avoid unnecessary authentication prompts; clearly explain why additional verification is being requested; use familiar authenticator/TOTP interaction patterns; guide an unenrolled student through setup inline when they reach a protected operation rather than dead-ending them; provide clear success and failure states; and never expose internal concepts — `StepUpReason` values, `session_id`, proof-record internals, AAL, or other database/implementation detail — to the student. It must preserve the existing Avora mobile/web architecture (mobile never holds a Supabase SDK or key; §11.2/§11.3) and must never trade away any security property recorded above for convenience. Quality and usability should be comparable to mature production services, without copying another provider's proprietary implementation or bypassing Avora's own architecture or security requirements.

### Still OPEN — explicitly preserved, not resolved by this addendum

- **`SOQ-02`** (`SECURITY.md` §74) — whether MFA is offered or required generally, beyond the six step-up operations. Unaffected by this addendum. Nothing above turns step-up TOTP into a general MFA requirement.
- **Recovery mechanism** (A4) — owner CISO, blocking for production readiness.
- **Canonical audit infrastructure** — `SEC-360`, `SEC-362`, and `SEC-470` already require step-up challenges/outcomes and deletion requests to be audited events with receipts, but no `security_events`/audit-event substrate exists anywhere in this repository today. This is a prerequisite for satisfying `SEC-470`'s receipt requirement specifically, and for the general audit stream `SEC-360` requires — it is not invented or designed by this addendum, and requires its own explicit architecture/security decision before implementation begins.
- **Exact `AuthPort`/adapter/route/mobile/web implementation** — direction is recorded above (A7–A9); exact signatures, routes, and UI are not designed here.

### Governance

This addendum is a change to a protected-path document (`docs/adr/**`, `ENG-322`) touching authorisation policy (`ENG-331`). It inherits the same **second, non-authoring reviewer** requirement the original ADR's own governance table already records as **Pending** — this addendum does not satisfy that gate; it is a repository-process step for when this change is reviewed as a real pull request.

### Implementation readiness

**NOT READY FOR IMPLEMENTATION.** Recovery mechanism (A4) and canonical audit infrastructure remain materially unresolved and blocking, per the Step-Up MFA Implementation Contract audit conducted against this repository. Group 11's account/bulk-deletion path remains blocked until both resolve and the resulting `AuthPort`/adapter/route/mobile/web work is built.
