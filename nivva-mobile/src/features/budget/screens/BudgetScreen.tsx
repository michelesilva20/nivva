import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { NivvaCard, NivvaScreenHeader, NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";
import { money } from "@/domain/models";
import { useFinance } from "@/features/finance";
import { formatCurrency } from "@/shared/utils/format";

import {
  buildBudgetSummary,
  calculateBudgetSpent,
  formatBudgetPeriod,
  getCurrentBudgetPeriod,
  validateBudgetLimit,
} from "../calculations/budget-calculations";
import { useBudget } from "../context/BudgetProvider";

export function BudgetScreen() {
  const theme = useNivvaTheme();
  const router = useRouter();
  const finance = useFinance();
  const { getEffectiveLimit, setBudgetForPeriod } = useBudget();
  const period = getCurrentBudgetPeriod(finance.referenceDate);
  const limit = getEffectiveLimit(period, finance.referenceDate);
  const spent = calculateBudgetSpent(finance.transactions, period);
  const summary = buildBudgetSummary(limit, spent, period);
  const exceeded = summary.status === "exceeded";
  const [digits, setDigits] = useState(String(limit.cents));
  const [error, setError] = useState<string | null>(null);
  const amountInCents = Number.parseInt(digits || "0", 10);

  function handleSave() {
    const nextError = validateBudgetLimit(amountInCents);
    setError(nextError);

    if (nextError) {
      return;
    }

    setBudgetForPeriod(period, amountInCents);
    router.back();
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={theme.spacing.sm}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.huge }}
        >
          <NivvaScreenHeader title="Orçamento mensal" onBackPress={() => router.back()} />
          <NivvaText variant="title" style={{ marginTop: theme.spacing.sm }}>
            {formatBudgetPeriod(period)}
          </NivvaText>
          <NivvaText variant="bodyLarge" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            Quanto você pretende gastar neste mês?
          </NivvaText>
          <NivvaText variant="bodySmall" tone="muted" style={{ marginTop: theme.spacing.sm }}>
            O orçamento ajuda você a acompanhar seus gastos do mês. Alterá-lo não movimenta dinheiro das suas contas.
          </NivvaText>

          <NivvaCard style={{ marginTop: theme.spacing.md }}>
            <NivvaText variant="labelMedium" tone="secondary">
              Valor do orçamento
            </NivvaText>
            <TextInput
              accessibilityLabel="Valor do orçamento"
              keyboardType="number-pad"
              value={formatCurrency(money(amountInCents))}
              onChangeText={(value) => setDigits(value.replace(/\D/g, "") || "0")}
              style={{
                marginTop: theme.spacing.xs,
                minHeight: theme.layout.touchTarget,
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.moneyLarge.fontFamily,
                fontSize: theme.typography.moneyLarge.fontSize,
              }}
            />
            {error ? (
              <NivvaText variant="bodySmall" tone="expense" style={{ marginTop: theme.spacing.xxs }}>
                {error}
              </NivvaText>
            ) : null}
          </NivvaCard>

          <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
            <SummaryRow label="Gasto até agora" value={formatCurrency(summary.spent)} />
            {exceeded ? (
              <SummaryRow label="Orçamento excedido" value={formatCurrency(summary.exceeded)} tone="expense" />
            ) : (
              <SummaryRow label="Disponível" value={formatCurrency(summary.available)} />
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salvar orçamento"
            onPress={handleSave}
            style={{
              marginTop: theme.spacing.xl,
              minHeight: theme.layout.buttonHeight,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NivvaText variant="label" tone="inverse">
              Salvar orçamento
            </NivvaText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function SummaryRow({
  label,
  value,
  tone = "secondary",
}: {
  label: string;
  value: string;
  tone?: "secondary" | "expense";
}) {
  return (
    <View style={{ minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <NivvaText tone="secondary">{label}</NivvaText>
      <NivvaText tone={tone}>{value}</NivvaText>
    </View>
  );
}
