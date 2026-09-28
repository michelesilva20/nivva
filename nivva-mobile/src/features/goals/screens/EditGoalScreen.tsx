import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { NivvaScreenHeader, NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";

import { GoalForm } from "../components/GoalForm";
import { useGoals } from "../context/GoalProvider";

export function EditGoalScreen({ id }: { id: string }) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const { getSnapshot, updateGoal } = useGoals();
  const snapshot = getSnapshot(id);

  if (!snapshot) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
          <NivvaScreenHeader title="Editar meta" onBackPress={() => router.back()} />
          <MissingGoal />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <GoalForm
      mode="edit"
      currentCents={snapshot.currentAmount.cents}
      initialValues={{
        title: snapshot.goal.title,
        targetAmountInCents: snapshot.goal.targetAmount.cents,
        deadline: snapshot.goal.deadline,
        note: snapshot.goal.note,
        iconKey: snapshot.goal.iconKey,
      }}
      onSubmit={(values) => updateGoal(id, values)}
    />
  );
}

function MissingGoal() {
  const theme = useNivvaTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <NivvaText variant="headingMedium">Meta não encontrada</NivvaText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => router.back()}
        style={{
          marginTop: theme.spacing.lg,
          minHeight: theme.layout.buttonHeight,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
        }}
      >
        <NivvaText variant="label" tone="inverse">
          Voltar
        </NivvaText>
      </Pressable>
    </View>
  );
}
