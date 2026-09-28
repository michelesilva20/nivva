import { Pressable, View } from "react-native";

import { NivvaCard, NivvaIcon, NivvaText, useNivvaTheme } from "@/core/design-system";
import { formatCurrency } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";

import { formatGoalDeadline, formatGoalPercentage, type GoalSnapshot } from "../calculations/goal-calculations";
import { goalIcon } from "../icons";
import { GoalProgressBar } from "./GoalProgressBar";

export function NivvaGoalCard({ snapshot, onPress }: { snapshot: GoalSnapshot; onPress: () => void }) {
  const theme = useNivvaTheme();
  const completed = snapshot.status === "completed";
  const tint = completed ? theme.colors.income : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${snapshot.goal.title}, ${formatCurrency(snapshot.currentAmount)} de ${formatCurrency(snapshot.goal.targetAmount)}, ${formatGoalPercentage(snapshot.progress)}${completed ? ", meta concluída" : ""}`}
      onPress={onPress}
    >
      <NivvaCard>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.radius.sm,
              backgroundColor: withAlpha(tint, 0.12),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NivvaIcon name={goalIcon(snapshot.goal.iconKey)} color={tint} size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <NivvaText variant="titleSmall">{snapshot.goal.title}</NivvaText>
            <NivvaText variant="bodySmall" tone="secondary">
              {formatCurrency(snapshot.currentAmount)} de {formatCurrency(snapshot.goal.targetAmount)}
            </NivvaText>
          </View>
          <NivvaText variant="label" tone={completed ? "income" : "brand"}>
            {formatGoalPercentage(snapshot.progress)}
          </NivvaText>
        </View>

        <View style={{ marginTop: theme.spacing.sm }}>
          <GoalProgressBar progress={snapshot.progress} completed={completed} />
        </View>

        <View style={{ marginTop: theme.spacing.sm }}>
          {completed ? (
            <NivvaText variant="bodySmall" tone="income">
              Meta concluída
            </NivvaText>
          ) : (
            <NivvaText variant="bodySmall" tone="secondary">
              Faltam {formatCurrency(snapshot.remainingAmount)}
              {snapshot.goal.deadline ? ` · Prazo: ${formatGoalDeadline(snapshot.goal.deadline)}` : ""}
            </NivvaText>
          )}
        </View>
      </NivvaCard>
    </Pressable>
  );
}
