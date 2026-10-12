import type { GoalSnapshot } from "@/features/goals/calculations/goal-calculations";

export type GoalLoadStatus = "loading" | "ready" | "error";

export type GoalState = {
  snapshots: GoalSnapshot[];
  notice: string | null;
  loadStatus: GoalLoadStatus;
};

export type GoalAction =
  | { type: "reload" }
  | { type: "hydrate"; snapshots: GoalSnapshot[] }
  | { type: "hydrate-failed" }
  | { type: "upsert"; snapshot: GoalSnapshot; notice?: string }
  | { type: "remove"; goalId: string }
  | { type: "set-notice"; notice: string | null };

export const initialGoalState: GoalState = {
  snapshots: [],
  notice: null,
  loadStatus: "loading",
};

export function goalReducer(state: GoalState, action: GoalAction): GoalState {
  if (action.type === "reload") {
    return { ...state, loadStatus: "loading" };
  }

  if (action.type === "hydrate") {
    return { ...state, snapshots: action.snapshots, loadStatus: "ready" };
  }

  if (action.type === "hydrate-failed") {
    return { ...state, loadStatus: "error" };
  }

  if (action.type === "upsert") {
    const exists = state.snapshots.some((snapshot) => snapshot.goal.id === action.snapshot.goal.id);
    return {
      ...state,
      notice: action.notice ?? state.notice,
      snapshots: exists
        ? state.snapshots.map((snapshot) =>
            snapshot.goal.id === action.snapshot.goal.id ? action.snapshot : snapshot,
          )
        : [action.snapshot, ...state.snapshots],
    };
  }

  if (action.type === "remove") {
    if (!state.snapshots.some((snapshot) => snapshot.goal.id === action.goalId)) {
      return state;
    }

    return {
      ...state,
      notice: "Meta excluída",
      snapshots: state.snapshots.filter((snapshot) => snapshot.goal.id !== action.goalId),
    };
  }

  return { ...state, notice: action.notice };
}
