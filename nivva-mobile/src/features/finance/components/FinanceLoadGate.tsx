import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { NivvaText, useNivvaTheme } from "@/core/design-system";
import { useFinance } from "@/features/finance/context/FinanceProvider";

export function FinanceLoadGate({ children }: { children: ReactNode }) {
  const theme = useNivvaTheme();
  const { loadStatus, reloadTransactions } = useFinance();

  if (loadStatus === "ready") {
    return children;
  }

  if (loadStatus === "loading") {
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
        Não foi possível carregar seus lançamentos.
      </NivvaText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tentar novamente"
        onPress={() => {
          void reloadTransactions();
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
