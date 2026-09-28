import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";

import {
  NivvaAmount,
  NivvaCard,
  NivvaScreenHeader,
  NivvaText,
  ScreenContainer,
  useNivvaTheme,
} from "@/core/design-system";
import { findCategory } from "@/data/mock/categories";
import { useFinance } from "@/features/finance";
import { formatDetailDate } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";

export function TransactionDetailsScreen({ id }: { id: string }) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const { transactions, accounts, isUserTransaction, deleteUserTransaction } = useFinance();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const transaction = transactions.find((item) => item.id === id);
  const editable = Boolean(transaction && isUserTransaction(id));

  if (!transaction) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
          <NivvaScreenHeader title="Transação" onBackPress={() => router.back()} />
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

  const category = findCategory(transaction.categoryId);
  const account = accounts.find((item) => item.id === transaction.accountId);
  const income = transaction.type === "income";

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.huge,
        }}
      >
        <NivvaScreenHeader title="Transação" onBackPress={() => router.back()} />

        <NivvaCard style={{ marginTop: theme.spacing.sm }}>
          <NivvaText variant="title">{transaction.title}</NivvaText>
          <View style={{ marginTop: theme.spacing.xs }}>
            <NivvaAmount
              amount={transaction.amount}
              size="large"
              showSign
              tone={income ? "income" : "primary"}
            />
          </View>
          <NivvaText variant="bodyLarge" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
            {category?.name ?? "Categoria"}
          </NivvaText>
        </NivvaCard>

        <DetailRow label="Conta" value={account?.name ?? transaction.accountId} />
        <DetailRow label="Data" value={formatDetailDate(transaction.occurredAt)} />
        {transaction.note ? <DetailRow label="Observação" value={transaction.note} /> : null}

        {editable ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar"
              onPress={() => router.push(`/transactions/${transaction.id}/edit`)}
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
                Editar
              </NivvaText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir transação"
              onPress={() => setConfirmOpen(true)}
              style={{
                marginTop: theme.spacing.sm,
                minHeight: theme.layout.buttonHeight,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NivvaText variant="label" tone="expense">
                Excluir transação
              </NivvaText>
            </Pressable>
          </>
        ) : (
          <NivvaText variant="bodySmall" tone="muted" style={{ marginTop: theme.spacing.lg }}>
            Lançamento de demonstração
          </NivvaText>
        )}
      </ScrollView>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <Pressable
          onPress={() => setConfirmOpen(false)}
          style={{
            flex: 1,
            backgroundColor: withAlpha(theme.colors.shadow, 0.45),
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.md,
              paddingBottom: theme.spacing.xl,
            }}
          >
            <NivvaText variant="title">Excluir transação?</NivvaText>
            <NivvaText variant="bodyLarge" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
              Esta ação removerá este lançamento do Nivva.
            </NivvaText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir"
              onPress={() => {
                deleteUserTransaction(transaction.id);
                setConfirmOpen(false);
                router.replace("/transactions");
              }}
              style={{
                marginTop: theme.spacing.lg,
                minHeight: theme.layout.buttonHeight,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.expense,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NivvaText variant="label" tone="inverse">
                Excluir
              </NivvaText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              onPress={() => setConfirmOpen(false)}
              style={{
                marginTop: theme.spacing.sm,
                minHeight: theme.layout.touchTarget,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NivvaText variant="label" tone="secondary">
                Cancelar
              </NivvaText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useNivvaTheme();

  return (
    <View style={{ marginTop: theme.spacing.md }}>
      <NivvaText variant="labelMedium" tone="secondary">
        {label}
      </NivvaText>
      <NivvaText variant="titleSmall" style={{ marginTop: theme.spacing.xxs }}>
        {value}
      </NivvaText>
    </View>
  );
}
