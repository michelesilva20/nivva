import {
  money,
  type Goal,
  type GoalContribution,
  type GoalEditInput,
  type NewGoalContributionInput,
  type NewGoalInput,
} from "@/domain/models";

export function createGoal(input: NewGoalInput, id = `goal-${Date.now()}`, createdAt = new Date().toISOString()): Goal {
  return {
    id,
    title: input.title.trim(),
    targetAmount: money(Math.abs(input.targetAmountInCents)),
    deadline: input.deadline,
    note: input.note?.trim() || undefined,
    iconKey: input.iconKey ?? "other",
    createdAt,
  };
}

export function createGoalContribution(
  input: NewGoalContributionInput,
  id = `goal-contribution-${Date.now()}`,
): GoalContribution {
  return {
    id,
    goalId: input.goalId,
    amount: money(Math.abs(input.amountInCents)),
    occurredAt: input.occurredAt,
    note: input.note?.trim() || undefined,
  };
}

export function applyGoalEdits(existing: Goal, input: GoalEditInput): Goal {
  return {
    id: existing.id,
    createdAt: existing.createdAt,
    title: input.title.trim(),
    targetAmount: money(Math.abs(input.targetAmountInCents)),
    deadline: input.deadline,
    note: input.note?.trim() || undefined,
    iconKey: input.iconKey,
  };
}

export function replaceGoal(goals: Goal[], next: Goal): Goal[] | null {
  if (!goals.some((goal) => goal.id === next.id)) {
    return null;
  }

  return goals.map((goal) => (goal.id === next.id ? next : goal));
}

export function removeGoalAndContributions(
  goals: Goal[],
  contributions: GoalContribution[],
  goalId: string,
): { goals: Goal[]; contributions: GoalContribution[] } | null {
  if (!goals.some((goal) => goal.id === goalId)) {
    return null;
  }

  return {
    goals: goals.filter((goal) => goal.id !== goalId),
    contributions: contributions.filter((contribution) => contribution.goalId !== goalId),
  };
}
