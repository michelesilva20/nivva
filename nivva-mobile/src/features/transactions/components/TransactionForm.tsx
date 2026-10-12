import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

import {
  categoryColor,
  NivvaCard,
  NivvaIcon,
  NivvaScreenHeader,
  NivvaSegmentedControl,
  NivvaText,
  ScreenContainer,
  useNivvaTheme,
  type NivvaIconName,
} from "@/core/design-system";
import { expenseCategories, findCategory } from "@/data/mock/categories";
import { money } from "@/domain/models";
import { useAccounts } from "@/features/accounts";
import { useFinance } from "@/features/finance";
import { toOccurredAt } from "@/features/finance/calculations/calculations";
import { formatCurrency, formatExpenseDate, isSameCalendarDay } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";

type TransactionFormKind = "expense" | "income";

type FormErrors = {
  amount?: string;
  title?: string;
  categoryId?: string;
  accountId?: string;
};

export type TransactionFormValues = {
  title: string;
  amountInCents: number;
  categoryId: string;
  accountId: string;
  occurredAt: string;
  note?: string;
};

type TransactionFormMode = "create" | "edit";

const copy: Record<
  TransactionFormKind,
  {
    title: string;
    amountLabel: string;
    descriptionPlaceholder: string;
    descriptionError: string;
    submitLabel: string;
  }
> = {
  expense: {
    title: "Novo gasto",
    amountLabel: "Valor do gasto",
    descriptionPlaceholder: "Mercado, Uber, Netflix...",
    descriptionError: "Descreva o gasto.",
    submitLabel: "Adicionar gasto",
  },
  income: {
    title: "Nova receita",
    amountLabel: "Valor da receita",
    descriptionPlaceholder: "Salário, Freelance, Venda...",
    descriptionError: "Descreva a receita.",
    submitLabel: "Adicionar receita",
  },
};

