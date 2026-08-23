# resource upload ticket

This worker-local module claims `resource.upload_ticket.create` jobs and performs the privileged Supabase Storage `createUploadTicket` (signed upload URL) operation using the worker plane's own service-role client.

## Purpose

Corrects a SEC-005 violation: signed upload URL issuance previously happened directly inside `apps/web` using a service-role Supabase client. That capability now lives exclusively here. `apps/web` only enqueues a job and reads back its result; it never constructs a privileged storage client.

## Public surface

- `createResourceUploadTicketWorker`

## Boundaries

This module does not implement resource extraction, chunking, indexing, AI provider logic, web routes, or UI.
