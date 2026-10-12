import type { MonthlyBudget } from "@/domain/models";

import { parseBudgets, serializeBudgets, type BudgetStore } from "./stored-budgets";

export type BudgetRepository = {
  load(): Promise<BudgetStore>;
  save(store: BudgetStore): Promise<void>;
  clear(): Promise<void>;
};

export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export const BUDGETS_STORAGE_KEY = "@nivva/budgets:v1";

export function budgetsStorageKey(userId?: string | null): string {
  if (userId) {
    return `@nivva/budgets:user:${userId}:v1`;
  }

  return BUDGETS_STORAGE_KEY;
}

export function createBudgetRepository(storage: KeyValueStorage, userId?: string | null): BudgetRepository {
  const key = budgetsStorageKey(userId);

  return {
    async load() {
      try {
        const raw = await storage.getItem(key);
        return parseBudgets(raw);
      } catch (error) {
        console.warn("[nivva] falha ao ler orçamentos locais; usando estado inicial", error);
        return { budgets: [] as MonthlyBudget[] };
      }
    },

    async save(store) {
      await storage.setItem(key, serializeBudgets(store));
    },

    async clear() {
      await storage.removeItem(key);
    },
  };
}
