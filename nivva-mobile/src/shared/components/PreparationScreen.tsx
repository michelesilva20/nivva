import { View } from "react-native";

import { NivvaIcon, NivvaScreenHeader, NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";
import type { NivvaIconName } from "@/core/design-system";

type PreparationScreenProps = {
  title: string;
  message: string;
  icon: NivvaIconName;
};

export function PreparationScreen({ title, message, icon }: PreparationScreenProps) {
  const theme = useNivvaTheme();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
        <NivvaScreenHeader title={title} />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: theme.spacing.xl,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NivvaIcon name={icon} color={theme.colors.primary} size={34} />
          </View>
          <NivvaText variant="headingMedium" style={{ marginTop: theme.spacing.lg, textAlign: "center" }}>
            {title}
          </NivvaText>
          <NivvaText
            variant="bodyLarge"
            tone="secondary"
            style={{ marginTop: theme.spacing.xs, textAlign: "center" }}
          >
            {message}
          </NivvaText>
        </View>
      </View>
    </ScreenContainer>
  );
}
