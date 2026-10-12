import { type ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { NivvaText, useNivvaTheme } from "@/core/design-system";

type AuthTextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  accessory?: ReactNode;
};

export function AuthTextField({ label, hint, accessory, style, ...props }: AuthTextFieldProps) {
  const theme = useNivvaTheme();

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <NivvaText variant="labelMedium" tone="secondary" style={{ marginBottom: theme.spacing.xs }}>
        {label}
      </NivvaText>
      <View>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.colors.textMuted}
          style={[
            {
              minHeight: theme.layout.buttonHeight,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              paddingHorizontal: theme.spacing.md,
              paddingRight: accessory ? theme.layout.touchTarget : theme.spacing.md,
              color: theme.colors.textPrimary,
              ...theme.typography.bodyMedium,
            },
            style,
          ]}
          {...props}
        />
        {accessory ? (
          <View
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: theme.layout.touchTarget,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {accessory}
          </View>
        ) : null}
      </View>
      {hint ? (
        <NivvaText variant="caption" tone="muted" style={{ marginTop: theme.spacing.xs }}>
          {hint}
        </NivvaText>
      ) : null}
    </View>
  );
}
