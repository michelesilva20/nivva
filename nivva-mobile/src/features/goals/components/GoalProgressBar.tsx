import { View } from "react-native";

import { useNivvaTheme } from "@/core/design-system";

export function GoalProgressBar({ progress, completed }: { progress: number; completed?: boolean }) {
  const theme = useNivvaTheme();
  const ratio = Math.min(1, Math.max(0, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      style={{
        height: 8,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.progressTrack,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${ratio * 100}%`,
          height: "100%",
          backgroundColor: completed ? theme.colors.income : theme.colors.primary,
        }}
      />
    </View>
  );
}