export function TransactionForm({
  kind,
  mode = "create",
  initialValues,
  onSubmit,
}: {
  kind: TransactionFormKind;
  mode?: TransactionFormMode;
  initialValues?: TransactionFormValues;
  onSubmit: (values: TransactionFormValues) => void | Promise<void>;
}) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const { accounts } = useFinance();
  const { canMutate } = useAccounts();
  const labels = {
    ...copy[kind],
    ...(mode === "edit"
      ? {
          title: kind === "income" ? "Editar receita" : "Editar gasto",
          submitLabel: "Salvar",
        }
      : {}),
  };
  const [digits, setDigits] = useState(initialValues ? String(initialValues.amountInCents) : "0");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    initialValues?.categoryId ?? (kind === "income" ? "income" : null),
  );
  const [accountId, setAccountId] = useState(initialValues?.accountId ?? accounts[0]?.id ?? "");
  const [note, setNote] = useState(initialValues?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [occurredOn, setOccurredOn] = useState(
    initialValues ? new Date(initialValues.occurredAt) : new Date(),
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const amountInCents = Number.parseInt(digits || "0", 10);
  const selectedCategory = categoryId ? findCategory(categoryId) : undefined;
  const selectedAccountIndex = Math.max(
    0,
    accounts.findIndex((account) => account.id === accountId),
  );

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (amountInCents <= 0) {
      next.amount = "Informe um valor maior que zero.";
    }

    if (!title.trim()) {
      next.title = labels.descriptionError;
    }

    if (kind === "expense" && !categoryId) {
      next.categoryId = "Escolha uma categoria.";
    }

    if (!accountId) {
      next.accountId = "Escolha uma conta.";
    }

    return next;
  }

  function handleDateChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === "android") {
      setDateOpen(false);
    }

    if (event.type === "dismissed" || !date) {
      return;
    }

    setOccurredOn(date);
  }

  async function handleSave() {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !categoryId || saving) {
      return;
    }

    const occurredAt =
      initialValues && isSameCalendarDay(occurredOn, new Date(initialValues.occurredAt))
        ? initialValues.occurredAt
        : toOccurredAt(occurredOn);

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        amountInCents,
        categoryId,
        accountId,
        occurredAt,
        note: note.trim() || undefined,
      });
      router.back();
    } catch {
      // O FinanceProvider já mostrou o erro. Permanecer no formulário.
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={theme.spacing.sm}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.huge,
          }}
        >
          {mode === "edit" || kind === "income" ? (
            <NivvaScreenHeader title={labels.title} onBackPress={() => router.back()} />
          ) : (
            <NivvaScreenHeader
              title={labels.title}
              actionIcon="close"
              actionLabel="Fechar"
              onActionPress={() => router.back()}
            />
          )}

          <NivvaCard style={{ marginTop: theme.spacing.sm }}>
            <NivvaText variant="labelMedium" tone="secondary">
              Valor
            </NivvaText>
            <TextInput
              accessibilityLabel={labels.amountLabel}
              keyboardType="number-pad"
              value={formatCurrency(money(amountInCents))}
              onChangeText={(value) => setDigits(value.replace(/\D/g, "") || "0")}
              style={{
                marginTop: theme.spacing.xs,
                minHeight: theme.layout.touchTarget,
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.moneyLarge.fontFamily,
                fontSize: theme.typography.moneyLarge.fontSize,
              }}
            />
            {errors.amount ? (
              <NivvaText variant="bodySmall" tone="expense" style={{ marginTop: theme.spacing.xxs }}>
                {errors.amount}
              </NivvaText>
            ) : null}
          </NivvaCard>

          <FieldLabel title="Descrição" error={errors.title} />
          <TextInput
            accessibilityLabel={`Descrição ${kind === "income" ? "da receita" : "do gasto"}`}
            placeholder={labels.descriptionPlaceholder}
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            style={inputStyle(theme)}
          />

          {kind === "expense" ? (
            <>
              <FieldLabel title="Categoria" error={errors.categoryId} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={selectedCategory ? `Categoria ${selectedCategory.name}` : "Escolher categoria"}
                onPress={() => setCategoryOpen(true)}
                style={[
                  inputStyle(theme),
                  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
                  {selectedCategory ? (
                    <NivvaIcon
                      name={selectedCategory.icon as NivvaIconName}
                      color={categoryColor(selectedCategory.kind, theme.colors)}
                      size={20}
                    />
                  ) : null}
                  <NivvaText tone={selectedCategory ? "primary" : "muted"}>
                    {selectedCategory?.name ?? "Selecionar"}
                  </NivvaText>
                </View>
                <NivvaIcon name="expand-more" color={theme.colors.textSecondary} />
              </Pressable>
            </>
          ) : null}

          <FieldLabel title="Conta" error={errors.accountId} />
          {accounts.length === 0 ? (
            <View style={{ marginBottom: theme.spacing.md }}>
              <NivvaText variant="bodyMedium">Crie uma conta antes de adicionar um lançamento.</NivvaText>
              {canMutate ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Adicionar conta"
                  onPress={() => router.push("/accounts/new")}
                  style={{ marginTop: theme.spacing.sm }}
                >
                  <NivvaText variant="label">Adicionar conta</NivvaText>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <NivvaSegmentedControl
              items={accounts.map((account) => account.name)}
              selectedIndex={selectedAccountIndex}
              onSelect={(index) => {
                const account = accounts[index];
                if (account) {
                  setAccountId(account.id);
                }
              }}
            />
          )}

          <FieldLabel title="Data" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Data ${kind === "income" ? "da receita" : "do gasto"}, ${formatExpenseDate(occurredOn)}`}
            onPress={() => setDateOpen(true)}
            style={[
              inputStyle(theme),
              { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
            ]}
          >
            <NivvaText>{formatExpenseDate(occurredOn)}</NivvaText>
            <NivvaIcon name="calendar-month" color={theme.colors.textSecondary} />
          </Pressable>

          <FieldLabel title="Observação" />
          <TextInput
            accessibilityLabel="Observação opcional"
            placeholder="Opcional"
            placeholderTextColor={theme.colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            style={[inputStyle(theme), { minHeight: 88, textAlignVertical: "top" }]}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={labels.submitLabel}
            accessibilityState={{ disabled: saving }}
            disabled={saving}
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
              opacity: saving ? 0.7 : 1,
            }}
          >
            <NivvaText variant="label" tone="inverse">
              {saving ? "Salvando..." : labels.submitLabel}
            </NivvaText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {dateOpen && Platform.OS === "android" ? (
        <DateTimePicker value={occurredOn} mode="date" display="default" onChange={handleDateChange} />
      ) : null}

      <Modal
        visible={dateOpen && Platform.OS === "ios"}
        transparent
        animationType="fade"
        onRequestClose={() => setDateOpen(false)}
      >
        <Pressable
          onPress={() => setDateOpen(false)}
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
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <NivvaText variant="title">Data</NivvaText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirmar data"
                onPress={() => setDateOpen(false)}
                hitSlop={8}
                style={{ minHeight: theme.layout.touchTarget, justifyContent: "center" }}
              >
                <NivvaText variant="label" tone="brand">
                  Pronto
                </NivvaText>
              </Pressable>
            </View>
            <DateTimePicker
              value={occurredOn}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              themeVariant={theme.dark ? "dark" : "light"}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {kind === "expense" ? (
        <Modal
          visible={categoryOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoryOpen(false)}
        >
          <Pressable
            onPress={() => setCategoryOpen(false)}
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
              <NivvaText variant="title" style={{ marginBottom: theme.spacing.sm }}>
                Categoria
              </NivvaText>
              {expenseCategories.map((category) => (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityLabel={category.name}
                  onPress={() => {
                    setCategoryId(category.id);
                    setCategoryOpen(false);
                  }}
                  style={{
                    minHeight: theme.layout.touchTarget,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                  }}
                >
                  <NivvaIcon
                    name={category.icon as NivvaIconName}
                    color={categoryColor(category.kind, theme.colors)}
                  />
                  <NivvaText variant="titleSmall">{category.name}</NivvaText>
                </Pressable>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </ScreenContainer>
  );
}

function FieldLabel({ title, error }: { title: string; error?: string }) {
  const theme = useNivvaTheme();

  return (
    <View style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
      <NivvaText variant="labelMedium" tone="secondary">
        {title}
      </NivvaText>
      {error ? (
        <NivvaText variant="bodySmall" tone="expense" style={{ marginTop: theme.spacing.xxs }}>
          {error}
        </NivvaText>
      ) : null}
    </View>
  );
}

function inputStyle(theme: ReturnType<typeof useNivvaTheme>) {
  return {
    minHeight: theme.layout.touchTarget,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: theme.typography.bodyLarge.fontSize,
  };
}
