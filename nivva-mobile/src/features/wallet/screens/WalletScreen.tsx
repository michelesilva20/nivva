import { useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import {
  NivvaAmount,
  NivvaCard,
  NivvaIcon,
  NivvaQuickAction,
  NivvaScreenHeader,
  NivvaSectionHeader,
  NivvaSegmentedControl,
  NivvaText,
  NivvaTransactionItem,
  ScreenContainer,
  useNivvaTheme,
} from "@/core/design-system";
import { findCategory } from "@/data/mock/categories";
import type { WalletSegment } from "@/domain/models";
import { formatCurrency } from "@/shared/utils/format";
import { withAlpha } from "@/shared/utils/color";

import { useAccounts } from "@/features/accounts";

import { useWalletData } from "../hooks/useWalletData";

const segments: { id: WalletSegment; label: string }[] = [
  { id: "accounts", label: "Contas" },
  { id: "cards", label: "Cartões" },
  { id: "investments", label: "Investimentos" },
];

export function WalletScreen() {
  const theme = useNivvaTheme();
  const router = useRouter();
  const wallet = useWalletData();
  const { canMutate } = useAccounts();
  const { width } = useWindowDimensions();
  const [segment, setSegment] = useState<WalletSegment>("accounts");
  const [selectedAccount, setSelectedAccount] = useState(0);
  const selectedIndex = segments.findIndex((item) => item.id === segment);
  const cardWidth = Math.min(width, theme.layout.contentMaxWidth) - theme.spacing.md * 2 - theme.spacing.xl;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: theme.spacing.md }}>
          <NivvaScreenHeader
            title="Carteira"
            actionIcon="add"
            actionLabel="Adicionar conta"
            onActionPress={canMutate ? () => router.push("/accounts/new") : undefined}
          />
          <NivvaSegmentedControl
            items={segments.map((item) => item.label)}
            selectedIndex={selectedIndex}
            onSelect={(index) => {
              const next = segments[index];
              if (next) {
                setSegment(next.id);
              }
            }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={cardWidth + theme.spacing.sm}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.md,
            gap: theme.spacing.sm,
            marginTop: theme.spacing.sm,
          }}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + theme.spacing.sm));
            const next = Math.min(Math.max(index, 0), wallet.accounts.length - 1);
            setSelectedAccount(next);
          }}
        >
          {wallet.accounts.length === 0 ? (
            <View
              style={{
                width: cardWidth,
                minHeight: theme.layout.accountCardHeight,
                borderRadius: theme.radius.xl,
                padding: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                justifyContent: "center",
              }}
            >
              <NivvaText variant="title">Nenhuma conta cadastrada.</NivvaText>
              {canMutate ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Adicionar conta"
                  onPress={() => router.push("/accounts/new")}
                  style={{ marginTop: theme.spacing.md }}
                >
                  <NivvaText variant="label">Adicionar conta</NivvaText>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {wallet.accounts.map((account) => (
            <Pressable
              key={account.id}
              accessibilityRole="button"
              accessibilityLabel={`${account.name}, ${account.typeLabel}, saldo ${formatCurrency(account.balance)}`}
              onPress={canMutate ? () => router.push(`/accounts/${account.id}/edit`) : undefined}
            >
              <LinearGradient
                colors={theme.colors.accountGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: cardWidth,
                  height: theme.layout.accountCardHeight,
                  borderRadius: theme.radius.xl,
                  padding: theme.spacing.lg,
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                      <NivvaText variant="title" tone="onHero">
                        {account.name}
                      </NivvaText>
                      <NivvaText variant="bodySmall" tone="onHero" style={{ opacity: 0.7 }}>
                        {account.typeLabel}
                      </NivvaText>
                    </View>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: theme.radius.pill,
                        backgroundColor: withAlpha(theme.colors.onHero, 0.14),
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <NivvaIcon name="account-balance" color={theme.colors.onHero} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }} />
                  <NivvaAmount amount={account.balance} size="large" tone="onHero" />
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>

        <View
          accessibilityLabel={`Conta ${selectedAccount + 1} de ${wallet.accounts.length}`}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            paddingVertical: theme.spacing.xs,
            gap: 6,
          }}
        >
          {wallet.accounts.map((account, index) => (
            <View
              key={account.id}
              style={{
                width: index === selectedAccount ? 7 : 5,
                height: index === selectedAccount ? 7 : 5,
                borderRadius: theme.radius.pill,
                backgroundColor: index === selectedAccount ? theme.colors.primary : theme.colors.textMuted,
              }}
            />
          ))}
        </View>

        <View style={{ paddingHorizontal: theme.spacing.md }}>
          <NivvaCard>
            <View style={{ flexDirection: "row" }}>
              <NivvaQuickAction
                label={"Adicionar\ngasto"}
                icon="add"
                onPress={() => router.push("/transactions/new-expense")}
              />
              <NivvaQuickAction
                label="Transferir"
                icon="swap-horiz"
                tint={theme.colors.actionTransfer}
                onPress={() => undefined}
              />
              <NivvaQuickAction label={"Pagar\ncom QR"} icon="qr-code-scanner" onPress={() => undefined} />
              <NivvaQuickAction
                label="Mais"
                icon="more-horiz"
                tint={theme.colors.textSecondary}
                onPress={() => undefined}
              />
            </View>
          </NivvaCard>

          <NivvaSectionHeader title="Histórico" />
          <View style={{ minHeight: theme.layout.touchTarget, flexDirection: "row", alignItems: "center" }}>
            <NivvaText variant="bodySmall" tone="secondary" style={{ flex: 1 }}>
              {wallet.historyLabel}
            </NivvaText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Buscar no histórico"
              onPress={() => router.push("/transactions?focusSearch=true")}
              hitSlop={8}
              style={{
                width: theme.layout.touchTarget,
                height: theme.layout.touchTarget,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NivvaIcon name="search" color={theme.colors.textPrimary} />
            </Pressable>
          </View>
          {wallet.transactions.map((transaction) => (
            <NivvaTransactionItem
              key={transaction.id}
              transaction={transaction}
              category={findCategory(transaction.categoryId)}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
