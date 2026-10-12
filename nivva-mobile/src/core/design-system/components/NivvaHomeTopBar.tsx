import { View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaText } from "./NivvaText";
import { NivvaWordmark } from "./NivvaWordmark";

type NivvaHomeTopBarProps = {
  initials: string;
};

export function NivvaHomeTopBar({ initials }: NivvaHomeTopBarProps) {
  const theme = useNivvaTheme();

  return (
    <View style={{ minHeight: theme.layout.touchTarget, flexDirection: "row", alignItems: "center" }}>
      <NivvaWordmark />
      <View style={{ flex: 1 }} />
      {initials ? (
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
      ) : null}
    </View>
  );
}
