import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import {
  NivvaAmount,
  NivvaHomeTopBar,
  NivvaIcon,
  NivvaInsightCard,
  NivvaMetricCard,
  NivvaSectionHeader,
  NivvaText,
  NivvaTransactionItem,
  ScreenContainer,
  useNivvaTheme,
} from "@/core/design-system";
import { withAlpha } from "@/shared/utils/color";

import { findCategory } from "@/data/mock/categories";

import { AddMovementSheet } from "../components/AddMovementSheet";
import { useHomeData } from "../hooks/useHomeData";

const sparkline = [
  [0, 0.82],
  [0.2, 0.68],
  [0.38, 0.75],
  [0.57, 0.28],
  [0.78, 0.12],
  [1, 0.22],
] as const;

function sparklinePath(width: number, height: number): string {
  const points = sparkline.map(([x, y]) => ({ x: x * width, y: y * height }));
  const first = points[0];
  if (!first) {
    return "";
  }

  let path = `M ${first.x} ${first.y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    if (!start || !end) {
      continue;
    }
    const midX = (start.x + end.x) / 2;
    path += ` C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  }

  return path;
}

export function HomeScreen() {
  const theme = useNivvaTheme();
  const router = useRouter();
  const home = useHomeData();
  const [contentWidth, setContentWidth] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const compact = contentWidth > 0 && contentWidth < theme.layout.metricCompactBreakpoint;
  const [firstMetric, secondMetric, thirdMetric] = home.metrics;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <NivvaHomeTopBar initials={home.profileInitials} />
        <LinearGradient
          colors={theme.colors.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: theme.radius.hero,
            padding: theme.spacing.lg,
            overflow: "hidden",
          }}
        >
          <View style={{ position: "absolute", right: theme.spacing.lg, top: 28, width: "43%", height: 82 }}>
            <Svg width="100%" height="100%" viewBox="0 0 160 82">
              <Path
                d={sparklinePath(160, 82)}
                stroke={withAlpha(theme.colors.onHero, 0.65)}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <NivvaText variant="bodyMedium" tone="onHero">
              Seu saldo total
            </NivvaText>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                marginLeft: theme.spacing.xs,
                backgroundColor: theme.colors.onHeroMuted,
              }}
            />
          </View>
          <View style={{ marginTop: theme.spacing.xs }}>
            <NivvaAmount amount={home.balance} size="large" tone="onHero" />
          </View>
          {home.balanceVariationLabel ? (
            <NivvaText variant="labelMedium" tone="onHero" style={{ marginTop: theme.spacing.xxs }}>
              ↑ {home.balanceVariationLabel}
            </NivvaText>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar"
            onPress={() => setAddOpen(true)}
            style={{
              marginTop: theme.spacing.lg,
              height: theme.layout.touchTarget,
              borderRadius: theme.radius.md,
              backgroundColor: withAlpha(theme.colors.heroAction, 0.78),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.xs,
            }}
          >
            <NivvaIcon name="add" color={theme.colors.onHero} size={20} />
            <NivvaText variant="label" tone="onHero">
              Adicionar
            </NivvaText>
          </Pressable>
        </LinearGradient>

        <View
          onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
          style={{ marginTop: theme.spacing.sm, gap: theme.spacing.xs }}
        >
          {compact && firstMetric && secondMetric && thirdMetric ? (
            <>
              <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
                <NivvaMetricCard metric={firstMetric} style={{ flex: 1 }} />
                <NivvaMetricCard metric={secondMetric} style={{ flex: 1 }} />
              </View>
              <NivvaMetricCard metric={thirdMetric} />
            </>
          ) : (
            <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
              {home.metrics.map((metric) => (
                <NivvaMetricCard key={metric.kind} metric={metric} style={{ flex: 1 }} />
              ))}
            </View>
          )}
        </View>

        <View style={{ marginTop: theme.spacing.sm }}>
          <NivvaInsightCard message={home.insight.message} />
        </View>
        <NivvaSectionHeader
          title="Transações recentes"
          action={home.transactions.length > 0 ? "Ver todas" : undefined}
          onActionPress={home.transactions.length > 0 ? () => router.push("/transactions") : undefined}
        />
        {home.transactions.length === 0 ? (
          <NivvaText variant="bodyMedium" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            Você ainda não possui lançamentos.
          </NivvaText>
        ) : (
          home.transactions.map((transaction) => (
            <NivvaTransactionItem
              key={transaction.id}
              transaction={transaction}
              category={findCategory(transaction.categoryId)}
            />
          ))
        )}
      </ScrollView>
      <AddMovementSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSelectExpense={() => {
          setAddOpen(false);
          router.push("/transactions/new-expense");
        }}
        onSelectIncome={() => {
          setAddOpen(false);
          router.push("/transactions/new-income");
        }}
      />
    </ScreenContainer>
  );
}
