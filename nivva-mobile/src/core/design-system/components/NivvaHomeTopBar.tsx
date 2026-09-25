import { Pressable, View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaIcon } from "./NivvaIcon";
import { NivvaText } from "./NivvaText";
import { NivvaWordmark } from "./NivvaWordmark";

type NivvaHomeTopBarProps = {
  initials: string;
  onNotificationsPress: () => void;
};

export function NivvaHomeTopBar({ initials, onNotificationsPress }: NivvaHomeTopBarProps) {
  const theme = useNivvaTheme();

  return (
    <View style={{ minHeight: theme.layout.touchTarget, flexDirection: "row", alignItems: "center" }}>
      <NivvaWordmark />
      <View style={{ flex: 1 }} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notificações"
        onPress={onNotificationsPress}
        hitSlop={8}
        style={{
          width: theme.layout.touchTarget,
          height: theme.layout.touchTarget,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaIcon name="notifications-none" color={theme.colors.textPrimary} />
      </Pressable>
      <View
        accessibilityLabel={`Perfil, iniciais ${initials}`}
        style={{
          width: 38,
          height: 38,
          marginLeft: theme.spacing.xs,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaText variant="label" tone="brand">
          {initials}
        </NivvaText>
      </View>
    </View>
  );
}
