import { createContext, useContext } from "react";

import { lightTheme } from "./light-theme";
import type { NivvaTheme, ResolvedTheme, ThemePreference } from "./theme";

export type ThemeContextValue = {
  theme: NivvaTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  resolvedTheme: ResolvedTheme;
};

export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  preference: "system",
  setPreference: () => undefined,
  resolvedTheme: "light",
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useNivvaTheme(): NivvaTheme {
  return useTheme().theme;
}
