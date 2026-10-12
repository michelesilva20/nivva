import { View } from "react-native";

import { NivvaText, NivvaWordmark, useNivvaTheme } from "@/core/design-system";

export function AuthHeader({ headline, subheadline }: { headline: string; subheadline: string }) {
  const theme = useNivvaTheme();

  return (
    <View style={{ marginBottom: theme.spacing.xl }}>
      <NivvaWordmark />
      <NivvaText variant="display" style={{ marginTop: theme.spacing.lg }}>
        {headline}
      </NivvaText>
      <NivvaText variant="bodyLarge" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
        {subheadline}
      </NivvaText>
    </View>
  );
}
