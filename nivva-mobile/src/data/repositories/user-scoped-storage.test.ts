import assert from "node:assert/strict";
import { test } from "node:test";

import { ApiError } from "@/data/api/api-error";
import { money, type MonthlyBudget } from "@/domain/models";

import { createApiGoalRepository } from "./api-goal-repository";
import { createBudgetRepository, budgetsStorageKey, BUDGETS_STORAGE_KEY } from "./budget-repository";
import { createGoalStore, goalsStorageKey, GOALS_STORAGE_KEY } from "./goal-repository";
import { createLocalGoalRepository } from "./local-goal-repository";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = { ...initial };
  return {
    async getItem(key: string) {
      return values[key] ?? null;
    },
    async setItem(key: string, value: string) {
      values[key] = value;
    },
    async removeItem(key: string) {
      delete values[key];
    },
    snapshot() {
      return values;
    },
  };
}

test("local mode preserva as chaves globais atuais", () => {
  assert.equal(goalsStorageKey(), GOALS_STORAGE_KEY);
  assert.equal(budgetsStorageKey(), BUDGETS_STORAGE_KEY);
  assert.equal(goalsStorageKey(null), GOALS_STORAGE_KEY);
});

test("API mode isola Budget por User UUID e ignora Goals locais antigas", async () => {
  const userA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const userB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  const leftoverKey = goalsStorageKey(userA);
  const storage = memoryStorage({
    [leftoverKey]: JSON.stringify({
      version: 1,
      goals: [{
        id: "goal-a",
        title: "Viagem A",
        targetAmount: { cents: 100_000 },
        iconKey: "other",
        createdAt: "2026-10-01T12:00:00.000Z",
      }],
      contributions: [],
    }),
  });

  const budgetA: MonthlyBudget = {
    id: "budget-a",
    period: "2026-10",
    limit: money(500_000),
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
  };

  const budgetsA = createBudgetRepository(storage, userA);
  await budgetsA.save({ budgets: [budgetA] });
  const budgetsB = createBudgetRepository(storage, userB);
  assert.deepEqual(await budgetsB.load(), { status: "missing", budgets: [] });

  const localGoals = createLocalGoalRepository(storage);
  assert.equal((await localGoals.list()).length, 0);
  assert.equal(storage.snapshot()[leftoverKey] != null, true);

  const reads: string[] = [];
  const apiGoals = createApiGoalRepository({
    request: async (path) => {
      reads.push(path);
      throw new ApiError({ message: "Não foi possível conectar ao Nivva." });
    },
  });
  await assert.rejects(() => apiGoals.list());
  assert.deepEqual(reads, ["/api/v1/goals"]);
  assert.equal(storage.snapshot()[leftoverKey] != null, true);
  assert.equal(storage.snapshot()[GOALS_STORAGE_KEY], undefined);
  assert.ok(storage.snapshot()[budgetsStorageKey(userA)]);
});

test("local adapter continua na chave global", async () => {
  const storage = memoryStorage();
  const repository = createLocalGoalRepository(storage);
  await repository.create({ title: "Viagem", targetAmountInCents: 100_000, iconKey: "travel" });
  assert.ok(storage.snapshot()[GOALS_STORAGE_KEY]);
  assert.equal(Object.keys(storage.snapshot()).some((key) => key.includes("/user:")), false);
  const store = await createGoalStore(storage).load();
  assert.equal(store.goals[0]?.title, "Viagem");
});
