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
  NivvaCard,
  NivvaIcon,
  NivvaScreenHeader,
  NivvaText,
  ScreenContainer,
  useNivvaTheme,
} from "@/core/design-system";
import { money } from "@/domain/models";
import { toOccurredAt } from "@/features/finance/calculations/calculations";
import { formatCurrency, formatExpenseDate } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";

import { validateContributionAmount } from "../calculations/goal-calculations";
import { useGoals } from "../context/GoalProvider";

export function ContributeGoalScreen({ id }: { id: string }) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const { getSnapshot, addContribution } = useGoals();
  const snapshot = getSnapshot(id);
  const [digits, setDigits] = useState("0");
  const [note, setNote] = useState("");
  const [occurredOn, setOccurredOn] = useState(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amountInCents = Number.parseInt(digits || "0", 10);

  if (!snapshot) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
          <NivvaScreenHeader title="Registrar progresso" onBackPress={() => router.back()} />
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <NivvaText variant="headingMedium">Meta não encontrada</NivvaText>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  const remainingCents = snapshot.remainingAmount.cents;
  const remainingAmount = snapshot.remainingAmount;
  const goalId = snapshot.goal.id;

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
    const nextError = validateContributionAmount(amountInCents, remainingCents);
    setError(nextError);

    if (nextError) {
      return;
    }

    addContribution({
      goalId,
      amountInCents,
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
          contentContainerStyle={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.huge }}
        >
          <NivvaScreenHeader title="Registrar progresso" onBackPress={() => router.back()} />
          <NivvaText variant="bodyLarge" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
            Este registro acompanha o progresso da meta e não movimenta o saldo das suas contas.
          </NivvaText>

          <NivvaCard style={{ marginTop: theme.spacing.md }}>
            <NivvaText variant="labelMedium" tone="secondary">
              Valor
            </NivvaText>
            <TextInput
              accessibilityLabel="Valor do progresso"
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
            {error ? (
              <NivvaText variant="bodySmall" tone="expense" style={{ marginTop: theme.spacing.xxs }}>
                {error}
              </NivvaText>
            ) : (
              <NivvaText variant="bodySmall" tone="muted" style={{ marginTop: theme.spacing.xxs }}>
                Faltam {formatCurrency(remainingAmount)}
              </NivvaText>
            )}
          </NivvaCard>

          <NivvaText variant="labelMedium" tone="secondary" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
            Data
          </NivvaText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Data do progresso, ${formatExpenseDate(occurredOn)}`}
            onPress={() => setDateOpen(true)}
            style={{
              minHeight: theme.layout.touchTarget,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <NivvaText>{formatExpenseDate(occurredOn)}</NivvaText>
            <NivvaIcon name="calendar-month" color={theme.colors.textSecondary} />
          </Pressable>

          <NivvaText variant="labelMedium" tone="secondary" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
            Observação
          </NivvaText>
          <TextInput
            accessibilityLabel="Observação opcional"
            placeholder="Opcional"
            placeholderTextColor={theme.colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            style={{
              minHeight: 88,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing.sm,
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.bodyLarge.fontFamily,
              fontSize: theme.typography.bodyLarge.fontSize,
              textAlignVertical: "top",
            }}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Registrar"
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
              Registrar
            </NivvaText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {dateOpen && Platform.OS === "android" ? (
        <DateTimePicker value={occurredOn} mode="date" display="default" onChange={handleDateChange} />
      ) : null}

      <Modal visible={dateOpen && Platform.OS === "ios"} transparent animationType="fade" onRequestClose={() => setDateOpen(false)}>
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
    </ScreenContainer>
  );
}
