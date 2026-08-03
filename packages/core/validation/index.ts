import type { z } from "zod";

export type ValidationSchema<Output> = z.ZodType<Output>;

export type ValidationInput<Schema extends z.ZodType> = z.input<Schema>;

export type ValidationOutput<Schema extends z.ZodType> = z.output<Schema>;

export type ValidationIssue = Readonly<{
  path: readonly (string | number)[];
  message: string;
}>;

export type ValidationFailure = Readonly<{
  issues: readonly ValidationIssue[];
}>;

export type ValidationSuccess<Output> = Readonly<{
  value: Output;
}>;

export type ValidationResult<Output> =
  | ValidationSuccess<Output>
  | ValidationFailure;