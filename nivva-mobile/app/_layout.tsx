import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  useFonts,
} from "@expo-google-fonts/urbanist";

import { NivvaThemeProvider, useTheme } from "@/core/design-system";
import { createApiClient } from "@/data/api/api-client";
import { createAuthRepository } from "@/data/auth/auth-repository";
import { createAuthSession } from "@/data/auth/auth-session";
import { createSecureTokenStore } from "@/data/auth/secure-token-store";
import { getTransactionSource } from "@/data/repositories/active-transaction-repository";
import { createApiAccountRepository } from "@/data/repositories/api-account-repository";
import { createApiGoalRepository } from "@/data/repositories/api-goal-repository";
import { createApiTransactionRepository } from "@/data/repositories/api-transaction-repository";
import { localAccountRepository } from "@/data/repositories/local-account-repository";
import { localGoalRepository } from "@/data/repositories/async-storage-goal-repository";
import { AccountProvider } from "@/features/accounts";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { AuthSessionGate } from "@/features/auth/components/AuthSessionGate";
import { BudgetProvider } from "@/features/budget";
import { FinanceProvider, FinancialDataGate } from "@/features/finance";
import { GoalProvider } from "@/features/goals";
import { NivvaNotice } from "@/shared/components/NivvaNotice";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <NivvaThemeProvider>
      <AppProviders />
    </NivvaThemeProvider>
  );
}

function AppProviders() {
  const source = getTransactionSource();
  const session = useMemo(() => createAuthSession(), []);
  const apiClient = useMemo(
    () =>
      createApiClient({
        getAccessToken: () => session.getAccessToken(),
        onUnauthorized: () => session.notifyUnauthorized(),
      }),
    [session],
  );
  const authRepository = useMemo(() => createAuthRepository(apiClient), [apiClient]);
  const tokenStore = useMemo(() => createSecureTokenStore(), []);
  const apiTransactions = useMemo(() => createApiTransactionRepository(apiClient), [apiClient]);
  const apiAccounts = useMemo(() => createApiAccountRepository(apiClient), [apiClient]);
  const apiGoals = useMemo(() => createApiGoalRepository(apiClient), [apiClient]);

  if (source === "local") {
    return (
      <AccountProvider repository={localAccountRepository}>
        <FinanceProvider>
          <GoalProvider repository={localGoalRepository}>
            <BudgetProvider>
              <FinancialDataGate>
                <RootNavigator showNotice />
              </FinancialDataGate>
            </BudgetProvider>
          </GoalProvider>
        </FinanceProvider>
      </AccountProvider>
    );
  }

  return (
    <AuthProvider repository={authRepository} tokenStore={tokenStore} session={session}>
      <AuthSessionGate repository={apiTransactions} accounts={apiAccounts} goals={apiGoals}>
        <RootNavigator />
      </AuthSessionGate>
    </AuthProvider>
  );
}

function RootNavigator({ showNotice }: { showNotice?: boolean }) {
  const { theme, resolvedTheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark" } />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      {showNotice ? <NivvaNotice /> : null}
    </View>
  );
}
