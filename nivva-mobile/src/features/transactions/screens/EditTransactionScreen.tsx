import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { NivvaScreenHeader, NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";
import { useFinance } from "@/features/finance";
import { applyTransactionEdits } from "@/features/finance/persistence/local-finance";

import { TransactionForm } from "../components/TransactionForm";

export function EditTransactionScreen({ id }: { id: string }) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const { transactions, isUserTransaction, updateUserTransaction } = useFinance();
  const transaction = transactions.find((item) => item.id === id);

  if (!transaction || !isUserTransaction(id)) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
          <NivvaScreenHeader title="Editar" onBackPress={() => router.back()} />
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: theme.spacing.xl }}>
            <NivvaText variant="headingMedium" style={{ textAlign: "center" }}>
              Transação não encontrada
            </NivvaText>
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
                alignItems: "center",
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

  return (
    <TransactionForm
      kind={transaction.type}
      mode="edit"
      initialValues={{
        title: transaction.title,
        amountInCents: Math.abs(transaction.amount.cents),
        categoryId: transaction.categoryId,
        accountId: transaction.accountId,
        occurredAt: transaction.occurredAt,
        note: transaction.note,
      }}
      onSubmit={(values) => {
        updateUserTransaction(applyTransactionEdits(transaction, values));
      }}
    />
  );
}
