import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SectionList,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  NivvaIcon,
  NivvaScreenHeader,
  NivvaSegmentedControl,
  NivvaText,
  NivvaTransactionItem,
  ScreenContainer,
  useNivvaTheme,
} from "@/core/design-system";
import { findCategory } from "@/data/mock/categories";
import { withAlpha } from "@/shared/utils/color";

import { useTransactionsHistory } from "../hooks/useTransactionsHistory";
import type { TransactionTypeFilter } from "../utils/transaction-history";

const typeFilters: { id: TransactionTypeFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "expense", label: "Despesas" },
  { id: "income", label: "Receitas" },
];

export function TransactionsScreen() {
  const theme = useNivvaTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ focusSearch?: string | string[] }>();
  const searchRef = useRef<TextInput>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const history = useTransactionsHistory();
  const selectedTypeIndex = typeFilters.findIndex((item) => item.id === history.typeFilter);
  const selectedCategory =
    history.categoryId === "all" ? undefined : findCategory(history.categoryId);
  const focusSearch = readFlag(params.focusSearch);

  useEffect(() => {
    if (focusSearch) {
      const timeout = setTimeout(() => searchRef.current?.focus(), 80);
      return () => clearTimeout(timeout);
    }
  }, [focusSearch]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ paddingHorizontal: theme.spacing.md }}>
          <NivvaScreenHeader title="Transações" onBackPress={() => router.back()} />
          <View
            style={{
              marginTop: theme.spacing.sm,
              minHeight: theme.layout.touchTarget,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <NivvaIcon name="search" color={theme.colors.textMuted} size={20} />
            <TextInput
              ref={searchRef}
              accessibilityLabel="Buscar transações"
              placeholder="Buscar transações"
              placeholderTextColor={theme.colors.textMuted}
              value={history.searchQuery}
              onChangeText={history.setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
              style={{
                flex: 1,
                minHeight: theme.layout.touchTarget,
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.bodyLarge.fontFamily,
                fontSize: theme.typography.bodyLarge.fontSize,
              }}
            />
            {history.searchQuery.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
                onPress={() => history.setSearchQuery("")}
                hitSlop={8}
                style={{
                  width: theme.layout.touchTarget,
                  height: theme.layout.touchTarget,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NivvaIcon name="close" color={theme.colors.textSecondary} size={20} />
              </Pressable>
            ) : null}
          </View>

          <View style={{ marginTop: theme.spacing.sm }}>
            <NivvaSegmentedControl
              items={typeFilters.map((item) => item.label)}
              selectedIndex={Math.max(0, selectedTypeIndex)}
              onSelect={(index) => {
                const next = typeFilters[index];
                if (next) {
                  history.setTypeFilter(next.id);
                }
              }}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              selectedCategory ? `Categoria ${selectedCategory.name}` : "Todas as categorias"
            }
            onPress={() => setCategoryOpen(true)}
            style={{
              marginTop: theme.spacing.sm,
              minHeight: theme.layout.touchTarget,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <NivvaText tone={selectedCategory ? "primary" : "muted"}>
              {selectedCategory ? selectedCategory.name : "Todas as categorias"}
            </NivvaText>
            <NivvaIcon name="expand-more" color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <SectionList
          sections={history.sections}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          stickySectionHeadersEnabled
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.xl,
            flexGrow: 1,
          }}
          renderSectionHeader={({ section }) => (
            <View
              style={{
                paddingTop: theme.spacing.md,
                paddingBottom: theme.spacing.xs,
                backgroundColor: theme.colors.background,
              }}
            >
              <NivvaText variant="labelMedium" tone="secondary">
                {section.title}
              </NivvaText>
            </View>
          )}
          renderItem={({ item }) => (
            <NivvaTransactionItem
              transaction={item}
              category={findCategory(item.categoryId)}
              onPress={() => router.push(`/transactions/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyHistory
              hasTransactions={history.totalCount > 0}
              onClearFilters={history.hasActiveFilters ? history.clearFilters : undefined}
            />
          }
        />
      </KeyboardAvoidingView>

      <Modal
        visible={categoryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryOpen(false)}
      >
        <Pressable
          onPress={() => setCategoryOpen(false)}
          style={{ flex: 1, backgroundColor: withAlpha(theme.colors.shadow, 0.45), justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.md,
              paddingBottom: theme.spacing.xl,
            }}
          >
            <NivvaText variant="title" style={{ marginBottom: theme.spacing.sm }}>
              Categoria
            </NivvaText>
            <CategoryOption
              label="Todas as categorias"
              selected={history.categoryId === "all"}
              onPress={() => {
                history.setCategoryId("all");
                setCategoryOpen(false);
              }}
            />
            {history.categories.map((category) => (
              <CategoryOption
                key={category.id}
                label={category.name}
                selected={history.categoryId === category.id}
                onPress={() => {
                  history.setCategoryId(category.id);
                  setCategoryOpen(false);
                }}
              />
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

function CategoryOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useNivvaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: theme.layout.touchTarget,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <NivvaText variant="titleSmall" tone={selected ? "brand" : "primary"}>
        {label}
      </NivvaText>
      {selected ? <NivvaIcon name="check" color={theme.colors.primary} size={20} /> : null}
    </Pressable>
  );
}

function EmptyHistory({
  hasTransactions,
  onClearFilters,
}: {
  hasTransactions: boolean;
  onClearFilters?: () => void;
}) {
  const theme = useNivvaTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.huge,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NivvaIcon
          name={hasTransactions ? "search" : "receipt"}
          color={theme.colors.primary}
          size={34}
        />
      </View>
      <NivvaText variant="headingMedium" style={{ marginTop: theme.spacing.lg, textAlign: "center" }}>
        {hasTransactions ? "Nenhuma transação encontrada" : "Nenhuma transação ainda"}
      </NivvaText>
      <NivvaText
        variant="bodyLarge"
        tone="secondary"
        style={{ marginTop: theme.spacing.xs, textAlign: "center" }}
      >
        {hasTransactions
          ? "Tente alterar sua busca ou os filtros."
          : "Quando você adicionar receitas ou despesas, elas aparecerão aqui."}
      </NivvaText>
      {onClearFilters ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar filtros"
          onPress={onClearFilters}
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
            Limpar filtros
          </NivvaText>
        </Pressable>
      ) : null}
    </View>
  );
}

function readFlag(value: string | string[] | undefined): boolean {
  const flag = Array.isArray(value) ? value[0] : value;
  return flag === "true";
}
