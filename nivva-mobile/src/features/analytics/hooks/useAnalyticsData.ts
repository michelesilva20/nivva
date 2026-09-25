import { useMemo } from "react";

import type { AnalyticsPeriod } from "@/domain/models";
import { useFinance } from "@/features/finance";
import { buildAnalyticsSnapshot } from "@/features/finance/snapshots";

export function useAnalyticsData(period: AnalyticsPeriod) {
  const finance = useFinance();

  return useMemo(
    () =>
      buildAnalyticsSnapshot(
        {
          transactions: finance.transactions,
          accounts: finance.accounts,
          categories: finance.categories,
          budgetTotalCents: finance.budgetTotalCents,
          referenceDate: finance.referenceDate,
        },
        period,
      ),
    [
      finance.accounts,
      finance.budgetTotalCents,
      finance.categories,
      finance.referenceDate,
      finance.transactions,
      period,
    ],
  );
}
