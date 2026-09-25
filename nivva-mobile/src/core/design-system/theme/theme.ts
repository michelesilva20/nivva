import { layout } from "./layout";
import { motion } from "./motion";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { typography, type TypographyVariant } from "./typography";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export type NivvaColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  onPrimary: string;
  brandAccent: string;
  border: string;
  cardBorder: string;
  cardBorderWidth: number;
  divider: string;
  income: string;
  expense: string;
  warning: string;
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  chartBar: string;
  chartBarMuted: string;
  categoryHome: string;
  categoryFood: string;
  categoryTransport: string;
  categoryLeisure: string;
  categorySubscription: string;
  categoryOther: string;
  actionTransfer: string;
  onHero: string;
  onHeroMuted: string;
  heroAction: string;
  heroGradient: readonly [string, string, string];
  accountGradient: readonly [string, string, string];
  shadow: string;
  cardShadowOpacity: number;
};

export type NivvaTheme = {
  dark: boolean;
  colors: NivvaColors;
  spacing: typeof spacing;
  radius: typeof radius;
  motion: typeof motion;
  layout: typeof layout;
  typography: typeof typography;
};

export const themeFoundation = {
  spacing,
  radius,
  motion,
  layout,
  typography,
} as const;

export function resolveThemeMode(
  preference: ThemePreference,
  systemScheme: string | null | undefined,
): ResolvedTheme {
  if (preference === "light" || preference === "dark") {
    return preference;
  }

  return systemScheme === "dark" ? "dark" : "light";
}

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export type { TypographyVariant };
