import type { GoalIconKey } from "@/domain/models";

export type ApiGoalStatus = "ACTIVE" | "COMPLETED";

export type ApiGoalResponse = {
  id: string;
  title: string;
  targetAmountCents: number;
  currentAmountCents: number;
  remainingAmountCents: number;
  status: ApiGoalStatus;
  deadline: string | null;
  note: string | null;
  iconKey: GoalIconKey;
  createdAt: string;
  updatedAt: string;
};

export type ApiGoalWriteRequest = {
  title: string;
  targetAmountCents: number;
  deadline?: string | null;
  note?: string | null;
  iconKey: GoalIconKey;
};

export type ApiContributionResponse = {
  id: string;
  goalId: string;
  amountCents: number;
  occurredAt: string;
  note: string | null;
  createdAt: string;
};

export type ApiContributeGoalResponse = {
  contribution: ApiContributionResponse;
  goal: ApiGoalResponse;
};

export type ApiCreateContributionRequest = {
  amountCents: number;
  occurredAt: string;
  note?: string | null;
};
