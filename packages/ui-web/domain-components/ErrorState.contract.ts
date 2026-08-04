import type { AvoraErrorContract } from "@avora/core/errors";

export type ErrorStateContract = Readonly<{
  error: AvoraErrorContract;
}>;