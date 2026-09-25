import type { CategoryKind, ExpenseCategory } from "@/domain/models";
import { formatCurrency } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";
import { View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import type { NivvaColors } from "../theme/theme";
import { NivvaAmount } from "./NivvaAmount";
import { NivvaIcon, type NivvaIconName } from "./NivvaIcon";
import { NivvaText } from "./NivvaText";

const icons: Record<CategoryKind, NivvaIconName> = {
  home: "home",
  food: "local-dining",
  transport: "directions-bus",
  leisure: "sports-esports",
  subscription: "subscriptions",
  other: "more-horiz",
  income: "payments",
};

export function categoryColor(kind: CategoryKind, colors: NivvaColors): string {
  switch (kind) {
    case "home":
      return colors.categoryHome;
    case "food":
      return colors.categoryFood;
    case "transport":
      return colors.categoryTransport;
    case "leisure":
      return colors.categoryLeisure;
    case "subscription":
      return colors.categorySubscription;
    case "income":
      return colors.income;
    default:
      return colors.categoryOther;
  }
}

export function NivvaCategoryItem({ category }: { category: ExpenseCategory }) {
  const theme = useNivvaTheme();
  const color = categoryColor(category.kind, theme.colors);
  const icon = (category.icon as NivvaIconName) || icons[category.kind];

  return (
    <View
      accessibilityLabel={`${category.name}, ${category.percentage}% dos gastos, ${formatCurrency(category.amount)}`}
      style={{
        minHeight: 58,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: theme.spacing.xs,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: theme.radius.sm,
          backgroundColor: withAlpha(color, 0.12),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaIcon name={icon} color={color} size={20} />
      </View>
      <View style={{ flex: 1, marginLeft: theme.spacing.sm, marginRight: theme.spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <NivvaText variant="titleSmall" style={{ flex: 1 }}>
            {category.name}
          </NivvaText>
          <NivvaText variant="labelMedium" tone="secondary">
            {category.percentage}%
          </NivvaText>
        </View>
        <View
          style={{
            marginTop: theme.spacing.xxs,
            height: 4,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.surfaceSecondary,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${category.percentage}%`,
              height: 4,
              backgroundColor: color,
            }}
          />
        </View>
      </View>
      <NivvaAmount amount={category.amount} size="small" />
    </View>
  );
}
