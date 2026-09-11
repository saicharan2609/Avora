import React, { forwardRef, useState, type ReactElement, type ReactNode } from "react";
import { TextInput, StyleSheet, type TextInputProps, View, Text } from "react-native";
import { mobileTokens } from "../tokens/index";
import type { PrimitiveState } from "./PrimitiveState.contract";

type InputProps = TextInputProps & {
  state?: PrimitiveState;
  errorMessage?: string;
  label?: string;
  icon?: ReactNode;
};

type InputVisualState = {
  hasIcon: boolean;
  isFocused: boolean;
  isError: boolean;
  isDisabled: boolean;
};

function resolveFieldStyle({ hasIcon, isFocused, isError, isDisabled }: InputVisualState) {
  return [
    styles.input,
    hasIcon && styles.inputWithIcon,
    isFocused && !isError && !isDisabled && styles.inputFocused,
    isError && styles.inputError,
    isDisabled && styles.inputDisabled,
  ];
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { state = "default", errorMessage, label, icon, style, onFocus, onBlur, ...props }: InputProps,
  ref,
): ReactElement {
  const [isFocused, setIsFocused] = useState(false);
  const isError = state === "error" || !!errorMessage;
  const isDisabled = state === "disabled";

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.fieldWrapper}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          ref={ref}
          style={[...resolveFieldStyle({ hasIcon: !!icon, isFocused, isError, isDisabled }), style]}
          placeholderTextColor={mobileTokens.text.disabled}
          editable={!isDisabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </View>
      {isError && errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  label: {
    color: mobileTokens.text.secondary,
    fontSize: parseInt(mobileTokens.type.label.size, 10),
    fontWeight: mobileTokens.type.label.weight as "500",
  },
  fieldWrapper: {
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
    left: parseInt(mobileTokens.space.md, 10),
    zIndex: 1,
  },
  input: {
    height: parseInt(mobileTokens.control.xl, 10),
    backgroundColor: mobileTokens.surface.raised,
    borderColor: mobileTokens.border.default,
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderRadius: parseInt(mobileTokens.radius.xl, 10),
    paddingHorizontal: parseInt(mobileTokens.space.md, 10),
    color: mobileTokens.text.primary,
    fontSize: parseInt(mobileTokens.type.body.size, 10),
  },
  inputWithIcon: {
    paddingLeft: parseInt(mobileTokens.control.md, 10),
  },
  inputFocused: {
    borderColor: mobileTokens.accent.default,
    backgroundColor: mobileTokens.surface.overlay,
    shadowColor: mobileTokens.shadow.accentGlow.color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: mobileTokens.shadow.accentGlow.opacity,
    shadowRadius: parseInt(mobileTokens.space.sm, 10),
    elevation: 0,
  },
  inputError: {
    borderColor: mobileTokens.feedback.danger.fg,
  },
  inputDisabled: {
    opacity: parseFloat(mobileTokens.state.disabledOpacity),
  },
  errorText: {
    color: mobileTokens.feedback.danger.fg,
    fontSize: parseInt(mobileTokens.type.caption.size, 10),
  },
});
