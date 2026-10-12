import { money, type Goal, type GoalContribution, type GoalEditInput, type NewGoalInput } from "@/domain/models";
import {
  calculateGoalProgress,
  type GoalSnapshot,
} from "@/features/goals/calculations/goal-calculations";

import type {
  ApiContributionResponse,
  ApiCreateContributionRequest,
  ApiGoalResponse,
  ApiGoalWriteRequest,
} from "./api-goal";

export function mapApiGoalToSnapshot(
  response: ApiGoalResponse,
  contributions: GoalContribution[] = [],
): GoalSnapshot {
  const currentAmount = money(response.currentAmountCents);
  const targetAmount = money(response.targetAmountCents);
  const goal: Goal = {
    id: response.id,
    title: response.title,
    targetAmount,
    iconKey: response.iconKey,
    createdAt: response.createdAt,
  };

  if (response.deadline) {
    goal.deadline = response.deadline;
  }

  if (response.note) {
    goal.note = response.note;
  }

  return {
    goal,
    currentAmount,
    remainingAmount: money(response.remainingAmountCents),
    progress: calculateGoalProgress(currentAmount, targetAmount),
    status: response.status === "COMPLETED" ? "completed" : "active",
    contributions,
  };
}

export function mapApiContributionToDomain(response: ApiContributionResponse): GoalContribution {
  const contribution: GoalContribution = {
    id: response.id,
    goalId: response.goalId,
    amount: money(response.amountCents),
    occurredAt: response.occurredAt,
  };

  if (response.note) {
    contribution.note = response.note;
  }

  return contribution;
}

export function mapGoalInputToApiRequest(input: NewGoalInput | GoalEditInput): ApiGoalWriteRequest {
  return {
    title: input.title.trim(),
    targetAmountCents: input.targetAmountInCents,
    deadline: input.deadline ?? null,
    note: input.note?.trim() ? input.note.trim() : null,
    iconKey: input.iconKey ?? "other",
  };
}

export function mapContributionInputToApiRequest(input: {
  amountInCents: number;
  occurredAt: string;
  note?: string;
}): ApiCreateContributionRequest {
  return {
    amountCents: input.amountInCents,
    occurredAt: input.occurredAt,
    note: input.note?.trim() ? input.note.trim() : null,
  };
}
