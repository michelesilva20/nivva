import { Pressable, View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaIcon, type NivvaIconName } from "./NivvaIcon";
import { NivvaText } from "./NivvaText";

type NivvaScreenHeaderProps = {
  title: string;
  onBackPress?: () => void;
  backLabel?: string;
  actionIcon?: NivvaIconName;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function NivvaScreenHeader({
  title,
  onBackPress,
  backLabel = "Voltar",
  actionIcon,
  actionLabel,
  onActionPress,
}: NivvaScreenHeaderProps) {
  const theme = useNivvaTheme();

  return (
    <View style={{ minHeight: theme.layout.touchTarget, flexDirection: "row", alignItems: "center" }}>
      {onBackPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          onPress={onBackPress}
          hitSlop={8}
          style={{
            width: theme.layout.touchTarget,
            height: theme.layout.touchTarget,
            marginRight: theme.spacing.xxs,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NivvaIcon name="arrow-back" color={theme.colors.textPrimary} />
        </Pressable>
      ) : null}
      <NivvaText variant="headingMedium" style={{ flex: 1 }}>
        {title}
      </NivvaText>
      {actionIcon && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onActionPress}
          hitSlop={8}
          style={{
            width: theme.layout.touchTarget,
            height: theme.layout.touchTarget,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NivvaIcon name={actionIcon} color={theme.colors.textPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}
