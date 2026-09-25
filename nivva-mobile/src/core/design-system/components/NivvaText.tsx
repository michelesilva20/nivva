import { Text, type TextProps, type TextStyle } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import type { TypographyVariant } from "../theme/typography";

type TextTone =
  | "primary"
  | "secondary"
  | "muted"
  | "inverse"
  | "income"
  | "expense"
  | "brand"
  | "onHero";

type NivvaTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: TextTone;
};

export function NivvaText({
  variant = "bodyMedium",
  tone = "primary",
  style,
  ...props
}: NivvaTextProps) {
  const theme = useNivvaTheme();
  const color = resolveTone(theme.colors, tone);

  return <Text {...props} style={[theme.typography[variant], { color }, style as TextStyle]} />;
}

function resolveTone(
  colors: ReturnType<typeof useNivvaTheme>["colors"],
  tone: TextTone,
): string {
  switch (tone) {
    case "secondary":
      return colors.textSecondary;
    case "muted":
      return colors.textMuted;
    case "inverse":
      return colors.textInverse;
    case "income":
      return colors.income;
    case "expense":
      return colors.expense;
    case "brand":
      return colors.primary;
    case "onHero":
      return colors.onHero;
    default:
      return colors.textPrimary;
  }
}
