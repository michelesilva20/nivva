import type { BudgetSummary } from "./budget";
import type { ExpenseCategory } from "./category";
import type { Money } from "./money";

export type AnalyticsPeriod = "week" | "month" | "year" | "custom";

export type ChartBar = {
  label: string;
  /** Altura relativa, de 0 a 1. */
  ratio: number;
  highlighted: boolean;
};

export type AnalyticsSnapshot = {
  totalExpenses: Money;
  comparisonLabel: string;
  chart: ChartBar[];
  budget: BudgetSummary;
  categories: ExpenseCategory[];
};
