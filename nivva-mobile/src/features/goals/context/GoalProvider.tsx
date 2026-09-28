import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { View } from "react-native";

import { useTheme } from "@/core/design-system";
import { localGoalRepository } from "@/data/repositories/async-storage-goal-repository";
import type {
  Goal,
  GoalContribution,
  GoalEditInput,
  NewGoalContributionInput,
  NewGoalInput,
} from "@/domain/models";
import { buildGoalSnapshot, buildGoalSnapshots, type GoalSnapshot } from "@/features/goals/calculations/goal-calculations";
import {
  applyGoalEdits,
  createGoal,
  createGoalContribution,
  removeGoalAndContributions,
  replaceGoal,
} from "@/features/goals/persistence/goal-mutations";

import { goalReducer } from "./goal-reducer";

type GoalContextValue = {
  goals: Goal[];
  contributions: GoalContribution[];
  snapshots: GoalSnapshot[];
  notice: string | null;
  createGoal: (input: NewGoalInput) => void;
  updateGoal: (id: string, input: GoalEditInput) => void;
  deleteGoal: (id: string) => void;
  addContribution: (input: NewGoalContributionInput) => void;
  getSnapshot: (id: string) => GoalSnapshot | undefined;
  clearNotice: () => void;
};

const GoalContext = createContext<GoalContextValue | null>(null);

export function GoalProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [state, dispatch] = useReducer(goalReducer, {
    goals: [],
    contributions: [],
    notice: null,
    isHydrated: false,
  });
  const goalsRef = useRef(state.goals);
  const contributionsRef = useRef(state.contributions);
  goalsRef.current = state.goals;
  contributionsRef.current = state.contributions;

  useEffect(() => {
    let cancelled = false;

    localGoalRepository.load().then((store) => {
      if (!cancelled) {
        dispatch({ type: "hydrate", goals: store.goals, contributions: store.contributions });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((goals: Goal[], contributions: GoalContribution[]) => {
    goalsRef.current = goals;
    contributionsRef.current = contributions;
    void localGoalRepository.save({ goals, contributions }).catch((error) => {
      console.warn("[nivva] falha ao persistir metas locais", error);
    });
  }, []);

  const handleCreateGoal = useCallback(
    (input: NewGoalInput) => {
      const goal = createGoal(input);
      persist([goal, ...goalsRef.current], contributionsRef.current);
      dispatch({ type: "create-goal", goal });
    },
    [persist],
  );

  const handleUpdateGoal = useCallback(
    (id: string, input: GoalEditInput) => {
      const current = goalsRef.current.find((goal) => goal.id === id);
      if (!current) {
        return;
      }

      const nextGoal = applyGoalEdits(current, input);
      const nextGoals = replaceGoal(goalsRef.current, nextGoal);
      if (!nextGoals) {
        return;
      }

      persist(nextGoals, contributionsRef.current);
      dispatch({ type: "replace-goal", goal: nextGoal });
    },
    [persist],
  );

  const handleDeleteGoal = useCallback(
    (id: string) => {
      const next = removeGoalAndContributions(goalsRef.current, contributionsRef.current, id);
      if (!next) {
        return;
      }

      persist(next.goals, next.contributions);
      dispatch({ type: "remove-goal", goalId: id });
    },
    [persist],
  );

  const handleAddContribution = useCallback(
    (input: NewGoalContributionInput) => {
      const contribution = createGoalContribution(input);
      persist(goalsRef.current, [contribution, ...contributionsRef.current]);
      dispatch({ type: "add-contribution", contribution });
    },
    [persist],
  );

  const clearNotice = useCallback(() => {
    dispatch({ type: "clear-notice" });
  }, []);

  const snapshots = useMemo(
    () => buildGoalSnapshots(state.goals, state.contributions),
    [state.goals, state.contributions],
  );

  const getSnapshot = useCallback(
    (id: string) => {
      const goal = state.goals.find((item) => item.id === id);
      return goal ? buildGoalSnapshot(goal, state.contributions) : undefined;
    },
    [state.goals, state.contributions],
  );

  const value = useMemo(
    () => ({
      goals: state.goals,
      contributions: state.contributions,
      snapshots,
      notice: state.notice,
      createGoal: handleCreateGoal,
      updateGoal: handleUpdateGoal,
      deleteGoal: handleDeleteGoal,
      addContribution: handleAddContribution,
      getSnapshot,
      clearNotice,
    }),
    [
      state.goals,
      state.contributions,
      state.notice,
      snapshots,
      handleCreateGoal,
      handleUpdateGoal,
      handleDeleteGoal,
      handleAddContribution,
      getSnapshot,
      clearNotice,
    ],
  );

  if (!state.isHydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoals(): GoalContextValue {
  const context = useContext(GoalContext);

  if (!context) {
    throw new Error("useGoals precisa estar dentro de GoalProvider");
  }

  return context;
}
