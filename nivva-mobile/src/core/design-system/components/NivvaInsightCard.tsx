import { Pressable, View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaIcon } from "./NivvaIcon";
import { NivvaText } from "./NivvaText";

type NivvaInsightCardProps = {
  message: string;
  onPress: () => void;
};

export function NivvaInsightCard({ message, onPress }: NivvaInsightCardProps) {
  const theme = useNivvaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${message} Confira a análise`}
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaIcon name="lightbulb-outline" color={theme.colors.primaryStrong} size={22} />
      </View>
      <View style={{ flex: 1, marginHorizontal: theme.spacing.sm }}>
        <NivvaText variant="titleSmall">{message}</NivvaText>
        <NivvaText variant="bodySmall" tone="secondary">
          Confira a análise
        </NivvaText>
      </View>
      <NivvaIcon name="arrow-forward" color={theme.colors.textSecondary} size={20} />
    </Pressable>
  );
}
