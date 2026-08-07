
## Stage 8 Group 6 — Academic setup API boundary

Stage 8 Group 6 adds:

- `academic/`

The academic API boundary exposes authenticated setup and tree-read endpoints for the web app.

Composition lives in `academic/_shared/`.

Route handlers remain thin and call web-local orchestrators.