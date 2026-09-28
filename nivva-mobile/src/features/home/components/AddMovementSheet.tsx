import { Modal, Pressable, View } from "react-native";

import { NivvaIcon, NivvaText, useNivvaTheme, type NivvaIconName } from "@/core/design-system";
import { withAlpha } from "@/shared/utils/color";

type AddMovementSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelectExpense: () => void;
  onSelectIncome: () => void;
};

export function AddMovementSheet({
  visible,
  onClose,
  onSelectExpense,
  onSelectIncome,
}: AddMovementSheetProps) {
  const theme = useNivvaTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
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
            Adicionar movimentação
          </NivvaText>

          <MovementOption
            icon="arrow-downward"
            tint={theme.colors.expense}
            title="Despesa"
            subtitle="Registre uma saída de dinheiro"
            onPress={onSelectExpense}
          />
          <MovementOption
            icon="arrow-upward"
            tint={theme.colors.income}
            title="Receita"
            subtitle="Registre uma entrada de dinheiro"
            onPress={onSelectIncome}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
            onPress={onClose}
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
  );
}

function MovementOption({
  icon,
  tint,
  title,
  subtitle,
  onPress,
}: {
  icon: NivvaIconName;
  tint: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const theme = useNivvaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={{
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.sm,
          backgroundColor: withAlpha(tint, 0.11),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaIcon name={icon} color={tint} size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <NivvaText variant="titleSmall">{title}</NivvaText>
        <NivvaText variant="bodySmall" tone="secondary">
          {subtitle}
        </NivvaText>
      </View>
    </Pressable>
  );
}
