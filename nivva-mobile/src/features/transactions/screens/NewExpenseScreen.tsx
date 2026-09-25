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
import { useFinance } from "@/features/finance";
import { toOccurredAt } from "@/features/finance/calculations/calculations";
import { formatCurrency, formatExpenseDate } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";

type FormErrors = {
  amount?: string;
  title?: string;
  categoryId?: string;
  accountId?: string;
};

export function NewExpenseScreen() {
  const theme = useNivvaTheme();
  const router = useRouter();
  const { accounts, addExpense } = useFinance();
  const [digits, setDigits] = useState("0");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "main");
  const [note, setNote] = useState("");
  const [occurredOn, setOccurredOn] = useState(new Date());
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
      next.title = "Descreva o gasto.";
    }

    if (!categoryId) {
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

  function handleSave() {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !categoryId) {
      return;
    }

    addExpense({
      title: title.trim(),
      amountInCents,
      categoryId,
      accountId,
      occurredAt: toOccurredAt(occurredOn),
      note: note.trim() || undefined,
    });
    router.back();
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
          <NivvaScreenHeader
            title="Novo gasto"
            actionIcon="close"
            actionLabel="Fechar"
            onActionPress={() => router.back()}
          />

          <NivvaCard style={{ marginTop: theme.spacing.sm }}>
            <NivvaText variant="labelMedium" tone="secondary">
              Valor
            </NivvaText>
            <TextInput
              accessibilityLabel="Valor do gasto"
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
            accessibilityLabel="Descrição do gasto"
            placeholder="Mercado, Uber, Netflix..."
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            style={inputStyle(theme)}
          />

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

          <FieldLabel title="Conta" error={errors.accountId} />
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

          <FieldLabel title="Data" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Data do gasto, ${formatExpenseDate(occurredOn)}`}
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
            accessibilityLabel="Adicionar gasto"
            onPress={handleSave}
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
              Adicionar gasto
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
