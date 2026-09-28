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
  const budgetLimitCents = budget.getEffectiveLimit(budgetPeriod, finance.referenceDate).cents;

  return useMemo(
    () =>
      buildAnalyticsSnapshot(
        {
          transactions: finance.transactions,
          accounts: finance.accounts,
          categories: finance.categories,
          budgetLimitCents,
          referenceDate: finance.referenceDate,
        },
        period,
      ),
    [budgetLimitCents, finance.accounts, finance.categories, finance.referenceDate, finance.transactions, period],
  );
}
