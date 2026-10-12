import { Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { NivvaText, useNivvaTheme } from "@/core/design-system";

export function AuthPrimaryButton({
  label,
  busyLabel,
  busy,
  onPress,
}: {
  label: string;
  busyLabel: string;
  busy: boolean;
  onPress: () => void;
}) {
  const theme = useNivvaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={busy ? busyLabel : label}
      disabled={busy}
      onPress={onPress}
      style={{ opacity: busy ? 0.72 : 1 }}
    >
      <LinearGradient
        colors={theme.colors.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          minHeight: theme.layout.buttonHeight,
          borderRadius: theme.radius.md,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaText variant="label" tone="onHero">
          {busy ? busyLabel : label}
        </NivvaText>
      </LinearGradient>
    </Pressable>
  );
}
