import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";

import { accounts as seedAccounts } from "@/data/mock/accounts";
import { categories } from "@/data/mock/categories";
import { MONTHLY_BUDGET_CENTS, transactions as seedTransactions } from "@/data/mock/transactions";
import type { Account, Category, NewExpenseInput, Transaction } from "@/domain/models";

import { financeReducer } from "./finance-reducer";

type FinanceContextValue = {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgetTotalCents: number;
  referenceDate: Date;
  notice: string | null;
  addExpense: (input: NewExpenseInput) => void;
  clearNotice: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, {
    transactions: seedTransactions,
    accounts: seedAccounts,
    notice: null,
  });

  const addExpense = useCallback((input: NewExpenseInput) => {
    dispatch({ type: "add-expense", input });
  }, []);

  const clearNotice = useCallback(() => {
    dispatch({ type: "clear-notice" });
  }, []);

  const value = useMemo(
    () => ({
      transactions: state.transactions,
      accounts: state.accounts,
      categories,
      budgetTotalCents: MONTHLY_BUDGET_CENTS,
      referenceDate: new Date(),
      notice: state.notice,
      addExpense,
      clearNotice,
    }),
    [state.accounts, state.notice, state.transactions, addExpense, clearNotice],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance precisa estar dentro de FinanceProvider");
  }

  return context;
}
