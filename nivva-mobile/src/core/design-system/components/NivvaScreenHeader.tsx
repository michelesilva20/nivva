import { Pressable, View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaIcon, type NivvaIconName } from "./NivvaIcon";
import { NivvaText } from "./NivvaText";

type NivvaScreenHeaderProps = {
  title: string;
  actionIcon?: NivvaIconName;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function NivvaScreenHeader({
  title,
  actionIcon,
  actionLabel,
  onActionPress,
}: NivvaScreenHeaderProps) {
  const theme = useNivvaTheme();

  return (
    <View style={{ minHeight: theme.layout.touchTarget, flexDirection: "row", alignItems: "center" }}>
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
