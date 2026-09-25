import { Pressable, View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaText } from "./NivvaText";

type NivvaSectionHeaderProps = {
  title: string;
  action?: string;
  onActionPress?: () => void;
};

export function NivvaSectionHeader({ title, action, onActionPress }: NivvaSectionHeaderProps) {
  const theme = useNivvaTheme();

  return (
    <View style={{ minHeight: theme.layout.touchTarget, flexDirection: "row", alignItems: "center" }}>
      <NivvaText variant="title" style={{ flex: 1 }}>
        {title}
      </NivvaText>
      {action && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={onActionPress}
          hitSlop={8}
          style={{
            minHeight: theme.layout.touchTarget,
            justifyContent: "center",
            paddingHorizontal: theme.spacing.sm,
          }}
        >
          <NivvaText variant="labelMedium" tone="brand">
            {action}
          </NivvaText>
        </Pressable>
      ) : null}
    </View>
  );
}
