import React, { type ReactElement } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { CircleAlert, CircleCheck, Clock } from "lucide-react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { ProcessingStateContract } from "./ProcessingState.contract";

const ICON_SIZE_DP = 14;

const LABEL_BY_STATE: Record<ProcessingStateContract["state"], string> = {
  queued: "Queued",
  processing: "Processing",
  blocked: "Needs attention",
  completed: "Ready",
};

/**
 * EP-06: a resource still processing is always a visible, honest state —
 * never a silent gap where content should be. Rendered inline on
 * ResourceCard and anywhere else ingestion progress needs to surface.
 */
export function ProcessingState({ state }: ProcessingStateContract): ReactElement {
  return (
    <View style={styles.row}>
      <StateIcon state={state} />
      <Text variant="caption" color={state === "blocked" ? "primary" : "tertiary"}>
        {LABEL_BY_STATE[state]}
      </Text>
    </View>
  );
}

function StateIcon({ state }: { state: ProcessingStateContract["state"] }): ReactElement {
  if (state === "completed") {
    return <CircleCheck size={ICON_SIZE_DP} color={mobileTokens.feedback.success.fg} />;
  }

  if (state === "blocked") {
    return <CircleAlert size={ICON_SIZE_DP} color={mobileTokens.feedback.warning.fg} />;
  }

  if (state === "processing") {
    return <ActivityIndicator size="small" color={mobileTokens.text.tertiary} />;
  }

  return <Clock size={ICON_SIZE_DP} color={mobileTokens.text.tertiary} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.xs, 10),
  },
});
