import { useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NivvaText, useNivvaTheme } from "@/core/design-system";
import { useBudget } from "@/features/budget";
import { useFinance } from "@/features/finance";
import { useGoals } from "@/features/goals";

export function NivvaNotice() {
  const theme = useNivvaTheme();
  const insets = useSafeAreaInsets();
  const finance = useFinance();
  const goals = useGoals();
  const budget = useBudget();
  const notice = finance.notice ?? goals.notice ?? budget.notice;
  const clearNotice = finance.notice ? finance.clearNotice : goals.notice ? goals.clearNotice : budget.clearNotice;

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(clearNotice, 3200);
    return () => clearTimeout(timeout);
  }, [notice, clearNotice]);

  if (!notice) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={{
        position: "absolute",
        top: insets.top + theme.spacing.sm,
        left: theme.spacing.md,
        right: theme.spacing.md,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: theme.layout.touchTarget,
        justifyContent: "center",
        zIndex: 100,
        elevation: 8,
      }}
    >
      <NivvaText variant="titleSmall" tone="inverse">
        {notice}
      </NivvaText>
    </View>
  );
}
