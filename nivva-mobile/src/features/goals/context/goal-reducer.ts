import type { Goal, GoalContribution } from "@/domain/models";

export type GoalState = {
  goals: Goal[];
  contributions: GoalContribution[];
  notice: string | null;
  isHydrated: boolean;
};

export type GoalAction =
  | { type: "hydrate"; goals: Goal[]; contributions: GoalContribution[] }
  | { type: "create-goal"; goal: Goal }
  | { type: "replace-goal"; goal: Goal }
  | { type: "remove-goal"; goalId: string }
  | { type: "add-contribution"; contribution: GoalContribution }
  | { type: "clear-notice" };

export function goalReducer(state: GoalState, action: GoalAction): GoalState {
  if (action.type === "hydrate") {
    return {
      ...state,
      goals: action.goals,
      contributions: action.contributions,
      isHydrated: true,
    };
  }

  if (action.type === "clear-notice") {
    return { ...state, notice: null };
  }

  if (action.type === "create-goal") {
    return {
      ...state,
      notice: "Meta criada",
      goals: [action.goal, ...state.goals],
    };
  }

  if (action.type === "replace-goal") {
    if (!state.goals.some((goal) => goal.id === action.goal.id)) {
      return state;
    }

    return {
      ...state,
      notice: "Meta atualizada",
      goals: state.goals.map((goal) => (goal.id === action.goal.id ? action.goal : goal)),
    };
  }

  if (action.type === "remove-goal") {
    if (!state.goals.some((goal) => goal.id === action.goalId)) {
      return state;
    }

    return {
      ...state,
      notice: "Meta excluída",
      goals: state.goals.filter((goal) => goal.id !== action.goalId),
      contributions: state.contributions.filter((contribution) => contribution.goalId !== action.goalId),
    };
  }

  return {
    ...state,
    notice: "Progresso registrado",
    contributions: [action.contribution, ...state.contributions],
  };
}
