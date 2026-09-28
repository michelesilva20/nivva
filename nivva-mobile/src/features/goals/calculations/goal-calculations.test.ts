import assert from "node:assert/strict";
import { test } from "node:test";

import { createGoalRepository } from "@/data/repositories/goal-repository";
import { money, type Goal, type GoalContribution } from "@/domain/models";
import { applyUserTransactionsToAccounts } from "@/features/finance/persistence/local-finance";

import {
  buildGoalSnapshot,
  calculateGoalCurrentAmount,
  calculateGoalProgress,
  calculateGoalRemainingAmount,
  calculateGoalStatus,
  validateContributionAmount,
  validateGoalTarget,
} from "./goal-calculations";
import { createGoal, createGoalContribution, removeGoalAndContributions } from "../persistence/goal-mutations";

const goal: Goal = {
  id: "goal-travel",
  title: "Viagem",
  targetAmount: money(1_000_000),
  iconKey: "travel",
  createdAt: "2026-09-01T12:00:00.000Z",
};

const first: GoalContribution = {
  id: "c1",
  goalId: "goal-travel",
  amount: money(100_000),
  occurredAt: "2026-09-10T12:00:00.000Z",
};

const second: GoalContribution = {
  id: "c2",
  goalId: "goal-travel",
  amount: money(50_000),
  occurredAt: "2026-09-12T12:00:00.000Z",
};

test("soma contribuições para obter o valor atual", () => {
  assert.equal(calculateGoalCurrentAmount([first, second]).cents, 150_000);
});

test("calcula o restante da meta", () => {
  assert.equal(calculateGoalRemainingAmount(goal.targetAmount, money(150_000)).cents, 850_000);
});

test("calcula o progresso sem passar de 100%", () => {
  assert.equal(calculateGoalProgress(money(150_000), money(1_000_000)), 0.15);
  assert.equal(calculateGoalProgress(money(1_200_000), money(1_000_000)), 1);
});

test("marca a meta como concluída quando o atual alcança o alvo", () => {
  assert.equal(calculateGoalStatus(money(1_000_000), money(1_000_000)), "completed");
  assert.equal(calculateGoalStatus(money(999_999), money(1_000_000)), "active");
});

test("não aceita contribuição zero, negativa ou acima do restante", () => {
  assert.equal(validateContributionAmount(0, 500_000), "Informe um valor maior que zero.");
  assert.equal(validateContributionAmount(-10, 500_000), "Informe um valor maior que zero.");
  assert.equal(
    validateContributionAmount(600_000, 500_000),
    "Esse valor ultrapassa o que falta para concluir a meta.",
  );
  assert.equal(validateContributionAmount(500_000, 500_000), null);
});

test("editar o alvo respeita o valor já registrado", () => {
  assert.equal(
    validateGoalTarget(500_000, 800_000),
    "O valor da meta não pode ser menor que o valor já registrado.",
  );
  assert.equal(validateGoalTarget(800_000, 800_000), null);
  assert.equal(calculateGoalStatus(money(800_000), money(800_000)), "completed");
  assert.equal(validateGoalTarget(1_200_000, 800_000), null);
  assert.equal(calculateGoalStatus(money(800_000), money(1_200_000)), "active");
});

test("progresso persistido sobrevive a um restart simulado", async () => {
  const created = createGoal(
    { title: "Viagem", targetAmountInCents: 500_000, iconKey: "travel" },
    "goal-travel",
    "2026-09-01T12:00:00.000Z",
  );
  const contribution = createGoalContribution(
    { goalId: created.id, amountInCents: 50_000, occurredAt: "2026-09-25T12:00:00.000Z" },
    "c-500",
  );
  const memory = new Map<string, string>();
  const storage = {
    async getItem(key: string) {
      return memory.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      memory.set(key, value);
    },
    async removeItem(key: string) {
      memory.delete(key);
    },
  };

  await createGoalRepository(storage).save({ goals: [created], contributions: [contribution] });
  const restored = await createGoalRepository(storage).load();
  const snapshot = buildGoalSnapshot(restored.goals[0]!, restored.contributions);

  assert.equal(restored.goals.length, 1);
  assert.equal(restored.contributions.length, 1);
  assert.equal(snapshot.currentAmount.cents, 50_000);
  assert.equal(snapshot.progress, 0.1);

  const again = await createGoalRepository(storage).load();
  assert.equal(again.contributions.length, 1);
});

test("excluir a meta remove as contribuições e não reaparece depois do restart", async () => {
  const created = createGoal({ title: "Viagem", targetAmountInCents: 500_000 }, "goal-travel");
  const contributions = [
    createGoalContribution({ goalId: created.id, amountInCents: 50_000, occurredAt: "2026-09-10T12:00:00.000Z" }, "c1"),
    createGoalContribution({ goalId: created.id, amountInCents: 30_000, occurredAt: "2026-09-11T12:00:00.000Z" }, "c2"),
  ];
  const removed = removeGoalAndContributions([created], contributions, created.id);
  const memory = new Map<string, string>();
  const storage = {
    async getItem(key: string) {
      return memory.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      memory.set(key, value);
    },
    async removeItem(key: string) {
      memory.delete(key);
    },
  };

  assert.equal(removed?.goals.length, 0);
  assert.equal(removed?.contributions.length, 0);

  await createGoalRepository(storage).save(removed ?? { goals: [created], contributions });
  const restored = await createGoalRepository(storage).load();
  assert.deepEqual(restored, { goals: [], contributions: [] });
});

test("registrar progresso não altera saldo, receitas nem despesas", () => {
  const seedAccounts = [
    {
      id: "main",
      name: "Conta principal",
      typeLabel: "Conta corrente",
      balance: money(862_050),
      maskedNumber: "•••• 1234",
    },
  ];
  const before = applyUserTransactionsToAccounts(seedAccounts, []);
  const contribution = createGoalContribution({
    goalId: "goal-1",
    amountInCents: 50_000,
    occurredAt: "2026-09-25T12:00:00.000Z",
  });
  const after = applyUserTransactionsToAccounts(seedAccounts, []);

  assert.equal("accountId" in contribution, false);
  assert.equal("type" in contribution, false);
  assert.equal(before[0]?.balance.cents, 862_050);
  assert.equal(after[0]?.balance.cents, 862_050);
});
