import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { getTransactionSource } from "@/data/repositories/active-transaction-repository";
import { activeTransactionRepository } from "@/data/repositories/active-transaction-repository";
import type { TransactionRepository } from "@/data/repositories/transaction-repository";
import { categories } from "@/data/mock/categories";
import { transactions as seedTransactions } from "@/data/mock/transactions";
import type { AccountView, Category, NewExpenseInput, NewIncomeInput, Transaction } from "@/domain/models";
import { useAccounts } from "@/features/accounts";
import { deriveAccountViews } from "@/features/finance/calculations/calculations";
import {
  isUserOwnedTransaction,
  resolveDisplayedTransactions,
  toCreateExpenseInput,
  toCreateIncomeInput,
} from "@/features/finance/persistence/local-finance";

import { financeReducer, initialFinanceState, type FinanceLoadStatus, type FinanceNoticeTone } from "./finance-reducer";

type FinanceContextValue = {
  transactions: Transaction[];
  accounts: AccountView[];
  categories: Category[];
  referenceDate: Date;
  notice: string | null;
  noticeTone: FinanceNoticeTone;
  loadStatus: FinanceLoadStatus;
  addExpense: (input: NewExpenseInput) => Promise<void>;
  addIncome: (input: NewIncomeInput) => Promise<void>;
  updateUserTransaction: (transaction: Transaction) => Promise<void>;
  deleteUserTransaction: (id: string) => Promise<void>;
  reloadTransactions: () => Promise<void>;
  isUserTransaction: (id: string) => boolean;
  clearNotice: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

function toUserMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Não foi possível concluir. Tente novamente.";
}

export function FinanceProvider({
  children,
  repository = activeTransactionRepository,
}: {
  children: ReactNode;
  repository?: TransactionRepository;
}) {
  const source = getTransactionSource();
  const { accounts: rawAccounts } = useAccounts();
  const [state, dispatch] = useReducer(financeReducer, initialFinanceState);

  const loadTransactions = useCallback(async () => {
    try {
      const transactions = await repository.list();
      dispatch({ type: "hydrate", transactions });
    } catch (error) {
      console.warn("[nivva] falha ao carregar transações", error);
      dispatch({ type: "hydrate-failed" });
    }
  }, [repository]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const reloadTransactions = useCallback(async () => {
    dispatch({ type: "reload" });
    await loadTransactions();
  }, [loadTransactions]);

  const addExpense = useCallback(
    async (input: NewExpenseInput) => {
      try {
        const created = await repository.create(toCreateExpenseInput(input));
        dispatch({ type: "add-user-transaction", transaction: created });
      } catch (error) {
        dispatch({ type: "set-notice", notice: toUserMessage(error), tone: "error" });
        throw error;
      }
    },
    [repository],
  );

  const addIncome = useCallback(
    async (input: NewIncomeInput) => {
      try {
        const created = await repository.create(toCreateIncomeInput(input));
        dispatch({ type: "add-user-transaction", transaction: created });
      } catch (error) {
        dispatch({ type: "set-notice", notice: toUserMessage(error), tone: "error" });
        throw error;
      }
    },
    [repository],
  );

  const updateUserTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!isUserOwnedTransaction(state.userTransactions, transaction.id)) {
        console.warn("[nivva] lançamento de demonstração não pode ser editado");
        return;
      }

      try {
        const updated = await repository.update(transaction);
        dispatch({ type: "replace-user-transaction", transaction: updated });
      } catch (error) {
        dispatch({ type: "set-notice", notice: toUserMessage(error), tone: "error" });
        throw error;
      }
    },
    [repository, state.userTransactions],
  );

  const deleteUserTransaction = useCallback(
    async (id: string) => {
      if (!isUserOwnedTransaction(state.userTransactions, id)) {
        console.warn("[nivva] lançamento de demonstração não pode ser excluído");
        return;
      }

      try {
        await repository.remove(id);
        dispatch({ type: "remove-user-transaction", id });
      } catch (error) {
        dispatch({ type: "set-notice", notice: toUserMessage(error), tone: "error" });
        throw error;
      }
    },
    [repository, state.userTransactions],
  );

  const isUserTransaction = useCallback(
    (id: string) => isUserOwnedTransaction(state.userTransactions, id),
    [state.userTransactions],
  );

  const clearNotice = useCallback(() => {
    dispatch({ type: "clear-notice" });
  }, []);

  const transactions = useMemo(
    () => resolveDisplayedTransactions(source, seedTransactions, state.userTransactions),
    [source, state.userTransactions],
  );

  const accounts = useMemo(
    () => deriveAccountViews(rawAccounts, state.userTransactions),
    [rawAccounts, state.userTransactions],
  );

  const value = useMemo(
    () => ({
      transactions,
      accounts,
      categories,
      referenceDate: new Date(),
      notice: state.notice,
      noticeTone: state.noticeTone,
      loadStatus: state.loadStatus,
      addExpense,
      addIncome,
      updateUserTransaction,
      deleteUserTransaction,
      reloadTransactions,
      isUserTransaction,
      clearNotice,
    }),
    [
      accounts,
      transactions,
      state.notice,
      state.noticeTone,
      state.loadStatus,
      addExpense,
      addIncome,
      updateUserTransaction,
      deleteUserTransaction,
      reloadTransactions,
      isUserTransaction,
      clearNotice,
    ],
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
