import { Pressable, View } from "react-native";

import { withAlpha } from "@/shared/utils/color";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaIcon, type NivvaIconName } from "./NivvaIcon";
import { NivvaText } from "./NivvaText";

type NivvaQuickActionProps = {
  label: string;
  icon: NivvaIconName;
  onPress: () => void;
  tint?: string;
};

export function NivvaQuickAction({ label, icon, onPress, tint }: NivvaQuickActionProps) {
  const theme = useNivvaTheme();
  const color = tint ?? theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label.replace("\n", " ")}
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", paddingVertical: theme.spacing.xs, minHeight: 48 }}
    >
      <View
        style={{
          width: theme.layout.touchTarget,
          height: theme.layout.touchTarget,
          borderRadius: theme.radius.pill,
          backgroundColor: withAlpha(color, 0.12),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaIcon name={icon} color={color} />
      </View>
      <NivvaText
        variant="caption"
        style={{ marginTop: theme.spacing.xs, textAlign: "center" }}
        numberOfLines={2}
      >
        {label}
      </NivvaText>
    </Pressable>
  );
}
