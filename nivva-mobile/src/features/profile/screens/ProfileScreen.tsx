import { Pressable, ScrollView, View } from "react-native";
import Constants from "expo-constants";

import {
  NivvaCard,
  NivvaScreenHeader,
  NivvaSegmentedControl,
  NivvaText,
  ScreenContainer,
  useNivvaTheme,
  useTheme,
  type ThemePreference,
} from "@/core/design-system";
import { getTransactionSource } from "@/data/repositories/active-transaction-repository";
import { useAccounts } from "@/features/accounts";
import { useOptionalAuth } from "@/features/auth/context/AuthProvider";
import { useFinance } from "@/features/finance";
import { useGoals } from "@/features/goals";
import { initialsFromDisplayName, LOCAL_DEMO_DISPLAY_NAME } from "@/shared/utils/initials";

import { formatProfileCount, profileCountFromLoad } from "../profile-summary";

const appearanceOptions: { id: ThemePreference; label: string }[] = [
  { id: "system", label: "Sistema" },
  { id: "light", label: "Claro" },
  { id: "dark", label: "Escuro" },
];

export function ProfileScreen() {
  const theme = useNivvaTheme();
  const { preference, setPreference } = useTheme();
  const auth = useOptionalAuth();
  const accounts = useAccounts();
  const finance = useFinance();
  const goals = useGoals();
  const source = getTransactionSource();
  const selectedIndex = appearanceOptions.findIndex((option) => option.id === preference);
  const user = auth?.user ?? null;
  const isLocal = source === "local";
  const displayName = user?.displayName ?? (isLocal ? LOCAL_DEMO_DISPLAY_NAME : "Nivva");
  const email = user?.email ?? (isLocal ? "Modo local" : null);
  const initials = initialsFromDisplayName(displayName) ?? "N";
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const accountCount = profileCountFromLoad(accounts.loadStatus, accounts.accounts.length);
  const transactionCount = profileCountFromLoad(finance.loadStatus, finance.transactions.length);
  const goalCount = profileCountFromLoad(goals.loadStatus, goals.snapshots.length);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.huge,
        }}
        showsVerticalScrollIndicator={false}
      >
        <NivvaScreenHeader title="Perfil" />

        <NivvaCard style={{ marginTop: theme.spacing.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
            <View
              accessibilityLabel={`Iniciais ${initials}`}
              style={{
                width: 64,
                height: 64,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.primarySoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NivvaText variant="headingMedium" tone="brand">
                {initials}
              </NivvaText>
            </View>
            <View style={{ flex: 1 }}>
              <NivvaText variant="headingMedium">{displayName}</NivvaText>
              {email ? (
                <NivvaText variant="bodyMedium" tone="secondary" style={{ marginTop: theme.spacing.xxs }}>
                  {email}
                </NivvaText>
              ) : null}
            </View>
          </View>
        </NivvaCard>

        <NivvaCard style={{ marginTop: theme.spacing.sm }}>
          <View style={{ flexDirection: "row" }}>
            <SummaryMetric label="Contas" value={formatProfileCount(accountCount)} />
            <SummaryMetric label="Lançamentos" value={formatProfileCount(transactionCount)} />
            <SummaryMetric label="Metas" value={formatProfileCount(goalCount)} />
          </View>
        </NivvaCard>

        <SectionTitle>Preferências</SectionTitle>
        <NivvaCard>
          <NivvaText variant="title" style={{ marginBottom: theme.spacing.sm }}>
            Aparência
          </NivvaText>
          <NivvaSegmentedControl
            items={appearanceOptions.map((option) => option.label)}
            selectedIndex={selectedIndex < 0 ? 0 : selectedIndex}
            onSelect={(index) => {
              const option = appearanceOptions[index];
              if (option) {
                setPreference(option.id);
              }
            }}
          />
        </NivvaCard>

        <SectionTitle>Dados</SectionTitle>
        <NivvaCard>
          <NivvaText variant="bodyMedium">
            {isLocal ? "Modo demonstração local" : "Dados salvos na sua conta"}
          </NivvaText>
        </NivvaCard>

        {user ? (
          <>
            <SectionTitle>Conta e segurança</SectionTitle>
            <NivvaCard>
              <NivvaText variant="bodyMedium" tone="secondary">
                Sua sessão é protegida no dispositivo.
              </NivvaText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sair da conta"
                onPress={() => {
                  void auth?.logout();
                }}
                style={{
                  marginTop: theme.spacing.md,
                  minHeight: theme.layout.touchTarget,
                  justifyContent: "center",
                }}
              >
                <NivvaText variant="label" tone="expense">
                  Sair da conta
                </NivvaText>
              </Pressable>
            </NivvaCard>
          </>
        ) : null}

        <SectionTitle>Sobre o Nivva</SectionTitle>
        <NivvaCard>
          <NivvaText variant="bodyMedium" tone="secondary">
            Versão {version}
          </NivvaText>
        </NivvaCard>
      </ScrollView>
    </ScreenContainer>
  );
}

function SectionTitle({ children }: { children: string }) {
  const theme = useNivvaTheme();

  return (
    <NivvaText variant="title" accessibilityRole="header" style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
      {children}
    </NivvaText>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <NivvaText variant="headingMedium">{value}</NivvaText>
      <NivvaText variant="caption" tone="secondary">
        {label}
      </NivvaText>
    </View>
  );
}
