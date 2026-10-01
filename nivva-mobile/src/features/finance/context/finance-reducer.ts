import type { Transaction } from "@/domain/models";

export type FinanceLoadStatus = "loading" | "ready" | "error";
export type FinanceNoticeTone = "success" | "error";

export type FinanceState = {
  userTransactions: Transaction[];
  notice: string | null;
  noticeTone: FinanceNoticeTone;
  loadStatus: FinanceLoadStatus;
};

export type FinanceAction =
  | { type: "hydrate"; transactions: Transaction[] }
  | { type: "hydrate-failed" }
  | { type: "reload" }
  | { type: "add-user-transaction"; transaction: Transaction }
  | { type: "replace-user-transaction"; transaction: Transaction }
  | { type: "remove-user-transaction"; id: string }
  | { type: "set-notice"; notice: string; tone?: FinanceNoticeTone }
  | { type: "clear-notice" };

export const initialFinanceState: FinanceState = {
  userTransactions: [],
  notice: null,
  noticeTone: "success",
  loadStatus: "loading",
};

export function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  if (action.type === "reload") {
    return { ...state, loadStatus: "loading" };
  }

  if (action.type === "hydrate") {
    return {
      ...state,
      userTransactions: action.transactions,
      loadStatus: "ready",
    };
  }

  if (action.type === "hydrate-failed") {
    return {
      ...state,
      loadStatus: "error",
    };
  }

  if (action.type === "clear-notice") {
    return { ...state, notice: null };
  }

  if (action.type === "set-notice") {
    return { ...state, notice: action.notice, noticeTone: action.tone ?? "success" };
  }

  if (action.type === "replace-user-transaction") {
    if (!state.userTransactions.some((transaction) => transaction.id === action.transaction.id)) {
      return state;
    }

    return {
      ...state,
      notice: "Transação atualizada",
      noticeTone: "success",
      userTransactions: state.userTransactions.map((transaction) =>
        transaction.id === action.transaction.id ? action.transaction : transaction,
      ),
    };
  }

  if (action.type === "remove-user-transaction") {
    if (!state.userTransactions.some((transaction) => transaction.id === action.id)) {
      return state;
    }

    return {
      ...state,
      notice: "Transação excluída",
      noticeTone: "success",
      userTransactions: state.userTransactions.filter((transaction) => transaction.id !== action.id),
    };
  }

  return {
    ...state,
    notice: action.transaction.type === "income" ? "Receita adicionada" : "Gasto adicionado",
    noticeTone: "success",
    userTransactions: [action.transaction, ...state.userTransactions],
  };
}
