import { useMemo } from "react";

import { useBudget } from "@/features/budget";
import { getCurrentBudgetPeriod } from "@/features/budget/calculations/budget-calculations";
import { useFinance } from "@/features/finance";
import { buildHomeSnapshot } from "@/features/finance/snapshots";

export function useHomeData() {
  const finance = useFinance();
  const budget = useBudget();
  const period = getCurrentBudgetPeriod(finance.referenceDate);
  const budgetLimitCents = budget.getEffectiveLimit(period, finance.referenceDate).cents;

  return useMemo(
    () =>
      buildHomeSnapshot({
        transactions: finance.transactions,
        accounts: finance.accounts,
        categories: finance.categories,
        budgetLimitCents,
        referenceDate: finance.referenceDate,
      }),
    [budgetLimitCents, finance.accounts, finance.categories, finance.referenceDate, finance.transactions],
  );
}
