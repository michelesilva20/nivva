import {
  money,
  type Goal,
  type GoalContribution,
  type GoalStatus,
  type Money,
} from "@/domain/models";

export type GoalSnapshot = {
  goal: Goal;
  currentAmount: Money;
  remainingAmount: Money;
  progress: number;
  status: GoalStatus;
  contributions: GoalContribution[];
};

export function getGoalContributions(
  contributions: GoalContribution[],
  goalId: string,
): GoalContribution[] {
  return contributions.filter((contribution) => contribution.goalId === goalId);
}

export function calculateGoalCurrentAmount(contributions: GoalContribution[]): Money {
  const cents = contributions.reduce((total, contribution) => total + Math.max(0, contribution.amount.cents), 0);
  return money(cents);
}

export function calculateGoalRemainingAmount(target: Money, current: Money): Money {
  return money(Math.max(0, target.cents - current.cents));
}

export function calculateGoalProgress(current: Money, target: Money): number {
  if (target.cents <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, current.cents / target.cents));
}

export function calculateGoalStatus(current: Money, target: Money): GoalStatus {
  return current.cents >= target.cents && target.cents > 0 ? "completed" : "active";
}

export function sortContributionsByNewest(contributions: GoalContribution[]): GoalContribution[] {
  return [...contributions].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}

export function sortGoals(goals: Goal[], contributions: GoalContribution[]): Goal[] {
  return [...goals].sort((left, right) => {
    const leftStatus = calculateGoalStatus(
      calculateGoalCurrentAmount(getGoalContributions(contributions, left.id)),
      left.targetAmount,
    );
    const rightStatus = calculateGoalStatus(
      calculateGoalCurrentAmount(getGoalContributions(contributions, right.id)),
      right.targetAmount,
    );

    if (leftStatus !== rightStatus) {
      return leftStatus === "active" ? -1 : 1;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export function buildGoalSnapshot(goal: Goal, contributions: GoalContribution[]): GoalSnapshot {
  const goalContributions = sortContributionsByNewest(getGoalContributions(contributions, goal.id));
  const currentAmount = calculateGoalCurrentAmount(goalContributions);

  return {
    goal,
    currentAmount,
    remainingAmount: calculateGoalRemainingAmount(goal.targetAmount, currentAmount),
    progress: calculateGoalProgress(currentAmount, goal.targetAmount),
    status: calculateGoalStatus(currentAmount, goal.targetAmount),
    contributions: goalContributions,
  };
}

export function buildGoalSnapshots(goals: Goal[], contributions: GoalContribution[]): GoalSnapshot[] {
  return sortGoals(goals, contributions).map((goal) => buildGoalSnapshot(goal, contributions));
}

export function formatGoalPercentage(ratio: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(ratio);
}

export function toDeadlineDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDeadlineDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}

export function formatGoalDeadline(value: string): string {
  const date = parseDeadlineDate(value);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
  return `${month} ${date.getFullYear()}`;
}

export function formatGoalDeadlineLong(value: string): string {
  const date = parseDeadlineDate(value);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  return `${month} de ${date.getFullYear()}`;
}

export function isDeadlineInThePast(value: string, today = new Date()): boolean {
  const deadline = parseDeadlineDate(value);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return deadline < startOfToday;
}

export function validateContributionAmount(amountInCents: number, remainingCents: number): string | null {
  if (!Number.isInteger(amountInCents) || amountInCents <= 0) {
    return "Informe um valor maior que zero.";
  }

  if (remainingCents <= 0) {
    return "Esta meta já está concluída.";
  }

  if (amountInCents > remainingCents) {
    return "Esse valor ultrapassa o que falta para concluir a meta.";
  }

  return null;
}

export function validateGoalTarget(targetAmountInCents: number, currentCents: number): string | null {
  if (!Number.isInteger(targetAmountInCents) || targetAmountInCents <= 0) {
    return "Informe um valor maior que zero.";
  }

  if (targetAmountInCents < currentCents) {
    return "O valor da meta não pode ser menor que o valor já registrado.";
  }

  return null;
}
