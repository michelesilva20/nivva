import type { Money } from "./money";

export type BudgetSummary = {
  spent: Money;
  total: Money;
  available: Money;
  /** Fração de 0 a 1, já limitada para a barra de progresso. */
  usageRatio: number;
};
