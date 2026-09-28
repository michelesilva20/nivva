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

export function createBudgetRepository(storage: KeyValueStorage): BudgetRepository {
  return {
    async load() {
      try {
        const raw = await storage.getItem(BUDGETS_STORAGE_KEY);
        return parseBudgets(raw);
      } catch (error) {
        console.warn("[nivva] falha ao ler orçamentos locais; usando estado inicial", error);
        return { budgets: [] as MonthlyBudget[] };
      }
    },

    async save(store) {
      await storage.setItem(BUDGETS_STORAGE_KEY, serializeBudgets(store));
    },

    async clear() {
      await storage.removeItem(BUDGETS_STORAGE_KEY);
    },
  };
}
