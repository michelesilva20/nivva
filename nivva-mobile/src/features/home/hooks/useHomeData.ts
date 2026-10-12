import { useMemo } from "react";

import { getTransactionSource } from "@/data/repositories/active-transaction-repository";
import { useOptionalAuth } from "@/features/auth/context/AuthProvider";
import { useBudget } from "@/features/budget";
import { getCurrentBudgetPeriod } from "@/features/budget/calculations/budget-calculations";
import { useFinance } from "@/features/finance";
import { buildHomeSnapshot } from "@/features/finance/snapshots";
import { initialsFromDisplayName, LOCAL_DEMO_DISPLAY_NAME } from "@/shared/utils/initials";

export function useHomeData() {
  const finance = useFinance();
  const budget = useBudget();
  const auth = useOptionalAuth();
  const source = getTransactionSource();
  const period = getCurrentBudgetPeriod(finance.referenceDate);
  const displayLimit = budget.getDisplayLimit(period, finance.referenceDate);
  const copyMode = source === "local" ? "demo" : "live";

  const snapshot = useMemo(
    () =>
      buildHomeSnapshot({
        transactions: finance.transactions,
        accounts: finance.accounts,
        categories: finance.categories,
        budgetLimitCents: displayLimit?.cents ?? null,
        referenceDate: finance.referenceDate,
        copyMode,
      }),
    [copyMode, displayLimit?.cents, finance.accounts, finance.categories, finance.referenceDate, finance.transactions],
  );

  const profileInitials =
    initialsFromDisplayName(auth?.user?.displayName) ??
    (source === "local" ? initialsFromDisplayName(LOCAL_DEMO_DISPLAY_NAME) : null) ??
    "";

  return {
    ...snapshot,
    profileInitials,
    budgetConfigured: budget.isConfigured(period, finance.referenceDate),
    budgetLoadStatus: budget.loadStatus,
  };
}
