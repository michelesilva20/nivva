import type { Transaction } from "@/domain/models";

export type FinanceState = {
  userTransactions: Transaction[];
  notice: string | null;
  isHydrated: boolean;
};

export type FinanceAction =
  | { type: "hydrate"; transactions: Transaction[] }
  | { type: "add-user-transaction"; transaction: Transaction }
  | { type: "replace-user-transaction"; transaction: Transaction }
  | { type: "remove-user-transaction"; id: string }
  | { type: "clear-notice" };

export function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  if (action.type === "hydrate") {
    return {
      ...state,
      userTransactions: action.transactions,
      isHydrated: true,
    };
  }

  if (action.type === "clear-notice") {
    return { ...state, notice: null };
  }

  if (action.type === "replace-user-transaction") {
    if (!state.userTransactions.some((transaction) => transaction.id === action.transaction.id)) {
      return state;
    }

    return {
      notice: "Transação atualizada",
      userTransactions: state.userTransactions.map((transaction) =>
        transaction.id === action.transaction.id ? action.transaction : transaction,
      ),
      isHydrated: state.isHydrated,
    };
  }

  if (action.type === "remove-user-transaction") {
    if (!state.userTransactions.some((transaction) => transaction.id === action.id)) {
      return state;
    }

    return {
      notice: "Transação excluída",
      userTransactions: state.userTransactions.filter((transaction) => transaction.id !== action.id),
      isHydrated: state.isHydrated,
    };
  }

  return {
    notice: action.transaction.type === "income" ? "Receita adicionada" : "Gasto adicionado",
    userTransactions: [action.transaction, ...state.userTransactions],
    isHydrated: state.isHydrated,
  };
}
