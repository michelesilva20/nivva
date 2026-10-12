import { useState } from "react";
import { Pressable } from "react-native";

import { NivvaIcon, useNivvaTheme } from "@/core/design-system";

import { AuthTextField } from "./AuthTextField";

export function PasswordField({
  value,
  onChangeText,
  hint,
}: {
  value: string;
  onChangeText: (value: string) => void;
  hint?: string;
}) {
  const theme = useNivvaTheme();
  const [secure, setSecure] = useState(true);

  return (
    <AuthTextField
      label="Senha"
      hint={hint}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      autoCapitalize="none"
      autoComplete="password"
      textContentType="password"
      accessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={secure ? "Mostrar senha" : "Ocultar senha"}
          onPress={() => setSecure((current) => !current)}
          hitSlop={8}
          style={{
            width: theme.layout.touchTarget,
            height: theme.layout.touchTarget,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NivvaIcon name={secure ? "visibility" : "visibility-off"} color={theme.colors.textSecondary} size={22} />
        </Pressable>
      }
    />
  );
}
