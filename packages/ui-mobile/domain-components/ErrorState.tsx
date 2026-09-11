import React, { type ReactElement } from "react";
import type { ViewProps } from "react-native";

import { ErrorState as ErrorStatePrimitive } from "../primitives/ErrorState";
import type { ErrorStateContract } from "./ErrorState.contract";

type DomainErrorStateProps = ErrorStateContract &
  ViewProps & {
    onRecover: () => void;
  };

/**
 * ENG-034: `recoveryAction` is required on `AvoraErrorContract`, so unlike
 * the primitive ErrorState (which allows an actionless message), this
 * domain variant can never render without a recovery button. Named
 * `DomainErrorState` (not `ErrorState`) purely to avoid colliding with the
 * primitive of the same concept when both are re-exported from this
 * package's top-level barrel — the two are otherwise the same rule.
 */
export function DomainErrorState({ error, onRecover, ...viewProps }: DomainErrorStateProps): ReactElement {
  return (
    <ErrorStatePrimitive
      message={error.message}
      retryLabel={error.recoveryAction.label}
      onRetry={onRecover}
      {...viewProps}
    />
  );
}
