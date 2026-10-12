import assert from "node:assert/strict";
import { test } from "node:test";

import { ApiError } from "@/data/api/api-error";

import { createApiGoalRepository } from "./api-goal-repository";

const goal = {
  id: "8cc5f32a-1111-4111-8111-aaaaaaaaaaaa",
  title: "Meta A",
  targetAmountCents: 100000,
  currentAmountCents: 0,
  remainingAmountCents: 100000,
  status: "ACTIVE" as const,
  deadline: null,
  note: null,
  iconKey: "other" as const,
  createdAt: "2026-10-01T12:00:00Z",
  updatedAt: "2026-10-01T12:00:00Z",
};

test("list mapeia Goals da API", async () => {
  const repository = createApiGoalRepository({
    request: async () => [goal],
  });
  const snapshots = await repository.list();
  assert.equal(snapshots[0]?.goal.id, goal.id);
  assert.equal(snapshots[0]?.status, "active");
});

test("create envia o body mapeado e usa UUID do servidor", async () => {
  let body: unknown;
  const repository = createApiGoalRepository({
    request: async (_path, options) => {
      body = options?.body;
      return goal;
    },
  });
  const snapshot = await repository.create({ title: "Meta A", targetAmountInCents: 100000, iconKey: "other" });
  assert.equal(snapshot.goal.id, goal.id);
  assert.equal((body as { title: string }).title, "Meta A");
});

test("contribute usa a URL da Goal e não chama transactions", async () => {
  const paths: string[] = [];
  const repository = createApiGoalRepository({
    request: async (path) => {
      paths.push(path);
      return {
        contribution: {
          id: "c1",
          goalId: goal.id,
          amountCents: 20000,
          occurredAt: "2026-10-12T15:00:00Z",
          note: null,
          createdAt: "2026-10-12T15:00:00Z",
        },
        goal: { ...goal, currentAmountCents: 20000, remainingAmountCents: 80000 },
      };
    },
  });

  const result = await repository.contribute(goal.id, { amountInCents: 20000, occurredAt: "2026-10-12T15:00:00Z" });
  assert.equal(paths[0], `/api/v1/goals/${goal.id}/contributions`);
  assert.equal(paths.some((path) => path.includes("/transactions")), false);
  assert.equal(paths.some((path) => path.includes("/accounts")), false);
  assert.equal(result.snapshot.currentAmount.cents, 20000);
});

test("422 de remaining preserva detail", async () => {
  const repository = createApiGoalRepository({
    request: async () => {
      throw new ApiError({
        message: "Contribution exceeds remaining amount",
        status: 422,
        detail: "Contribution exceeds remaining amount",
      });
    },
  });
  await assert.rejects(
    () => repository.contribute(goal.id, { amountInCents: 1, occurredAt: "2026-10-12T15:00:00Z" }),
    (error: unknown) => error instanceof ApiError && error.status === 422 && error.detail === "Contribution exceeds remaining amount",
  );
});

test("falha de rede sobe sem status", async () => {
  const repository = createApiGoalRepository({
    request: async () => {
      throw new ApiError({ message: "Não foi possível conectar ao Nivva." });
    },
  });
  await assert.rejects(
    () => repository.list(),
    (error: unknown) => error instanceof ApiError && error.status == null,
  );
});
