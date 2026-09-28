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
import { money, type GoalEditInput, type GoalIconKey } from "@/domain/models";
import { formatCurrency } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";

import {
  formatGoalDeadline,
  isDeadlineInThePast,
  toDeadlineDate,
  validateGoalTarget,
} from "../calculations/goal-calculations";
import { goalIcons } from "../icons";

type GoalFormValues = GoalEditInput;

export function GoalForm({
  mode,
  initialValues,
  currentCents = 0,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialValues?: GoalFormValues;
  currentCents?: number;
  onSubmit: (values: GoalFormValues) => void;
}) {
  const theme = useNivvaTheme();
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [digits, setDigits] = useState(initialValues ? String(initialValues.targetAmountInCents) : "0");
  const [iconKey, setIconKey] = useState<GoalIconKey>(initialValues?.iconKey ?? "other");
  const [note, setNote] = useState(initialValues?.note ?? "");
  const [deadline, setDeadline] = useState(initialValues?.deadline);
  const [deadlineDate, setDeadlineDate] = useState(
    initialValues?.deadline ? new Date(`${initialValues.deadline}T12:00:00`) : new Date(),
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; target?: string; deadline?: string }>({});
  const targetAmountInCents = Number.parseInt(digits || "0", 10);

  function handleDateChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === "android") {
      setDateOpen(false);
    }

    if (event.type === "dismissed" || !date) {
      return;
    }

    setDeadlineDate(date);
    setDeadline(toDeadlineDate(date));
  }

  function handleSave() {
    const nextErrors: { title?: string; target?: string; deadline?: string } = {};

    if (!title.trim()) {
      nextErrors.title = "Dê um nome para a meta.";
    }

    const targetError = validateGoalTarget(targetAmountInCents, currentCents);
    if (targetError) {
      nextErrors.target = targetError;
    }

    if (deadline && isDeadlineInThePast(deadline) && deadline !== initialValues?.deadline) {
      nextErrors.deadline = "Escolha um prazo a partir de hoje.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      title: title.trim(),
      targetAmountInCents,
      iconKey,
      deadline,
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
          <NivvaScreenHeader
            title={mode === "edit" ? "Editar meta" : "Nova meta"}
            onBackPress={() => router.back()}
          />

          <FieldLabel title="Nome" error={errors.title} />
          <TextInput
            accessibilityLabel="Nome da meta"
            placeholder="Entrada do apartamento"
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            style={inputStyle(theme)}
          />

          <NivvaCard style={{ marginTop: theme.spacing.md }}>
            <NivvaText variant="labelMedium" tone="secondary">
              Valor da meta
            </NivvaText>
            <TextInput
              accessibilityLabel="Valor da meta"
              keyboardType="number-pad"
              value={formatCurrency(money(targetAmountInCents))}
              onChangeText={(value) => setDigits(value.replace(/\D/g, "") || "0")}
              style={{
                marginTop: theme.spacing.xs,
                minHeight: theme.layout.touchTarget,
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.moneyLarge.fontFamily,
                fontSize: theme.typography.moneyLarge.fontSize,
              }}
            />
            {errors.target ? (
              <NivvaText variant="bodySmall" tone="expense" style={{ marginTop: theme.spacing.xxs }}>
                {errors.target}
              </NivvaText>
            ) : null}
          </NivvaCard>

          <FieldLabel title="Prazo" error={errors.deadline} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={deadline ? `Prazo ${formatGoalDeadline(deadline)}` : "Prazo opcional"}
            onPress={() => setDateOpen(true)}
            style={[inputStyle(theme), { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
          >
            <NivvaText tone={deadline ? "primary" : "muted"}>
              {deadline ? formatGoalDeadline(deadline) : "Opcional"}
            </NivvaText>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {deadline ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remover prazo"
                  onPress={() => setDeadline(undefined)}
                  hitSlop={8}
                  style={{
                    width: theme.layout.touchTarget,
                    height: theme.layout.touchTarget,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <NivvaIcon name="close" color={theme.colors.textSecondary} size={18} />
                </Pressable>
              ) : null}
              <NivvaIcon name="calendar-month" color={theme.colors.textSecondary} />
            </View>
          </Pressable>

          <FieldLabel title="Ícone" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
            {goalIcons.map((item) => {
              const selected = item.key === iconKey;
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected }}
                  onPress={() => setIconKey(item.key)}
                  style={{
                    width: 56,
                    minHeight: theme.layout.touchTarget,
                    borderRadius: theme.radius.md,
                    backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
                    borderWidth: 1,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <NivvaIcon
                    name={item.icon}
                    color={selected ? theme.colors.primary : theme.colors.textSecondary}
                    size={22}
                  />
                </Pressable>
              );
            })}
          </View>

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
            accessibilityLabel={mode === "edit" ? "Salvar meta" : "Criar meta"}
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
              {mode === "edit" ? "Salvar meta" : "Criar meta"}
            </NivvaText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {dateOpen && Platform.OS === "android" ? (
        <DateTimePicker value={deadlineDate} mode="date" display="default" onChange={handleDateChange} />
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
              <NivvaText variant="title">Prazo</NivvaText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirmar prazo"
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
              value={deadlineDate}
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
