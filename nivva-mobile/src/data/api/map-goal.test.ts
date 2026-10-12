import assert from "node:assert/strict";
import { test } from "node:test";

import { mapApiContributionToDomain, mapApiGoalToSnapshot, mapGoalInputToApiRequest } from "./map-goal";

const apiGoal = {
  id: "8cc5f32a-1111-4111-8111-aaaaaaaaaaaa",
  title: "Meta A",
  targetAmountCents: 100000,
  currentAmountCents: 20000,
  remainingAmountCents: 80000,
  status: "ACTIVE" as const,
  deadline: "2026-12-01",
  note: null,
  iconKey: "travel" as const,
  createdAt: "2026-10-01T12:00:00Z",
  updatedAt: "2026-10-01T12:00:00Z",
};

test("preserva UUID, deadline YYYY-MM-DD e valores derivados do servidor", () => {
  const snapshot = mapApiGoalToSnapshot(apiGoal);
  assert.equal(snapshot.goal.id, apiGoal.id);
  assert.equal(snapshot.goal.deadline, "2026-12-01");
  assert.equal(snapshot.goal.note, undefined);
  assert.equal(snapshot.currentAmount.cents, 20000);
  assert.equal(snapshot.remainingAmount.cents, 80000);
  assert.equal(snapshot.status, "active");
  assert.equal(snapshot.progress, 0.2);
  assert.deepEqual(snapshot.contributions, []);
});

test("COMPLETED vira completed e note null some", () => {
  const snapshot = mapApiGoalToSnapshot({ ...apiGoal, status: "COMPLETED", currentAmountCents: 100000, remainingAmountCents: 0, note: "obs" });
  assert.equal(snapshot.status, "completed");
  assert.equal(snapshot.goal.note, "obs");
});

test("API contribution mapeia Money e note opcional", () => {
  const contribution = mapApiContributionToDomain({
    id: "c1",
    goalId: apiGoal.id,
    amountCents: 15000,
    occurredAt: "2026-10-12T15:00:00Z",
    note: null,
    createdAt: "2026-10-12T15:00:00Z",
  });
  assert.equal(contribution.amount.cents, 15000);
  assert.equal(contribution.note, undefined);
  assert.equal(contribution.occurredAt, "2026-10-12T15:00:00Z");
});

test("input de Goal vira body da API em lowercase", () => {
  const body = mapGoalInputToApiRequest({
    title: " Casa ",
    targetAmountInCents: 50000,
    iconKey: "home",
  });
  assert.deepEqual(body, {
    title: "Casa",
    targetAmountCents: 50000,
    deadline: null,
    note: null,
    iconKey: "home",
  });
});
