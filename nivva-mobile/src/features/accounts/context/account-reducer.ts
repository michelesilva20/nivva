import type { Account } from "@/domain/models";

export type AccountLoadStatus = "loading" | "ready" | "error";

export type AccountState = {
  accounts: Account[];
  notice: string | null;
  loadStatus: AccountLoadStatus;
};

export type AccountAction =
  | { type: "hydrate"; accounts: Account[] }
  | { type: "hydrate-failed" }
  | { type: "reload" }
  | { type: "add"; account: Account }
  | { type: "replace"; account: Account }
  | { type: "remove"; id: string }
  | { type: "set-notice"; notice: string | null };

export const initialAccountState: AccountState = {
  accounts: [],
  notice: null,
  loadStatus: "loading",
};

export function accountReducer(state: AccountState, action: AccountAction): AccountState {
  if (action.type === "reload") {
    return { ...state, loadStatus: "loading" };
  }

  if (action.type === "hydrate") {
    return { ...state, accounts: action.accounts, loadStatus: "ready" };
  }

  if (action.type === "hydrate-failed") {
    return { ...state, loadStatus: "error" };
  }

  if (action.type === "add") {
    return { ...state, accounts: [...state.accounts, action.account], notice: "Conta criada" };
  }

  if (action.type === "replace") {
    if (!state.accounts.some((account) => account.id === action.account.id)) {
      return state;
    }

    return {
      ...state,
      notice: "Conta atualizada",
      accounts: state.accounts.map((account) => (account.id === action.account.id ? action.account : account)),
    };
  }

  if (action.type === "remove") {
    if (!state.accounts.some((account) => account.id === action.id)) {
      return state;
    }

    return {
      ...state,
      notice: "Conta excluída",
      accounts: state.accounts.filter((account) => account.id !== action.id),
    };
  }

  return { ...state, notice: action.notice };
}
