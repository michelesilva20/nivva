import type { Money } from "./money";

export type BudgetStatus = "within" | "exceeded";

export type MonthlyBudget = {
  id: string;
  period: string;
  limit: Money;
  createdAt: string;
  updatedAt: string;
};

export type BudgetSummary = {
  period: string;
  spent: Money;
  total: Money;
  available: Money;
  exceeded: Money;
  /** Utilização real. Pode passar de 1. */
  utilization: number;
  /** Fração de 0 a 1, já limitada para a barra de progresso. */
  usageRatio: number;
  status: BudgetStatus;
};
