import { DEFAULT_MONTHLY_BUDGET_CENTS } from "@/data/mock/budget";
import { money, type Money, type MonthlyBudget, type Transaction } from "@/domain/models";
import { calculateExpenses } from "@/features/finance/calculations/calculations";

const PERIOD_PATTERN = /^(\d{4})-(\d{2})$/;

export function getCurrentBudgetPeriod(referenceDate = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isValidBudgetPeriod(period: string): boolean {
  const match = PERIOD_PATTERN.exec(period);
  if (!match) {
    return false;
  }

  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

export function formatBudgetPeriod(period: string): string {
  const match = PERIOD_PATTERN.exec(period);
  if (!match) {
    return period;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex, 1),
  );

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function isTransactionInBudgetPeriod(occurredAt: string, period: string): boolean {
  return getCurrentBudgetPeriod(new Date(occurredAt)) === period;
}

export function calculateBudgetSpent(transactions: Transaction[], period: string): Money {
  return calculateExpenses(
    transactions.filter(
      (transaction) => transaction.type === "expense" && isTransactionInBudgetPeriod(transaction.occurredAt, period),
    ),
  );
}

export function calculateBudgetRemaining(limit: Money, spent: Money): Money {
  return money(Math.max(0, limit.cents - spent.cents));
}

export function calculateBudgetExceeded(limit: Money, spent: Money): Money {
  return money(Math.max(0, spent.cents - limit.cents));
}

export function calculateBudgetUtilization(spent: Money, limit: Money): number {
  if (limit.cents <= 0) {
    return 0;
  }

  return Math.max(0, spent.cents / limit.cents);
}

export function calculateBudgetProgressRatio(spent: Money, limit: Money): number {
  return Math.min(1, calculateBudgetUtilization(spent, limit));
}

export function calculateBudgetStatus(spent: Money, limit: Money): "within" | "exceeded" {
  return spent.cents > limit.cents ? "exceeded" : "within";
}

export function resolveEffectiveLimit(
  budgets: MonthlyBudget[],
  period: string,
  defaultCents = DEFAULT_MONTHLY_BUDGET_CENTS,
): Money {
  const configured = budgets.find((budget) => budget.period === period);
  return configured ? configured.limit : money(defaultCents);
}

export function validateBudgetLimit(cents: number): string | null {
  if (!Number.isInteger(cents) || cents <= 0) {
    return "Informe um valor maior que zero.";
  }

  return null;
}

export function buildBudgetSummary(limit: Money, spent: Money, period: string) {
  return {
    period,
    spent,
    total: limit,
    available: calculateBudgetRemaining(limit, spent),
    exceeded: calculateBudgetExceeded(limit, spent),
    utilization: calculateBudgetUtilization(spent, limit),
    usageRatio: calculateBudgetProgressRatio(spent, limit),
    status: calculateBudgetStatus(spent, limit),
  };
}
