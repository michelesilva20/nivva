import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { darkTheme } from "./dark-theme";
import { lightTheme } from "./light-theme";
import { isThemePreference, resolveThemeMode, type ThemePreference } from "./theme";
import { ThemeContext } from "./useTheme";

const STORAGE_KEY = "@nivva/theme-preference";

export function NivvaThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (isThemePreference(stored)) {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const resolvedTheme = resolveThemeMode(preference, systemScheme);
  const theme = resolvedTheme === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      preference,
      setPreference,
      resolvedTheme,
    }),
    [theme, preference, setPreference, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export { useNivvaTheme, useTheme } from "./useTheme";
