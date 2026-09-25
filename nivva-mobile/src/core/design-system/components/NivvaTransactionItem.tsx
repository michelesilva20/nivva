import type { Category, Transaction } from "@/domain/models";
import { formatCurrency } from "@/shared/utils/format";
import { formatTransactionSupport } from "@/shared/utils/transaction";
import { withAlpha } from "@/shared/utils/color";
import { View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { categoryColor } from "./NivvaCategoryItem";
import { NivvaAmount } from "./NivvaAmount";
import { NivvaIcon, type NivvaIconName } from "./NivvaIcon";
import { NivvaText } from "./NivvaText";

export function NivvaTransactionItem({
  transaction,
  category,
}: {
  transaction: Transaction;
  category?: Category;
}) {
  const theme = useNivvaTheme();
  const income = transaction.type === "income";
  const tint = income ? theme.colors.income : category ? categoryColor(category.kind, theme.colors) : theme.colors.primary;
  const support = formatTransactionSupport(transaction, category?.name ?? "Categoria");
  const icon = (category?.icon as NivvaIconName | undefined) ?? (income ? "payments" : "account-balance-wallet");

  return (
    <View
      accessibilityLabel={`${transaction.title}, ${support}, ${formatCurrency(transaction.amount, true)}`}
      style={{
        minHeight: 64,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: theme.spacing.xs,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.sm,
          backgroundColor: withAlpha(tint, 0.11),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaIcon name={icon} color={tint} size={21} />
      </View>
      <View style={{ flex: 1, marginHorizontal: theme.spacing.sm }}>
        <NivvaText variant="titleSmall">{transaction.title}</NivvaText>
        <NivvaText variant="bodySmall" tone="secondary" numberOfLines={1}>
          {support}
        </NivvaText>
      </View>
      <NivvaAmount
        amount={transaction.amount}
        size="small"
        showSign
        tone={income ? "income" : "primary"}
      />
    </View>
  );
}
