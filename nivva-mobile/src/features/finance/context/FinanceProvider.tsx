import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { View } from "react-native";

import { useTheme } from "@/core/design-system";
import { accounts as seedAccounts } from "@/data/mock/accounts";
import { categories } from "@/data/mock/categories";
import { MONTHLY_BUDGET_CENTS, transactions as seedTransactions } from "@/data/mock/transactions";
import { localTransactionRepository } from "@/data/repositories/async-storage-transaction-repository";
import type { Account, Category, NewExpenseInput, NewIncomeInput, Transaction } from "@/domain/models";
import {
  applyUserTransactionsToAccounts,
  createUserExpense,
  createUserIncome,
  isUserOwnedTransaction,
  mergeSeedAndUserTransactions,
  removeUserTransaction,
  replaceUserTransaction,
} from "@/features/finance/persistence/local-finance";

import { financeReducer } from "./finance-reducer";

type FinanceContextValue = {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgetTotalCents: number;
  referenceDate: Date;
  notice: string | null;
  addExpense: (input: NewExpenseInput) => void;
  addIncome: (input: NewIncomeInput) => void;
  updateUserTransaction: (transaction: Transaction) => void;
  deleteUserTransaction: (id: string) => void;
  isUserTransaction: (id: string) => boolean;
  clearNotice: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [state, dispatch] = useReducer(financeReducer, {
    userTransactions: [],
    notice: null,
    isHydrated: false,
  });
  const userTransactionsRef = useRef(state.userTransactions);
  userTransactionsRef.current = state.userTransactions;

  useEffect(() => {
    let cancelled = false;

    localTransactionRepository.loadUserTransactions().then((transactions) => {
      if (!cancelled) {
        dispatch({ type: "hydrate", transactions });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persistUserTransaction = useCallback((transaction: Transaction) => {
    const next = [transaction, ...userTransactionsRef.current];
    userTransactionsRef.current = next;
    dispatch({ type: "add-user-transaction", transaction });
    void localTransactionRepository.saveUserTransactions(next).catch((error) => {
      console.warn("[nivva] falha ao persistir transações locais", error);
    });
  }, []);

  const addExpense = useCallback(
    (input: NewExpenseInput) => {
      persistUserTransaction(createUserExpense(input));
    },
    [persistUserTransaction],
  );

  const addIncome = useCallback(
    (input: NewIncomeInput) => {
      persistUserTransaction(createUserIncome(input));
    },
    [persistUserTransaction],
  );

  const persistList = useCallback((next: Transaction[]) => {
    userTransactionsRef.current = next;
    void localTransactionRepository.saveUserTransactions(next).catch((error) => {
      console.warn("[nivva] falha ao persistir transações locais", error);
    });
  }, []);

  const updateUserTransaction = useCallback(
    (transaction: Transaction) => {
      const next = replaceUserTransaction(userTransactionsRef.current, transaction);

      if (!next) {
        console.warn("[nivva] lançamento de demonstração não pode ser editado");
        return;
      }

      persistList(next);
      dispatch({ type: "replace-user-transaction", transaction });
    },
    [persistList],
  );

  const deleteUserTransaction = useCallback(
    (id: string) => {
      const next = removeUserTransaction(userTransactionsRef.current, id);

      if (!next) {
        console.warn("[nivva] lançamento de demonstração não pode ser excluído");
        return;
      }

      persistList(next);
      dispatch({ type: "remove-user-transaction", id });
    },
    [persistList],
  );

  const isUserTransaction = useCallback(
    (id: string) => isUserOwnedTransaction(state.userTransactions, id),
    [state.userTransactions],
  );

  const clearNotice = useCallback(() => {
    dispatch({ type: "clear-notice" });
  }, []);

  const transactions = useMemo(
    () => mergeSeedAndUserTransactions(seedTransactions, state.userTransactions),
    [state.userTransactions],
  );

  const accounts = useMemo(
    () => applyUserTransactionsToAccounts(seedAccounts, state.userTransactions),
    [state.userTransactions],
  );

  const value = useMemo(
    () => ({
      transactions,
      accounts,
      categories,
      budgetTotalCents: MONTHLY_BUDGET_CENTS,
      referenceDate: new Date(),
      notice: state.notice,
      addExpense,
      addIncome,
      updateUserTransaction,
      deleteUserTransaction,
      isUserTransaction,
      clearNotice,
    }),
    [
      accounts,
      transactions,
      state.notice,
      addExpense,
      addIncome,
      updateUserTransaction,
      deleteUserTransaction,
      isUserTransaction,
      clearNotice,
    ],
  );

  if (!state.isHydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance precisa estar dentro de FinanceProvider");
  }

  return context;
}
