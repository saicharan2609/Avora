
## Stage 8 Group 6 — Academic setup API boundary

Stage 8 Group 6 adds:

- `academic/`

The academic API boundary exposes authenticated setup and tree-read endpoints for the web app.

Composition lives in `academic/_shared/`.

Route handlers remain thin and call web-local orchestrators.
## Stage 11 Group 8 — Tutor API boundary

Stage 11 Group 8 adds:

- `tutor/ask`

The tutor API boundary exposes an authenticated transport route for asking grounded tutor questions.

Route handlers validate `@avora/core/contracts/tutor` request bodies, resolve the authenticated student, invoke the existing AI Tutor Gateway boundary, and return typed cited-answer, insufficiency, or refusal responses.

Request bodies must not accept `studentId`; authenticated student scope is resolved server-side.

The route does not implement retrieval logic, AI provider logic, prompt assembly, provider SDK calls, UI, mobile behavior, database migrations, repositories, evals, or e2e flows.