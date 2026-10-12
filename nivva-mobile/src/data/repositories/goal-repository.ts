import type { Goal, GoalContribution, GoalEditInput, NewGoalInput } from "@/domain/models";
import type { GoalSnapshot } from "@/features/goals/calculations/goal-calculations";

import { parseGoals, serializeGoals, type GoalStore } from "./stored-goals";

export type ContributeGoalInput = {
  amountInCents: number;
  occurredAt: string;
  note?: string;
};

export type ContributeGoalResult = {
  contribution: GoalContribution;
  snapshot: GoalSnapshot;
};

export type GoalRepository = {
  list(): Promise<GoalSnapshot[]>;
  get(id: string): Promise<GoalSnapshot>;
  create(input: NewGoalInput): Promise<GoalSnapshot>;
  update(id: string, input: GoalEditInput): Promise<GoalSnapshot>;
  remove(id: string): Promise<void>;
  listContributions(goalId: string): Promise<GoalContribution[]>;
  contribute(goalId: string, input: ContributeGoalInput): Promise<ContributeGoalResult>;
};

export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export const GOALS_STORAGE_KEY = "@nivva/goals:v1";

export function goalsStorageKey(userId?: string | null): string {
  if (userId) {
    return `@nivva/goals:user:${userId}:v1`;
  }

  return GOALS_STORAGE_KEY;
}

export type GoalStoreRepository = {
  load(): Promise<GoalStore>;
  save(store: GoalStore): Promise<void>;
  clear(): Promise<void>;
};

export function createGoalStore(storage: KeyValueStorage, userId?: string | null): GoalStoreRepository {
  const key = goalsStorageKey(userId);

  return {
    async load() {
      try {
        const raw = await storage.getItem(key);
        return parseGoals(raw);
      } catch (error) {
        console.warn("[nivva] falha ao ler metas locais; usando estado inicial", error);
        return { goals: [] as Goal[], contributions: [] as GoalContribution[] };
      }
    },

    async save(store) {
      await storage.setItem(key, serializeGoals(store));
    },

    async clear() {
      await storage.removeItem(key);
    },
  };
}
