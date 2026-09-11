# AD-42 — Cloudflare R2 as the target object/file storage vendor

| | |
| --- | --- |
| **Status** | **Decided (direction) — not implemented.** See [Governance and approval status](#governance-and-approval-status) below before treating this as fully cleared for implementation. |
| **Date** | 2026-09-03 |
| **Traces to** | `FR-035`, `NFR-034`, `NFR-042`, `SEC-007` |
| **Reversibility** | Low — `BlobStorePort` makes the adapter swappable without a domain-level change |
| **Supersedes evaluation in** | `docs/ARCHITECTURE-CHANGES.md` (originally filed as a proposal under evaluation; see that document's revision history) |

---

## Context

Avora's object/file storage responsibility — quarantine, originals, derivatives, and exports for uploaded academic material — is currently implemented on **Supabase Storage**, described in `docs/architecture.md` §13 and accessed exclusively through the vendor-neutral `BlobStorePort` (`packages/domain/resources/ports/BlobStorePort.ts`), implemented today by `packages/adapters/supabase/storage/adapter.ts`.

`docs/ARCHITECTURE-CHANGES.md` recorded a documentation-only evaluation of replacing Supabase Storage with **Cloudflare R2** for this responsibility, without adopting a conclusion. That evaluation covered the current architecture, a proposed target architecture, security impact, a storage-model mapping, the port/adapter boundary, a migration strategy, cost dimensions, and open questions — none of which are repeated in full here; this ADR is the decision record and cross-references that document for supporting analysis.

Since that evaluation, the project's founder(s) have communicated a decision on architecture direction (recorded in this repository's collaboration history, 2026-09-03): Cloudflare R2 is the intended production object-storage vendor for Avora going forward. This ADR exists to record that decision formally, per the amendment procedure in `docs/REPOSITORY.md` §26.2 and the ADR requirement in `ENG-335`.

**This document does not certify that R2 has been implemented, migrated to, or cut over.** Supabase Storage remains the current, active, production implementation. See [Consequences](#consequences) and [What this decision does not do](#what-this-decision-explicitly-does-not-do).

## Decision

**Adopt Cloudflare R2 as the target vendor for Avora's object/file storage responsibility, implemented behind the existing `BlobStorePort` contract, replacing Supabase Storage once a future adapter is built, tested, security-reviewed, and migrated.**

Specifically:

1. The **domain contract does not change.** `BlobStorePort` (`createUploadTicket`, `createSignedReadUrl`, `promoteObject`, `deleteObject`, over the closed bucket set `quarantine | originals | derivatives | exports | shared`) remains the only interface any domain service, route handler, or job depends on. No caller is aware of which vendor sits behind the port.
2. **Supabase Storage remains the current implementation** until a future R2 adapter exists, has passed the security and deletion-verification requirements in this ADR, and a migration has been executed and independently verified. The existing `packages/adapters/supabase/storage/` adapter is not modified, deprecated, or removed by this decision.
3. A **future R2 adapter** implementing `BlobStorePort` will live under `packages/adapters/` (the existing non-AI vendor-adapter location named in `docs/architecture.md` §32.1 rule 3 — see the note under [Governance and approval status](#governance-and-approval-status) about a drift found between that section and `docs/REPOSITORY.md`'s own gap tracking). Building that adapter, migrating data, and retiring Supabase Storage are explicitly **future work**, not authorised by this ADR to begin.
4. `docs/architecture.md` §6 (Technology Stack) and §13 (File Storage Architecture) are amended in the same change that introduces this ADR, to state the current-vs-target distinction, per the amendment procedure (`docs/REPOSITORY.md` §26.2).

## Consequences

**What becomes true immediately (documentation-level):**
- `docs/architecture.md` names Cloudflare R2 as the adopted target for object storage, distinct from what is currently running.
- Future work proposing the R2 adapter, migration plan, or cutover can cite this ADR as the settled direction, rather than reopening the vendor-choice question.
- The security invariants in [Security invariants that must remain true](#security-invariants-that-must-remain-true-when-r2-is-implemented) become the acceptance bar for any future R2 adapter — they are binding on that future work, not aspirational.

**What does not become true:**
- No adapter code exists yet.
- No migration has occurred; no student data has moved.
- No CISO/processor-review sign-off (`SEC-211`) has occurred for R2 as a new vendor touching student data — this remains a **pending gate**, not satisfied by this ADR.
- No claim is made that Supabase Storage will be retired on any particular date.

**Trade-offs accepted knowingly (carried over from the evaluation, not re-litigated here):**
- A second Cloudflare product (R2) joins the vendor set alongside Cloudflare's existing CDN/WAF/DNS role, increasing dependency concentration on one vendor for two distinct concerns.
- Migration introduces a window of dual-consideration (old and new storage locations) that must be handled without weakening deletion guarantees (`SEC-007`, `SEC-472`) at any point.
- Final cost comparison depends on Avora's actual storage/egress volume, not yet quantified against current vendor rate cards (`docs/ARCHITECTURE-CHANGES.md` §11).

## What this decision explicitly does not do

- It does not implement Cloudflare R2.
- It does not deploy anything to Vercel or any other production infrastructure.
- It does not modify UI, mobile, or web application code.
- It does not migrate any storage.
- It does not delete, deprecate, or replace `packages/adapters/supabase/storage/`.
- It does not modify `BlobStorePort` or any other port.
- It does not add a dependency, a migration, or a bucket.
- It does not claim any Vercel deployment will happen before Stage 12 is complete and the application is production-ready — Vercel deployment timing is unaffected by this ADR and remains gated on that separate condition.

## Security invariants that must remain true when R2 is implemented

These are binding acceptance criteria for the future R2 adapter, not new inventions — each restates an existing invariant already governing the current Supabase Storage implementation, applied prospectively to R2 per `SEC-491`'s eligibility rule ("a processor that cannot support verified per-student deletion is not eligible").

1. **No public bucket.** R2 buckets/prefixes holding student data must never be publicly readable or writable, matching `SEC-212`'s "no public bucket, no public path, no anonymous access."
2. **Ownership stays application-enforced.** R2 (like any S3-compatible object store) has no equivalent of Postgres RLS. Student/resource ownership must continue to be asserted by Avora's adapter/domain layer — mirroring the existing `assertStoragePathBelongsToStudent` pattern in `packages/adapters/supabase/storage/path.ts` — before any URL is signed or any operation performed. This is a stricter, explicit requirement precisely because R2 provides no implicit equivalent.
3. **Signed, short-lived access remains the only read/write path.** Presigned R2 URLs must carry TTLs on the same minutes-scale bound as today (`docs/architecture.md` §13.3), including as the bound on residual access after share revocation (§12.5).
4. **Quarantine isolation is preserved.** Only the worker plane may read `quarantine`; nothing is promoted until every control in `docs/architecture.md` §13.4 passes; rejects are purged, never partially promoted (`SEC-180`, `SEC-181`).
5. **Credentials are server-side only, least-privileged, and scoped.** R2 access keys are a service-role-class secret (`SEC-005`): never in a client-input runtime, never committed, never logged, never bundled — and scoped as narrowly as R2's access-key model allows (bucket/prefix-level, not account-wide), with a defined rotation/revocation procedure.
6. **Storage paths remain ownership-safe.** The `{bucket}/{student_id}/{resource_id}/{version}/{filename}` convention is preserved as the object key, with `student_id` leading — understood as an organisational/audit convention under R2, not itself an access control (see invariant 2).
7. **Deletion participates in the full cascade, unweakened.** The R2-held object classes (originals, derivatives, exports, quarantine remnants) remain target class F2 of the deletion cascade (`docs/architecture.md` §37, `AD-38`). Any new destination introduced by an R2 adapter — including any R2-native versioning/backup surface — joins the cascade and the data inventory in the same PR that introduces it (`SEC-007`).
8. **Deletion is independently verified, never inferred.** A successful R2 `DeleteObject`/`DeleteObjects` call is not, by itself, evidence of deletion. The cascade's verification step must independently assert absence, per `SEC-472`, exactly as it must today.
9. **Backup/recovery is explicitly designed, not assumed equivalent.** Supabase's backup crypto-shredding behaviour (deletion-cascade target F8) has no assumed R2 equivalent. Before adoption, the future adapter's design must state what R2's backup/versioning surface is, whether it retains deleted-object bytes, and how that is reconciled with `NFR-042`'s deletion completion window and `SEC-472`'s verification requirement.
10. **Caching never undermines deletion.** CDN cache keys for R2-origin derivatives must remain identity-scoped (`SEC-213`) and must not serve a cached response for an object that has been deleted or whose access has been revoked, past the same TTL bound that already governs signed-URL residual access.
11. **Security review is a gate, not a formality.** Per `SEC-211`, adding R2 as a vendor touching student data requires processor review (`docs/SECURITY.md` §58), a data-inventory entry, a deletion-cascade entry (already covered by invariant 7), and **CISO approval** — before production use, not before this ADR.

## Rejected alternatives

Carried forward from the evaluation in `docs/ARCHITECTURE-CHANGES.md` §4/§5, restated briefly as this ADR's formal rejected-alternatives record per `ENG-335`:

- **Stay on Supabase Storage indefinitely.** Rejected as the target direction per the founder decision this ADR records. Not rejected as *wrong* — it remains the correct current implementation until R2 is proven out; this ADR changes the target, not today's runtime.
- **Introduce a second `BlobStorePort`-like port specific to R2.** Rejected: `BlobStorePort`'s contract (`createUploadTicket`, `createSignedReadUrl`, `promoteObject`, `deleteObject` over `ResourceStorageLocation`) is already vendor-neutral and already covers what an R2 adapter needs. A new port would violate `ENG-026` ("a new port is an architectural amendment") for no capability gain, and would fragment the "one port per capability" property the codebase already relies on.
- **Dual-write both vendors permanently as a hedge.** Rejected as a permanent state (a bounded dual-write/shadow-read window remains an option for the *migration* phase only, per `docs/ARCHITECTURE-CHANGES.md` §10 Phase 4 — not decided here). Permanent dual-write doubles the deletion-verification surface forever, which directly works against `SEC-472`'s guarantee rather than supporting it.
- **A pre-approved "substitution" entry in `docs/AVORA-TOOLCHAIN.md` §27 instead of a formal AD/ADR.** Rejected: §27 is for reactive substitution if an *already-adopted* vendor degrades; this is a proactive, deliberate vendor-direction decision, which `docs/REPOSITORY.md` §26 classifies as requiring the ADR + architecture.md amendment path, not a substitution-table entry.

## Governance and approval status

Recorded honestly, per this ADR's own obligation not to overstate approval:

| Gate | Status |
| --- | --- |
| Founder/leadership decision on direction | **Satisfied** — communicated 2026-09-03, recorded in this ADR |
| ADR opened in `docs/adr/`, `architecture.md` amended in the same change (`docs/REPOSITORY.md` §26.2 steps 1–2) | **Satisfied by this change** |
| `docs/REPOSITORY.md` §2 tree / §18.1 matrix update (§26.2 step 4) | **Not applicable** — `docs/REPOSITORY.md` does not name a storage vendor anywhere (it is already vendor-neutral, referencing only `BlobStorePort`); inspected and confirmed no update required |
| Second, non-authoring PR reviewer approval (`ENG-322`, `ENG-004` — `docs/**` is a protected path) | **Pending** — a repository-process step that occurs when this change is reviewed as a real pull request, not something this session can certify |
| Vendor processor review, data-inventory entry, **CISO approval** (`SEC-211`) | **Pending** — not performed by this ADR; required before any R2 adapter reaches production, per invariant 11 above |
| Human leadership approval for "creating a new vendor adapter" (`docs/AVORA-TOOLCHAIN.md` §29 item 2) | **Pending** — applies at the point adapter code is proposed, not to this documentation change |
| `@avora/architecture` sign-off on the `architecture.md` amendment itself | **Pending** — this session drafts the amendment; formal ownership sign-off is a human review step |

**A drift was found, not created, while preparing this ADR:** `docs/REPOSITORY.md` §27.1 (`AMD-03`) and §27.2 (`GAP-01`) describe `packages/adapters/` as not yet named in `architecture.md` §32 and blocked pending that amendment. `docs/architecture.md` §32.1 rule 3 already states, in force today: *"There are exactly two adapter directories: `packages/ai/adapters/` for model, embedding and orchestration providers, and `packages/adapters/` for every other external vendor."* Since `docs/architecture.md` outranks `docs/REPOSITORY.md` in the authority order (`AGENTS.md` §2) and the code already contains a functioning `packages/adapters/` tree (Supabase, Resend, Stripe, PSP, Sentry, PostHog, OTel, and others), this reads as `docs/REPOSITORY.md` having drifted out of date relative to an already-amended `architecture.md`, rather than a live blocker. This ADR does not resolve that drift — it is reported here per `ENG-411`/`ENG-337` for `@avora/architecture` to reconcile — but notes that it does not block placing a future R2 adapter in `packages/adapters/`, since that location is already in active, architecture.md-sanctioned use by the existing Supabase storage adapter.

## Recommended next implementation group

Not authorised to begin by this ADR. When founder/technical approval for *implementation* (as distinct from *direction*, decided here) is given, the next group of work is **Phase 1 — R2 proof of concept** from `docs/ARCHITECTURE-CHANGES.md` §10: an isolated, non-production evaluation of the R2 S3-compatible API against the four operations `BlobStorePort` requires, using no student data (`ENG-342`), followed by Phase 2 (adapter implementation) only after Phase 1 and the pending governance gates above are cleared.
