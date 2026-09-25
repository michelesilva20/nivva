import type { TextStyle } from "react-native";

export const fonts = {
  regular: "Urbanist_400Regular",
  medium: "Urbanist_500Medium",
  semibold: "Urbanist_600SemiBold",
  bold: "Urbanist_700Bold",
} as const;

export const typography = {
  display: {
    fontFamily: fonts.semibold,
    fontSize: 40,
    lineHeight: 46,
  },
  headingLarge: {
    fontFamily: fonts.semibold,
    fontSize: 30,
    lineHeight: 36,
  },
  headingMedium: {
    fontFamily: fonts.semibold,
    fontSize: 25,
    lineHeight: 31,
  },
  headingSmall: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 28,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  titleSmall: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  labelMedium: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  moneyLarge: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  moneyMedium: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 28,
  },
  moneySmall: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
