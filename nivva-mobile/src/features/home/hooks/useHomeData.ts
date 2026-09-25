import { useMemo } from "react";

import { useFinance } from "@/features/finance";
import { buildHomeSnapshot } from "@/features/finance/snapshots";

export function useHomeData() {
  const finance = useFinance();

  return useMemo(
    () =>
      buildHomeSnapshot({
        transactions: finance.transactions,
        accounts: finance.accounts,
        categories: finance.categories,
        budgetTotalCents: finance.budgetTotalCents,
        referenceDate: finance.referenceDate,
      }),
    [finance.accounts, finance.budgetTotalCents, finance.categories, finance.referenceDate, finance.transactions],
  );
}
