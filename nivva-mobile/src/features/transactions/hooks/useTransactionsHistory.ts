import { useCallback, useMemo, useState } from "react";

import { useFinance } from "@/features/finance";

import {
  queryTransactions,
  type TransactionTypeFilter,
} from "../utils/transaction-history";

export function useTransactionsHistory() {
  const { transactions, categories, referenceDate } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>("all");
  const [categoryId, setCategoryId] = useState<string | "all">("all");

  const result = useMemo(
    () =>
      queryTransactions({
        transactions,
        categories,
        searchQuery,
        typeFilter,
        categoryId,
        referenceDate,
      }),
    [transactions, categories, searchQuery, typeFilter, categoryId, referenceDate],
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTypeFilter("all");
    setCategoryId("all");
  }, []);

  return {
    ...result,
    categories,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    categoryId,
    setCategoryId,
    clearFilters,
  };
}
