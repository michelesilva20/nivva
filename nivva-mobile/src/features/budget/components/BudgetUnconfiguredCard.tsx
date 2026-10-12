import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { NivvaCard, NivvaText, useNivvaTheme } from "@/core/design-system";

export function BudgetUnconfiguredCard({
  title = "Orçamento mensal",
  message = "Defina seu orçamento mensal",
  actionLabel = "Configurar",
}: {
  title?: string;
  message?: string;
  actionLabel?: string;
}) {
  const theme = useNivvaTheme();
  const router = useRouter();

  return (
    <NivvaCard>
      <NivvaText variant="title">{title}</NivvaText>
      <NivvaText variant="bodyMedium" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
        {message}
      </NivvaText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        onPress={() => router.push("/budget")}
        style={{
          marginTop: theme.spacing.md,
          minHeight: theme.layout.touchTarget,
          justifyContent: "center",
        }}
      >
        <NivvaText variant="label" tone="brand">
          {actionLabel}
        </NivvaText>
      </Pressable>
    </NivvaCard>
  );
}

export function BudgetLoadErrorCard() {
  const theme = useNivvaTheme();

  return (
    <View style={{ paddingVertical: theme.spacing.sm }}>
      <NivvaText variant="bodyMedium" tone="secondary">
        Não foi possível ler o orçamento.
      </NivvaText>
    </View>
  );
}
