import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { NivvaScreenHeader, NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";
import { isApiError } from "@/data/api/api-error";

import { AccountForm } from "../components/AccountForm";
import { useAccounts } from "../context/AccountProvider";

export function EditAccountScreen({ id }: { id: string }) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const { accounts, updateAccount, deleteAccount } = useAccounts();
  const account = accounts.find((item) => item.id === id);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!account) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
          <NivvaScreenHeader title="Editar conta" onBackPress={() => router.back()} />
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <NivvaText variant="headingMedium">Conta não encontrada</NivvaText>
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
    <AccountForm
      mode="edit"
      initialAccount={account}
      deleteError={deleteError}
      onSubmit={async (values) => {
        await updateAccount({ id: account.id, ...values });
      }}
      onDelete={async () => {
        try {
          await deleteAccount(account.id);
        } catch (error) {
          if (isApiError(error) && error.status === 409) {
            setDeleteError("Essa conta possui lançamentos e não pode ser excluída.");
          } else {
            setDeleteError(error instanceof Error ? error.message : "Não foi possível excluir a conta.");
          }
          throw error;
        }
      }}
    />
  );
}
