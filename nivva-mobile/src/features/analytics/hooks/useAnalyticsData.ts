import { useMemo } from "react";

import type { AnalyticsPeriod } from "@/domain/models";
import { useBudget } from "@/features/budget";
import { getCurrentBudgetPeriod } from "@/features/budget/calculations/budget-calculations";
import { useFinance } from "@/features/finance";
import { buildAnalyticsSnapshot } from "@/features/finance/snapshots";

export function useAnalyticsData(period: AnalyticsPeriod) {
  const finance = useFinance();
  const budget = useBudget();
  const budgetPeriod = getCurrentBudgetPeriod(finance.referenceDate);
  const displayLimit = budget.getDisplayLimit(budgetPeriod, finance.referenceDate);

  const snapshot = useMemo(
    () =>
      buildAnalyticsSnapshot(
        {
          transactions: finance.transactions,
          accounts: finance.accounts,
          categories: finance.categories,
          budgetLimitCents: displayLimit?.cents ?? null,
          referenceDate: finance.referenceDate,
        },
        period,
      ),
    [displayLimit?.cents, finance.accounts, finance.categories, finance.referenceDate, finance.transactions, period],
  );

  return {
    ...snapshot,
    budgetConfigured: budget.isConfigured(budgetPeriod, finance.referenceDate),
    budgetLoadStatus: budget.loadStatus,
  };
}
