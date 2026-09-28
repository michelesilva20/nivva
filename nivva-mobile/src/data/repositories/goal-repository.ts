import type { Goal, GoalContribution } from "@/domain/models";

import { parseGoals, serializeGoals, type GoalStore } from "./stored-goals";

export type GoalRepository = {
  load(): Promise<GoalStore>;
  save(store: GoalStore): Promise<void>;
  clear(): Promise<void>;
};

export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export const GOALS_STORAGE_KEY = "@nivva/goals:v1";

export function createGoalRepository(storage: KeyValueStorage): GoalRepository {
  return {
    async load() {
      try {
        const raw = await storage.getItem(GOALS_STORAGE_KEY);
        return parseGoals(raw);
      } catch (error) {
        console.warn("[nivva] falha ao ler metas locais; usando estado inicial", error);
        return { goals: [] as Goal[], contributions: [] as GoalContribution[] };
      }
    },

    async save(store) {
      await storage.setItem(GOALS_STORAGE_KEY, serializeGoals(store));
    },

    async clear() {
      await storage.removeItem(GOALS_STORAGE_KEY);
    },
  };
}
