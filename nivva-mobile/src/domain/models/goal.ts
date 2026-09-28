import type { Money } from "./money";

export type GoalIconKey = "home" | "travel" | "emergency" | "education" | "purchase" | "other";

export type GoalStatus = "active" | "completed";

export type Goal = {
  id: string;
  title: string;
  targetAmount: Money;
  deadline?: string;
  note?: string;
  iconKey: GoalIconKey;
  createdAt: string;
};

export type GoalContribution = {
  id: string;
  goalId: string;
  amount: Money;
  occurredAt: string;
  note?: string;
};

export type NewGoalInput = {
  title: string;
  targetAmountInCents: number;
  deadline?: string;
  note?: string;
  iconKey?: GoalIconKey;
};

export type GoalEditInput = {
  title: string;
  targetAmountInCents: number;
  deadline?: string;
  note?: string;
  iconKey: GoalIconKey;
};

export type NewGoalContributionInput = {
  goalId: string;
  amountInCents: number;
  occurredAt: string;
  note?: string;
};
