import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { NivvaText, useNivvaTheme } from "@/core/design-system";
import { useAccounts } from "@/features/accounts";
import { useFinance } from "@/features/finance/context/FinanceProvider";

export function FinancialDataGate({ children }: { children: ReactNode }) {
  const theme = useNivvaTheme();
  const { loadStatus: accountStatus, reloadAccounts } = useAccounts();
  const { loadStatus: transactionStatus, reloadTransactions } = useFinance();
  const ready = accountStatus === "ready" && transactionStatus === "ready";
  const failed = accountStatus === "error" || transactionStatus === "error";

  if (ready) {
    return children;
  }

  if (!failed) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: theme.spacing.xl,
      }}
    >
      <NivvaText variant="headingMedium" style={{ textAlign: "center" }}>
        Não foi possível carregar seus dados financeiros.
      </NivvaText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tentar novamente"
        onPress={() => {
          void Promise.all([reloadAccounts(), reloadTransactions()]);
        }}
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
          Tentar novamente
        </NivvaText>
      </Pressable>
    </View>
  );
}
