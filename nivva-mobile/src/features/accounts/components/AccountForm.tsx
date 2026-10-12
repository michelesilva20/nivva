import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { NivvaScreenHeader, NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPES, money, type Account, type AccountType } from "@/domain/models";
import { formatCurrency } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";

export function AccountForm({
  mode,
  initialAccount,
  onSubmit,
  onDelete,
  deleteError,
}: {
  mode: "create" | "edit";
  initialAccount?: Account;
  onSubmit: (account: { name: string; type: AccountType; openingBalance: ReturnType<typeof money> }) => Promise<void>;
  onDelete?: () => Promise<void>;
  deleteError?: string | null;
}) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const [name, setName] = useState(initialAccount?.name ?? "");
  const [type, setType] = useState<AccountType>(initialAccount?.type ?? "checking");
  const [digits, setDigits] = useState(initialAccount ? String(initialAccount.openingBalance.cents) : "0");
  const [errors, setErrors] = useState<{ name?: string; opening?: string }>({});
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const openingBalanceCents = Number.parseInt(digits || "0", 10);

  async function handleSave() {
    const next: { name?: string; opening?: string } = {};
    if (!name.trim()) {
      next.name = "Dê um nome para a conta.";
    }
    if (!Number.isFinite(openingBalanceCents) || openingBalanceCents < 0) {
      next.opening = "O saldo inicial não pode ser negativo.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || saving) {
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        openingBalance: money(openingBalanceCents),
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: theme.spacing.md }}>
          <NivvaScreenHeader
            title={mode === "create" ? "Nova conta" : "Editar conta"}
            onBackPress={() => router.back()}
          />
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl }}>
          <NivvaText variant="label">Nome</NivvaText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nubank, Carteira..."
            placeholderTextColor={theme.colors.textMuted}
            style={{
              marginTop: theme.spacing.xs,
              minHeight: theme.layout.buttonHeight,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: errors.name ? theme.colors.expense : theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              color: theme.colors.textPrimary,
            }}
          />
          {errors.name ? (
            <NivvaText variant="bodySmall" tone="expense" style={{ marginTop: theme.spacing.xs }}>
              {errors.name}
            </NivvaText>
          ) : null}

          <NivvaText variant="label" style={{ marginTop: theme.spacing.lg }}>
            Tipo
          </NivvaText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
            {ACCOUNT_TYPES.map((item) => {
              const selected = item === type;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={ACCOUNT_TYPE_LABELS[item]}
                  onPress={() => setType(item)}
                  style={{
                    minHeight: theme.layout.touchTarget,
                    paddingHorizontal: theme.spacing.md,
                    borderRadius: theme.radius.pill,
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    justifyContent: "center",
                  }}
                >
                  <NivvaText variant="label" tone={selected ? "inverse" : "primary"}>
                    {ACCOUNT_TYPE_LABELS[item]}
                  </NivvaText>
                </Pressable>
              );
            })}
          </View>

          <NivvaText variant="label" style={{ marginTop: theme.spacing.lg }}>
            Saldo inicial
          </NivvaText>
          <TextInput
            value={formatCurrency(money(openingBalanceCents))}
            keyboardType="number-pad"
            onChangeText={(value) => setDigits(value.replace(/\D/g, "") || "0")}
            style={{
              marginTop: theme.spacing.xs,
              minHeight: theme.layout.buttonHeight,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: errors.opening ? theme.colors.expense : theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              color: theme.colors.textPrimary,
            }}
          />
          <NivvaText variant="bodySmall" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            Alterar o saldo inicial não cria um lançamento.
          </NivvaText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mode === "create" ? "Criar conta" : "Salvar"}
            onPress={() => {
              void handleSave();
            }}
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
              {mode === "create" ? "Criar conta" : "Salvar"}
            </NivvaText>
          </Pressable>

          {mode === "edit" && onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir conta"
              onPress={() => setConfirmOpen(true)}
              style={{
                marginTop: theme.spacing.sm,
                minHeight: theme.layout.buttonHeight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NivvaText variant="label" tone="expense">
                Excluir conta
              </NivvaText>
            </Pressable>
          ) : null}
          {deleteError ? (
            <NivvaText variant="bodySmall" tone="expense" style={{ marginTop: theme.spacing.sm }}>
              {deleteError}
            </NivvaText>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <Pressable
          onPress={() => setConfirmOpen(false)}
          style={{ flex: 1, backgroundColor: withAlpha(theme.colors.shadow, 0.45), justifyContent: "flex-end" }}
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
            <NivvaText variant="title">Excluir conta?</NivvaText>
            <NivvaText variant="bodyLarge" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
              Só é possível excluir uma conta sem lançamentos.
            </NivvaText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir"
              onPress={() => {
                void (async () => {
                  try {
                    await onDelete?.();
                    setConfirmOpen(false);
                    router.back();
                  } catch {
                    setConfirmOpen(false);
                  }
                })();
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
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
