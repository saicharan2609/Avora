# Architecture Decision Records — Index

Per `docs/REPOSITORY.md` §9 and §32.1 rule 6: *"`docs/adr/` records every `AD-##` with context, decision, consequences, and rejected alternatives. [`docs/architecture.md`] is the synthesis; the ADRs are the history."*

The short-form register of every `AD-##` (ID, one-line decision, requirement trace, reversibility) lives in `docs/architecture.md` §44 and is the authoritative list. This index tracks only which of those decisions additionally have a full ADR write-up in this directory, and each entry's current status.

| AD-## | File | Status |
| --- | --- | --- |
| `AD-42` | [`AD-42-cloudflare-r2-object-storage.md`](./AD-42-cloudflare-r2-object-storage.md) | **Decided (direction)** — implementation not started |
| `AD-43` | [`AD-43-step-up-authentication-mechanism.md`](./AD-43-step-up-authentication-mechanism.md) | **Decided (mechanism family + V0 factor: TOTP)** — resolves `SOQ-03`; addended 2026-09-11 with factor, enrollment-boundary, and validity-window decisions; recovery policy and audit substrate remain open (CISO/security); implementation not started; `SOQ-02` remains separately open |

`AD-01`–`AD-41` are recorded in `docs/architecture.md` §44 but do not yet have individual ADR files in this directory. Backfilling them is out of scope for the change that introduced this index (see `AD-42`'s own document for context) and is not implied to be blocked or scheduled by this file.
