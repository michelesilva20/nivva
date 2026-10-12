import type { MonthlyBudget } from "@/domain/models";

export type BudgetLoadStatus = "ready" | "error";

export type BudgetState = {
  budgets: MonthlyBudget[];
  notice: string | null;
  isHydrated: boolean;
  loadStatus: BudgetLoadStatus;
};

export type BudgetAction =
  | { type: "hydrate"; budgets: MonthlyBudget[]; loadStatus: BudgetLoadStatus }
  | { type: "replace-budgets"; budgets: MonthlyBudget[] }
  | { type: "clear-notice" };

export function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  if (action.type === "hydrate") {
    return {
      ...state,
      budgets: action.budgets,
      loadStatus: action.loadStatus,
      isHydrated: true,
    };
  }

  if (action.type === "clear-notice") {
    return { ...state, notice: null };
  }

  return {
    ...state,
    notice: "Orçamento atualizado",
    budgets: action.budgets,
    loadStatus: "ready",
  };
}
