# tutor API

Owner: @avora/web
Domain owner: @avora/ai

## Purpose

This directory owns the Stage 11 Group 8 web tutor API boundary.

The route accepts an authenticated student question scoped to a subject, structure unit, resource, or broader academic scope, then invokes the existing AI Tutor Gateway boundary.

## Public route

- `POST /api/tutor/ask`

## Data flow

```text
client request
→ @avora/core/contracts/tutor validation
→ authenticated student resolution
→ web-local tutor composition
→ TutorGatewayPort.answerTutorQuery
→ typed HTTP response
```

## Explicitly out of scope

Stage 11 Group 8 does not implement:

- retrieval logic;
- AI provider logic;
- prompt assembly;
- provider SDK calls;
- UI;
- mobile behavior;
- database migrations;
- repositories;
- evals;
- e2e flows;
- Server-Sent Events streaming of the tutor response;
- entitlement or usage-allowance checking before invoking the Tutor Gateway.

Streaming and entitlement are deferred to a later group. The current route returns a single typed JSON response and performs no allowance check before invoking `TutorGatewayPort.answerTutorQuery`.
