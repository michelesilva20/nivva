import assert from "node:assert/strict";
import { test } from "node:test";

import { money, type Goal } from "@/domain/models";
import { buildGoalSnapshot, type GoalSnapshot } from "@/features/goals/calculations/goal-calculations";

import { goalReducer, initialGoalState } from "./goal-reducer";

const goalA: Goal = {
  id: "goal-a",
  title: "Meta A",
  targetAmount: money(100_000),
  iconKey: "other",
  createdAt: "2026-10-01T12:00:00.000Z",
};

function snapshotFor(goal: Goal): GoalSnapshot {
  return buildGoalSnapshot(goal, []);
}

test("create rejeitado não altera a lista", () => {
  const state = { ...initialGoalState, loadStatus: "ready" as const };
  const afterNotice = goalReducer(state, { type: "set-notice", notice: "Falha de rede" });
  assert.equal(afterNotice.snapshots.length, 0);
  assert.equal(afterNotice.notice, "Falha de rede");
});

test("hydration failure não vira lista vazia pronta", () => {
  const state = goalReducer(initialGoalState, { type: "hydrate-failed" });
  assert.equal(state.loadStatus, "error");
  assert.equal(state.snapshots.length, 0);
});

test("retry depois de erro deixa o estado loading", () => {
  const failed = goalReducer(initialGoalState, { type: "hydrate-failed" });
  const loading = goalReducer(failed, { type: "reload" });
  assert.equal(loading.loadStatus, "loading");
});

test("user switch começa vazio e só hidrata as metas novas", () => {
  const userA = goalReducer(initialGoalState, { type: "hydrate", snapshots: [snapshotFor(goalA)] });
  const reset = initialGoalState;
  const userB = goalReducer(reset, {
    type: "hydrate",
    snapshots: [snapshotFor({ ...goalA, id: "goal-b", title: "Meta B" })],
  });

  assert.equal(userA.snapshots[0]?.goal.title, "Meta A");
  assert.equal(userB.snapshots[0]?.goal.title, "Meta B");
  assert.equal(userB.snapshots.some((snapshot) => snapshot.goal.id === "goal-a"), false);
});

test("contribute failure via notice não muda snapshots", () => {
  const ready = goalReducer(initialGoalState, { type: "hydrate", snapshots: [snapshotFor(goalA)] });
  const after = goalReducer(ready, { type: "set-notice", notice: "Esse valor ultrapassa o que falta para concluir a meta." });
  assert.equal(after.snapshots[0]?.goal.id, "goal-a");
  assert.equal(after.snapshots[0]?.currentAmount.cents, 0);
});
