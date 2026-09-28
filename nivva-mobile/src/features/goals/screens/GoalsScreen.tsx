import { FlatList, Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { NivvaIcon, NivvaScreenHeader, NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";
import { formatCurrency } from "@/shared/utils/format";

import { NivvaGoalCard } from "../components/NivvaGoalCard";
import { useGoals } from "../context/GoalProvider";

export function GoalsScreen() {
  const theme = useNivvaTheme();
  const router = useRouter();
  const { snapshots } = useGoals();
  const active = snapshots.filter((snapshot) => snapshot.status === "active").length;
  const saved = snapshots.reduce((total, snapshot) => total + snapshot.currentAmount.cents, 0);
  const targeted = snapshots.reduce((total, snapshot) => total + snapshot.goal.targetAmount.cents, 0);

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
        <NivvaScreenHeader
          title="Metas"
          actionIcon={snapshots.length > 0 ? "add" : undefined}
          actionLabel="Criar meta"
          onActionPress={snapshots.length > 0 ? () => router.push("/goals/new") : undefined}
        />
        <NivvaText variant="bodyLarge" tone="secondary">
          Transforme planos em progresso.
        </NivvaText>

        {snapshots.length > 0 ? (
          <NivvaText variant="bodySmall" tone="muted" style={{ marginTop: theme.spacing.sm }}>
            {active} {active === 1 ? "ativa" : "ativas"} · {formatCurrency({ cents: saved })} em progresso ·{" "}
            {formatCurrency({ cents: targeted })} em objetivos
          </NivvaText>
        ) : null}

        <FlatList
          data={snapshots}
          keyExtractor={(item) => item.goal.id}
          contentContainerStyle={{ paddingTop: theme.spacing.md, paddingBottom: theme.spacing.huge, flexGrow: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          ListEmptyComponent={<EmptyGoals onCreate={() => router.push("/goals/new")} />}
          renderItem={({ item }) => (
            <NivvaGoalCard snapshot={item} onPress={() => router.push(`/goals/${item.goal.id}`)} />
          )}
        />
      </View>
    </ScreenContainer>
  );
}

function EmptyGoals({ onCreate }: { onCreate: () => void }) {
  const theme = useNivvaTheme();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: theme.spacing.lg }}>
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
        <NivvaIcon name="flag" color={theme.colors.primary} size={34} />
      </View>
      <NivvaText variant="headingMedium" style={{ marginTop: theme.spacing.lg, textAlign: "center" }}>
        Ainda não há metas por aqui
      </NivvaText>
      <NivvaText
        variant="bodyLarge"
        tone="secondary"
        style={{ marginTop: theme.spacing.xs, textAlign: "center" }}
      >
        Crie um objetivo financeiro e acompanhe seu progresso ao longo do tempo.
      </NivvaText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Criar primeira meta"
        onPress={onCreate}
        style={{
          marginTop: theme.spacing.lg,
          minHeight: theme.layout.buttonHeight,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaText variant="label" tone="inverse">
          Criar primeira meta
        </NivvaText>
      </Pressable>
    </View>
  );
}
