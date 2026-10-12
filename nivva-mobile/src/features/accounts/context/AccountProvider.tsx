import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import type { AccountRepository } from "@/data/repositories/account-repository";
import { localAccountRepository } from "@/data/repositories/local-account-repository";
import type { Account, CreateAccountInput } from "@/domain/models";

import { accountReducer, initialAccountState, type AccountLoadStatus } from "./account-reducer";

type AccountContextValue = {
  accounts: Account[];
  loadStatus: AccountLoadStatus;
  notice: string | null;
  canMutate: boolean;
  addAccount: (input: CreateAccountInput) => Promise<Account>;
  updateAccount: (account: Account) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  reloadAccounts: () => Promise<void>;
  clearNotice: () => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

function toUserMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Não foi possível concluir. Tente novamente.";
}

export function AccountProvider({
  children,
  repository = localAccountRepository,
}: {
  children: ReactNode;
  repository?: AccountRepository;
}) {
  const [state, dispatch] = useReducer(accountReducer, initialAccountState);

  const loadAccounts = useCallback(async () => {
    try {
      const accounts = await repository.list();
      dispatch({ type: "hydrate", accounts });
    } catch (error) {
      console.warn("[nivva] falha ao carregar contas", error);
      dispatch({ type: "hydrate-failed" });
    }
  }, [repository]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const reloadAccounts = useCallback(async () => {
    dispatch({ type: "reload" });
    await loadAccounts();
  }, [loadAccounts]);

  const addAccount = useCallback(
    async (input: CreateAccountInput) => {
      try {
        const created = await repository.create(input);
        dispatch({ type: "add", account: created });
        return created;
      } catch (error) {
        dispatch({ type: "set-notice", notice: toUserMessage(error) });
        throw error;
      }
    },
    [repository],
  );

  const updateAccount = useCallback(
    async (account: Account) => {
      try {
        const updated = await repository.update(account);
        dispatch({ type: "replace", account: updated });
        return updated;
      } catch (error) {
        dispatch({ type: "set-notice", notice: toUserMessage(error) });
        throw error;
      }
    },
    [repository],
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      try {
        await repository.remove(id);
        dispatch({ type: "remove", id });
      } catch (error) {
        dispatch({ type: "set-notice", notice: toUserMessage(error) });
        throw error;
      }
    },
    [repository],
  );

  const clearNotice = useCallback(() => {
    dispatch({ type: "set-notice", notice: null });
  }, []);

  const value = useMemo(
    () => ({
      accounts: state.accounts,
      loadStatus: state.loadStatus,
      notice: state.notice,
      canMutate: repository.canMutate,
      addAccount,
      updateAccount,
      deleteAccount,
      reloadAccounts,
      clearNotice,
    }),
    [
      addAccount,
      deleteAccount,
      reloadAccounts,
      repository.canMutate,
      state.accounts,
      state.loadStatus,
      state.notice,
      updateAccount,
      clearNotice,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccounts(): AccountContextValue {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error("useAccounts precisa estar dentro de AccountProvider");
  }

  return context;
}
