import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Redirect, usePathname } from "expo-router";

import { NivvaText, useNivvaTheme } from "@/core/design-system";
import { BudgetProvider } from "@/features/budget";
import { FinanceProvider } from "@/features/finance";
import { GoalProvider } from "@/features/goals";
import type { TransactionRepository } from "@/data/repositories/transaction-repository";
import { NivvaNotice } from "@/shared/components/NivvaNotice";

import { useAuth } from "../context/AuthProvider";

const AUTH_ROUTES = new Set(["/login", "/register"]);

export function AuthSessionGate({
  children,
  repository,
}: {
  children: ReactNode;
  repository: TransactionRepository;
}) {
  const theme = useNivvaTheme();
  const pathname = usePathname();
  const { status, retrySession, logout } = useAuth();
  const onAuthRoute = AUTH_ROUTES.has(pathname);

  if (status === "loading") {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  if (status === "unreachable") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: theme.spacing.xl,
        }}
      >
        <NivvaText variant="headingMedium" style={{ textAlign: "center" }}>
          Não foi possível conectar ao Nivva.
        </NivvaText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          onPress={() => {
            void retrySession();
          }}
          style={{
            marginTop: theme.spacing.lg,
            minHeight: theme.layout.buttonHeight,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NivvaText variant="label" tone="inverse">
            Tentar novamente
          </NivvaText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair"
          onPress={() => {
            void logout();
          }}
          style={{ marginTop: theme.spacing.md, minHeight: theme.layout.buttonHeight, justifyContent: "center" }}
        >
          <NivvaText variant="bodyMedium" tone="secondary">
            Sair
          </NivvaText>
        </Pressable>
      </View>
    );
  }

  if (status === "unauthenticated") {
    return onAuthRoute ? children : <Redirect href="/login" />;
  }

  if (onAuthRoute) {
    return <Redirect href="/" />;
  }

  return (
    <FinanceProvider repository={repository}>
      <GoalProvider>
        <BudgetProvider>
          {children}
          <NivvaNotice />
        </BudgetProvider>
      </GoalProvider>
    </FinanceProvider>
  );
}
