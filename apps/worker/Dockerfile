# syntax=docker/dockerfile:1.7

FROM node:24.18.1-bookworm@sha256:19cd848a0e073d34bd8cd5545a1b6b4d28489b3e3b607366621ced442bd5f6b4 AS base

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable
RUN corepack prepare pnpm@10.34.5 --activate

# Computes the minimal worker-only subset of the monorepo (only @avora/worker
# and its actual dependency graph — @avora/adapters, @avora/ai, @avora/config,
# @avora/core, @avora/db, @avora/domain, @avora/jobs, @avora/retrieval — never
# a hand-maintained list) using Turborepo's own dependency graph, split into
# `json/` (manifests + lockfile, for a cache-friendly install layer) and
# `full/` (complete source, for the build layer). This replaces a single
# `pnpm --filter @avora/worker build`, which never built @avora/worker's
# workspace dependencies at all because it bypassed turbo.json's
# `"build": { "dependsOn": ["^build"] }` task graph entirely.
FROM base AS pruner
WORKDIR /repo
COPY . .
RUN pnpm dlx turbo@2.10.7 prune @avora/worker --docker

# Installs only the pruned subset's dependencies (fast, frozen-lockfile,
# cache-friendly since it only invalidates on dependency changes), then
# builds @avora/worker and every workspace dependency it needs in the
# correct order via Turborepo's task graph.
#
# Deliberately does NOT run `pnpm prune --prod` afterwards: verified during
# implementation that it removes the per-package `node_modules/@avora/*`
# symlinks pnpm's isolated linker creates for workspace (`workspace:*`)
# dependencies (e.g. `apps/worker/node_modules/@avora/ai`), not just
# devDependencies — breaking every workspace import. Correctness of module
# resolution takes priority over the (smaller, secondary) goal of excluding
# devDependencies from the final image.
FROM base AS installer
WORKDIR /repo
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm exec turbo run build --filter=@avora/worker

# The runtime stage is the exact pruned, built, production-only workspace
# subset above — the worker plane's own compiled output, its actual
# workspace dependencies' compiled output, and a real (non-symlink-dangling)
# node_modules tree — nothing from apps/web, apps/mobile, e2e, evals, or any
# unrelated package. No .env file, no devDependency, no monorepo source
# outside this subset is copied.
FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:af85d11ce7ef10172855a6e3649e3e8125b1b9e3ca41849ec2918036f05cb212 AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=installer --chown=nonroot:nonroot /repo ./

EXPOSE 3000

USER nonroot

CMD ["apps/worker/dist/src/main.js"]
