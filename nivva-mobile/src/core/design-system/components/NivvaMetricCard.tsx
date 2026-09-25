import type { Metric } from "@/domain/models";
import { formatCurrency } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaAmount } from "./NivvaAmount";
import { NivvaCard } from "./NivvaCard";
import { NivvaIcon, type NivvaIconName } from "./NivvaIcon";
import { NivvaText } from "./NivvaText";

const icons: Record<Metric["kind"], NivvaIconName> = {
  income: "arrow-downward",
  expense: "arrow-upward",
  available: "paid",
};

export function NivvaMetricCard({ metric, style }: { metric: Metric; style?: StyleProp<ViewStyle> }) {
  const theme = useNivvaTheme();
  const tint =
    metric.kind === "income"
      ? theme.colors.income
      : metric.kind === "expense"
        ? theme.colors.expense
        : theme.colors.primary;

  return (
    <NivvaCard
      style={style}
      accessibilityLabel={`${metric.label}: ${formatCurrency(metric.amount)}`}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: theme.radius.pill,
          backgroundColor: withAlpha(tint, 0.12),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaIcon name={icons[metric.kind]} color={tint} size={18} />
      </View>
      <NivvaText variant="caption" tone="secondary" numberOfLines={2} style={{ marginTop: theme.spacing.xs }}>
        {metric.label}
      </NivvaText>
      <View style={{ marginTop: theme.spacing.xxs }}>
        <NivvaAmount amount={metric.amount} size="small" />
      </View>
    </NivvaCard>
  );
}
