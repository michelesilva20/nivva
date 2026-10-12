import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";

import {
  NivvaAmount,
  NivvaCard,
  NivvaCategoryItem,
  NivvaIcon,
  NivvaScreenHeader,
  NivvaSectionHeader,
  NivvaSegmentedControl,
  NivvaText,
  ScreenContainer,
  useNivvaTheme,
} from "@/core/design-system";
import type { AnalyticsPeriod, BudgetSummary } from "@/domain/models";
import { BudgetLoadErrorCard, BudgetUnconfiguredCard } from "@/features/budget/components/BudgetUnconfiguredCard";
import { formatBudgetPeriod } from "@/features/budget/calculations/budget-calculations";
import { formatCurrency, formatPercentage } from "@/shared/utils/format";

import { useAnalyticsData } from "../hooks/useAnalyticsData";

const periods: { id: AnalyticsPeriod; label: string }[] = [
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
  { id: "year", label: "Ano" },
];

export function AnalyticsScreen() {
  const theme = useNivvaTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>("month");
  const analytics = useAnalyticsData(selectedPeriod);
  const selectedIndex = periods.findIndex((period) => period.id === selectedPeriod);
  const chartDescription = analytics.chart
    .map((bar) => `${bar.label}: ${formatPercentage(bar.ratio)} do maior gasto`)
    .join(", ");
  const hasPreviousBase = analytics.comparisonLabel !== "sem base anterior";
  const budget = analytics.budget;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <NivvaScreenHeader title="Análises" />
        <NivvaSegmentedControl
          items={periods.map((period) => period.label)}
          selectedIndex={selectedIndex}
          onSelect={(index) => {
            const period = periods[index];
            if (period) {
              setSelectedPeriod(period.id);
            }
          }}
        />

        <NivvaCard style={{ marginTop: theme.spacing.sm }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <NivvaText variant="bodyMedium" tone="secondary">
                Total de gastos
              </NivvaText>
              <NivvaAmount amount={analytics.totalExpenses} size="medium" />
            </View>
            {hasPreviousBase ? (
              <View style={{ flexDirection: "row", alignItems: "center", maxWidth: "46%" }}>
                <NivvaIcon name="trending-up" color={theme.colors.expense} size={18} />
                <NivvaText variant="titleSmall" tone="expense" style={{ flexShrink: 1 }}>
                  {analytics.comparisonLabel}
                </NivvaText>
              </View>
            ) : (
              <NivvaText variant="titleSmall" tone="secondary" style={{ maxWidth: "46%", flexShrink: 1 }}>
                {analytics.comparisonLabel}
              </NivvaText>
            )}
          </View>
          <View
            accessibilityLabel={`Gráfico de gastos mensais. ${chartDescription}`}
            style={{
              marginTop: theme.spacing.lg,
              height: 144,
              flexDirection: "row",
              alignItems: "flex-end",
            }}
          >
            {analytics.chart.map((bar) => (
              <View key={bar.label} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                <View
                  style={{
                    width: 24,
                    height: 100 * bar.ratio,
                    borderTopLeftRadius: 7,
                    borderTopRightRadius: 7,
                    backgroundColor: bar.highlighted ? theme.colors.chartBar : theme.colors.chartBarMuted,
                  }}
                />
                <NivvaText
                  variant="caption"
                  tone={bar.highlighted ? "brand" : "secondary"}
                  style={{ marginTop: theme.spacing.xs }}
                >
                  {bar.label}
                </NivvaText>
              </View>
            ))}
          </View>
        </NivvaCard>

        {analytics.budgetLoadStatus === "error" ? (
          <View style={{ marginTop: theme.spacing.sm }}>
            <BudgetLoadErrorCard />
          </View>
        ) : null}
        {analytics.budgetLoadStatus === "ready" && !budget ? (
          <View style={{ marginTop: theme.spacing.sm }}>
            <BudgetUnconfiguredCard
              title="Orçamento deste mês"
              message="Você ainda não definiu um orçamento mensal."
              actionLabel="Definir orçamento"
            />
          </View>
        ) : null}
        {budget ? <ConfiguredBudgetCard budget={budget} /> : null}

        <NivvaSectionHeader title="Gastos por categoria" />
        {analytics.categories.length === 0 ? (
          <NivvaText variant="bodyMedium" tone="secondary">
            Nenhum gasto por categoria neste período.
          </NivvaText>
        ) : (
          analytics.categories.map((category) => (
            <NivvaCategoryItem key={category.name} category={category} />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function ConfiguredBudgetCard({ budget }: { budget: BudgetSummary }) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const ringSize = 88;
  const stroke = 9;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = budget.usageRatio;
  const exceeded = budget.status === "exceeded";
  const accent = exceeded ? theme.colors.expense : theme.colors.primary;
  const budgetLabel = exceeded
    ? `Orçamento de ${formatBudgetPeriod(budget.period)}: ${formatPercentage(budget.utilization)} utilizado. Excedido em ${formatCurrency(budget.exceeded)}`
    : `Orçamento de ${formatBudgetPeriod(budget.period)}: ${formatPercentage(budget.utilization)} utilizado. ${formatCurrency(budget.available)} disponíveis`;

  return (
    <NivvaCard style={{ marginTop: theme.spacing.sm }} accessibilityLabel={budgetLabel}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <NivvaText variant="title">Orçamento deste mês</NivvaText>
          <NivvaText variant="bodySmall" tone="secondary" style={{ marginTop: theme.spacing.xxs }}>
            {formatBudgetPeriod(budget.period)}
          </NivvaText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar orçamento"
          onPress={() => router.push("/budget")}
          hitSlop={8}
          style={{ minHeight: theme.layout.touchTarget, justifyContent: "center" }}
        >
          <NivvaText variant="label" tone="brand">
            Editar
          </NivvaText>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: theme.spacing.md }}>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Utilização do orçamento"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(progress * 100),
            text: formatPercentage(budget.utilization),
          }}
          style={{ width: ringSize, height: ringSize, alignItems: "center", justifyContent: "center" }}
        >
          <Svg width={ringSize} height={ringSize}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={theme.colors.progressTrack}
              strokeWidth={stroke}
              fill="none"
            />
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={accent}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference * (1 - progress)}
              rotation={-90}
              origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
          </Svg>
          <View style={{ position: "absolute", alignItems: "center" }}>
            <NivvaText variant="headingSmall">{formatPercentage(budget.utilization)}</NivvaText>
            <NivvaText variant="caption" tone="secondary">
              utilizado
            </NivvaText>
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: theme.spacing.lg, minWidth: 0 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
            <NivvaAmount amount={budget.spent} size="small" />
            <NivvaText variant="bodySmall" tone="secondary">
              {" "}
              de {formatCurrency(budget.total)}
            </NivvaText>
          </View>
          <View
            style={{
              marginTop: theme.spacing.xs,
              height: 7,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.progressTrack,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: 7,
                backgroundColor: accent,
              }}
            />
          </View>
          {exceeded ? (
            <NivvaText variant="bodySmall" tone="expense" style={{ marginTop: theme.spacing.xs }}>
              Orçamento excedido {formatCurrency(budget.exceeded)}
            </NivvaText>
          ) : (
            <NivvaText variant="bodySmall" tone="brand" style={{ marginTop: theme.spacing.xs }}>
              {formatCurrency(budget.available)} disponíveis
            </NivvaText>
          )}
        </View>
      </View>
    </NivvaCard>
  );
}
