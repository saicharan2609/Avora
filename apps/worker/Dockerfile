# syntax=docker/dockerfile:1.7

FROM node:24.18.1-bookworm@sha256:19cd848a0e073d34bd8cd5545a1b6b4d28489b3e3b607366621ced442bd5f6b4 AS builder

WORKDIR /repo

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
COPY e2e ./e2e
COPY evals ./evals

RUN corepack enable
RUN corepack prepare pnpm@10.34.5 --activate
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @avora/worker build

FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:af85d11ce7ef10172855a6e3649e3e8125b1b9e3ca41849ec2918036f05cb212 AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=nonroot:nonroot /repo/apps/worker/dist ./dist

EXPOSE 3000

USER nonroot

CMD ["dist/src/main.js"]