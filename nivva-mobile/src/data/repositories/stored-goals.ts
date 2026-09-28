import { money, type Goal, type GoalContribution, type GoalIconKey } from "@/domain/models";

export type StoredGoalsDataV1 = {
  version: 1;
  goals: Goal[];
  contributions: GoalContribution[];
};

export type GoalStore = {
  goals: Goal[];
  contributions: GoalContribution[];
};

const iconKeys = new Set<GoalIconKey>(["home", "travel", "emergency", "education", "purchase", "other"]);

export function serializeGoals(store: GoalStore): string {
  const payload: StoredGoalsDataV1 = {
    version: 1,
    goals: store.goals,
    contributions: store.contributions,
  };

  return JSON.stringify(payload);
}

export function parseGoals(raw: string | null): GoalStore {
  if (raw == null || raw.trim() === "") {
    return { goals: [], contributions: [] };
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isStoredGoalsDataV1(parsed)) {
      console.warn("[nivva] storage de metas inválido; usando estado inicial");
      return { goals: [], contributions: [] };
    }

    return {
      goals: parsed.goals.map(normalizeGoal).filter((goal): goal is Goal => goal !== null),
      contributions: parsed.contributions
        .map(normalizeContribution)
        .filter((contribution): contribution is GoalContribution => contribution !== null),
    };
  } catch (error) {
    console.warn("[nivva] JSON de metas inválido; usando estado inicial", error);
    return { goals: [], contributions: [] };
  }
}

function isStoredGoalsDataV1(value: unknown): value is { version: 1; goals: unknown[]; contributions: unknown[] } {
  return isRecord(value) && value.version === 1 && Array.isArray(value.goals) && Array.isArray(value.contributions);
}

function normalizeGoal(value: unknown): Goal | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || value.id.length === 0) {
    return null;
  }

  if (typeof value.title !== "string" || typeof value.createdAt !== "string") {
    return null;
  }

  if (!isRecord(value.targetAmount) || typeof value.targetAmount.cents !== "number") {
    return null;
  }

  const cents = value.targetAmount.cents;
  if (!Number.isInteger(cents) || cents <= 0) {
    return null;
  }

  const iconKey = isGoalIconKey(value.iconKey) ? value.iconKey : "other";
  const goal: Goal = {
    id: value.id,
    title: value.title,
    targetAmount: money(cents),
    iconKey,
    createdAt: value.createdAt,
  };

  if (typeof value.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.deadline)) {
    goal.deadline = value.deadline;
  }

  if (typeof value.note === "string" && value.note.length > 0) {
    goal.note = value.note;
  }

  return goal;
}

function normalizeContribution(value: unknown): GoalContribution | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || typeof value.goalId !== "string") {
    return null;
  }

  if (typeof value.occurredAt !== "string" || Number.isNaN(Date.parse(value.occurredAt))) {
    return null;
  }

  if (!isRecord(value.amount) || typeof value.amount.cents !== "number") {
    return null;
  }

  const cents = value.amount.cents;
  if (!Number.isInteger(cents) || cents <= 0) {
    return null;
  }

  const contribution: GoalContribution = {
    id: value.id,
    goalId: value.goalId,
    amount: money(cents),
    occurredAt: value.occurredAt,
  };

  if (typeof value.note === "string" && value.note.length > 0) {
    contribution.note = value.note;
  }

  return contribution;
}

function isGoalIconKey(value: unknown): value is GoalIconKey {
  return typeof value === "string" && iconKeys.has(value as GoalIconKey);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
