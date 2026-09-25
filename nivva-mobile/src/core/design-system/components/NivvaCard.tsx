import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";

type NivvaCardProps = ViewProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function NivvaCard({ children, style, ...props }: NivvaCardProps) {
  const theme = useNivvaTheme();

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.cardBorder,
          borderWidth: theme.colors.cardBorderWidth,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          shadowColor: theme.colors.shadow,
          shadowOpacity: theme.colors.cardShadowOpacity,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
