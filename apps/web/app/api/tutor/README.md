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
