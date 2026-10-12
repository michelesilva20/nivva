import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";

import { NivvaCard, NivvaIcon, NivvaScreenHeader, NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";
import { formatCurrency, formatShortDate, isSameCalendarDay } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";

import { formatGoalDeadlineLong, formatGoalPercentage } from "../calculations/goal-calculations";
import { GoalProgressBar } from "../components/GoalProgressBar";
import { useGoals } from "../context/GoalProvider";
import { goalIcon } from "../icons";

export function GoalDetailsScreen({ id }: { id: string }) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const { getSnapshot, deleteGoal, loadGoalDetail } = useGoals();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const snapshot = getSnapshot(id);

  useEffect(() => {
    void loadGoalDetail(id);
  }, [id, loadGoalDetail]);

  if (!snapshot) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
          <NivvaScreenHeader title="Meta" onBackPress={() => router.back()} />
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
        </View>
      </ScreenContainer>
    );
  }

  const completed = snapshot.status === "completed";
  const tint = completed ? theme.colors.income : theme.colors.primary;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.huge }}>
        <NivvaScreenHeader title="Meta" onBackPress={() => router.back()} />

        <NivvaCard style={{ marginTop: theme.spacing.sm, alignItems: "flex-start" }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: theme.radius.md,
              backgroundColor: withAlpha(tint, 0.12),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NivvaIcon name={goalIcon(snapshot.goal.iconKey)} color={tint} size={26} />
          </View>
          <NivvaText variant="headingMedium" style={{ marginTop: theme.spacing.sm }}>
            {snapshot.goal.title}
          </NivvaText>
          <NivvaText variant="moneyMedium" style={{ marginTop: theme.spacing.xs }}>
            {formatCurrency(snapshot.currentAmount)}
          </NivvaText>
          <NivvaText variant="bodyLarge" tone="secondary">
            de {formatCurrency(snapshot.goal.targetAmount)}
          </NivvaText>
          <NivvaText variant="label" tone={completed ? "income" : "brand"} style={{ marginTop: theme.spacing.sm }}>
            {formatGoalPercentage(snapshot.progress)}
          </NivvaText>
          <View style={{ width: "100%", marginTop: theme.spacing.sm }}>
            <GoalProgressBar progress={snapshot.progress} completed={completed} />
          </View>
          {completed ? (
            <NivvaText variant="bodySmall" tone="income" style={{ marginTop: theme.spacing.sm }}>
              Meta concluída
            </NivvaText>
          ) : (
            <NivvaText variant="bodySmall" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
              Faltam {formatCurrency(snapshot.remainingAmount)}
            </NivvaText>
          )}
          {snapshot.goal.deadline ? (
            <NivvaText variant="bodySmall" tone="secondary" style={{ marginTop: theme.spacing.xxs }}>
              Prazo {formatGoalDeadlineLong(snapshot.goal.deadline)}
            </NivvaText>
          ) : null}
          {snapshot.goal.note ? (
            <NivvaText variant="bodySmall" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
              {snapshot.goal.note}
            </NivvaText>
          ) : null}
        </NivvaCard>

        {!completed ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Registrar progresso"
            onPress={() => router.push(`/goals/${snapshot.goal.id}/contribute`)}
            style={{
              marginTop: theme.spacing.md,
              minHeight: theme.layout.buttonHeight,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NivvaText variant="label" tone="inverse">
              Registrar progresso
            </NivvaText>
          </Pressable>
        ) : null}

        <NivvaText variant="title" style={{ marginTop: theme.spacing.xl }}>
          Histórico de progresso
        </NivvaText>
        {snapshot.contributions.length === 0 ? (
          <NivvaText variant="bodyLarge" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
            Você ainda não registrou progresso nesta meta.
          </NivvaText>
        ) : (
          snapshot.contributions.map((contribution) => (
            <View
              key={contribution.id}
              style={{
                minHeight: theme.layout.touchTarget,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <NivvaText tone="secondary">{contributionDayLabel(contribution.occurredAt)}</NivvaText>
              <NivvaText tone="income">{formatCurrency(contribution.amount, true)}</NivvaText>
            </View>
          ))
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar meta"
          onPress={() => router.push(`/goals/${snapshot.goal.id}/edit`)}
          style={{
            marginTop: theme.spacing.xl,
            minHeight: theme.layout.buttonHeight,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NivvaText variant="label">Editar meta</NivvaText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Excluir meta"
          onPress={() => setConfirmOpen(true)}
          style={{
            marginTop: theme.spacing.sm,
            minHeight: theme.layout.buttonHeight,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NivvaText variant="label" tone="expense">
            Excluir meta
          </NivvaText>
        </Pressable>
      </ScrollView>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <Pressable
          onPress={() => setConfirmOpen(false)}
          style={{ flex: 1, backgroundColor: withAlpha(theme.colors.shadow, 0.45), justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.md,
              paddingBottom: theme.spacing.xl,
            }}
          >
            <NivvaText variant="title">Excluir meta?</NivvaText>
            <NivvaText variant="bodyLarge" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
              Todo o progresso registrado nesta meta também será removido.
            </NivvaText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir"
              accessibilityState={{ disabled: deleting }}
              disabled={deleting}
              onPress={() => {
                void (async () => {
                  setDeleting(true);
                  try {
                    await deleteGoal(snapshot.goal.id);
                    setConfirmOpen(false);
                    router.replace("/goals");
                  } catch {
                    setConfirmOpen(false);
                  } finally {
                    setDeleting(false);
                  }
                })();
              }}
              style={{
                marginTop: theme.spacing.lg,
                minHeight: theme.layout.buttonHeight,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.expense,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NivvaText variant="label" tone="inverse">
                Excluir
              </NivvaText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              onPress={() => setConfirmOpen(false)}
              style={{
                marginTop: theme.spacing.sm,
                minHeight: theme.layout.touchTarget,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NivvaText variant="label" tone="secondary">
                Cancelar
              </NivvaText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

function contributionDayLabel(occurredAt: string): string {
  const date = new Date(occurredAt);
  const today = new Date();
  if (isSameCalendarDay(date, today)) {
    return "Hoje";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameCalendarDay(date, yesterday)) {
    return "Ontem";
  }

  return formatShortDate(occurredAt);
}
