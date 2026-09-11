import React, { type ReactElement } from "react";
import { View, StyleSheet, type ViewProps } from "react-native";
import { Text } from "./Typography";
import { Button } from "./Button";
import { mobileTokens } from "../tokens/index";

type ErrorStateProps = ViewProps & {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({ title = "Something went wrong", message, retryLabel = "Try Again", onRetry, style, ...props }: ErrorStateProps): ReactElement {
  return (
    <View style={[styles.container, style]} {...props}>
      <Text variant="titleMd" color="primary" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" color="secondary" style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <Button title={retryLabel} intent="neutral" onPress={onRetry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: parseInt(mobileTokens.space.lg, 10),
    alignItems: "center",
    justifyContent: "center",
    gap: parseInt(mobileTokens.space.md, 10),
  },
  title: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: parseInt(mobileTokens.space.sm, 10),
  },
});

