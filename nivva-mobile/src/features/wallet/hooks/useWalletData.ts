import { useMemo } from "react";

import { useFinance } from "@/features/finance";
import { buildWalletSnapshot } from "@/features/finance/snapshots";

export function useWalletData() {
  const finance = useFinance();

  return useMemo(
    () =>
      buildWalletSnapshot({
        transactions: finance.transactions,
        accounts: finance.accounts,
        categories: finance.categories,
        budgetTotalCents: finance.budgetTotalCents,
        referenceDate: finance.referenceDate,
      }),
    [finance.accounts, finance.budgetTotalCents, finance.categories, finance.referenceDate, finance.transactions],
  );
}
