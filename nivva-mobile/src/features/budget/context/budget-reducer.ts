import type { MonthlyBudget } from "@/domain/models";

export type BudgetState = {
  budgets: MonthlyBudget[];
  notice: string | null;
  isHydrated: boolean;
};

export type BudgetAction =
  | { type: "hydrate"; budgets: MonthlyBudget[] }
  | { type: "replace-budgets"; budgets: MonthlyBudget[] }
  | { type: "clear-notice" };

export function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  if (action.type === "hydrate") {
    return {
      ...state,
      budgets: action.budgets,
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
  };
}
