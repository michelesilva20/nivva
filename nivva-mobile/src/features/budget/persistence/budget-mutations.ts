import { money, type MonthlyBudget } from "@/domain/models";

export function upsertMonthlyBudget(
  budgets: MonthlyBudget[],
  period: string,
  limitInCents: number,
  now = new Date(),
): MonthlyBudget[] {
  const stamp = now.toISOString();
  const existing = budgets.find((budget) => budget.period === period);

  if (existing) {
    return budgets.map((budget) =>
      budget.period === period
        ? {
            ...budget,
            limit: money(limitInCents),
            updatedAt: stamp,
          }
        : budget,
    );
  }

  return [
    {
      id: `budget-${period}`,
      period,
      limit: money(limitInCents),
      createdAt: stamp,
      updatedAt: stamp,
    },
    ...budgets,
  ];
}
