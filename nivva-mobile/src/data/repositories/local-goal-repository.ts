import type { GoalEditInput, NewGoalInput } from "@/domain/models";
import {
  buildGoalSnapshot,
  buildGoalSnapshots,
  validateContributionAmount,
  validateGoalTarget,
} from "@/features/goals/calculations/goal-calculations";
import {
  applyGoalEdits,
  createGoal,
  createGoalContribution,
  removeGoalAndContributions,
  replaceGoal,
} from "@/features/goals/persistence/goal-mutations";

import type { ContributeGoalInput, GoalRepository, GoalStoreRepository, KeyValueStorage } from "./goal-repository";
import { createGoalStore } from "./goal-repository";

export function createLocalGoalRepository(
  storage: KeyValueStorage,
  userId?: string | null,
): GoalRepository {
  const store = createGoalStore(storage, userId);
  return createLocalGoalRepositoryFromStore(store);
}

export function createLocalGoalRepositoryFromStore(store: GoalStoreRepository): GoalRepository {
  return {
    async list() {
      const snapshot = await store.load();
      return buildGoalSnapshots(snapshot.goals, snapshot.contributions);
    },

    async get(id) {
      const snapshot = await store.load();
      const goal = snapshot.goals.find((item) => item.id === id);
      if (!goal) {
        throw new Error("Meta não encontrada");
      }
      return buildGoalSnapshot(goal, snapshot.contributions);
    },

    async create(input: NewGoalInput) {
      const snapshot = await store.load();
      const goal = createGoal(input);
      await store.save({ goals: [goal, ...snapshot.goals], contributions: snapshot.contributions });
      return buildGoalSnapshot(goal, snapshot.contributions);
    },

    async update(id, input: GoalEditInput) {
      const snapshot = await store.load();
      const current = snapshot.goals.find((item) => item.id === id);
      if (!current) {
        throw new Error("Meta não encontrada");
      }

      const currentCents = buildGoalSnapshot(current, snapshot.contributions).currentAmount.cents;
      const targetError = validateGoalTarget(input.targetAmountInCents, currentCents);
      if (targetError) {
        throw new Error(targetError);
      }

      const nextGoal = applyGoalEdits(current, input);
      const nextGoals = replaceGoal(snapshot.goals, nextGoal);
      if (!nextGoals) {
        throw new Error("Meta não encontrada");
      }

      await store.save({ goals: nextGoals, contributions: snapshot.contributions });
      return buildGoalSnapshot(nextGoal, snapshot.contributions);
    },

    async remove(id) {
      const snapshot = await store.load();
      const next = removeGoalAndContributions(snapshot.goals, snapshot.contributions, id);
      if (!next) {
        throw new Error("Meta não encontrada");
      }
      await store.save(next);
    },

    async listContributions(goalId) {
      return (await this.get(goalId)).contributions;
    },

    async contribute(goalId, input: ContributeGoalInput) {
      const snapshot = await store.load();
      const goal = snapshot.goals.find((item) => item.id === goalId);
      if (!goal) {
        throw new Error("Meta não encontrada");
      }

      const current = buildGoalSnapshot(goal, snapshot.contributions);
      const amountError = validateContributionAmount(input.amountInCents, current.remainingAmount.cents);
      if (amountError) {
        throw new Error(amountError);
      }

      const contribution = createGoalContribution({
        goalId,
        amountInCents: input.amountInCents,
        occurredAt: input.occurredAt,
        note: input.note,
      });
      const contributions = [contribution, ...snapshot.contributions];
      await store.save({ goals: snapshot.goals, contributions });
      return {
        contribution,
        snapshot: buildGoalSnapshot(goal, contributions),
      };
    },
  };
}
