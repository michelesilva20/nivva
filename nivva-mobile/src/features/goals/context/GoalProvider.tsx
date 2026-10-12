import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { localGoalRepository } from "@/data/repositories/async-storage-goal-repository";
import type { ContributeGoalInput, GoalRepository } from "@/data/repositories/goal-repository";
import type { GoalEditInput, NewGoalInput } from "@/domain/models";
import { sortContributionsByNewest, type GoalSnapshot } from "@/features/goals/calculations/goal-calculations";
import { toGoalUserMessage } from "@/features/goals/errors";

import { goalReducer, initialGoalState, type GoalLoadStatus } from "./goal-reducer";

type GoalContextValue = {
  snapshots: GoalSnapshot[];
  loadStatus: GoalLoadStatus;
  notice: string | null;
  createGoal: (input: NewGoalInput) => Promise<GoalSnapshot>;
  updateGoal: (id: string, input: GoalEditInput) => Promise<GoalSnapshot>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, input: ContributeGoalInput) => Promise<GoalSnapshot>;
  getSnapshot: (id: string) => GoalSnapshot | undefined;
  loadGoalDetail: (id: string) => Promise<void>;
  reloadGoals: () => Promise<void>;
  clearNotice: () => void;
};

const GoalContext = createContext<GoalContextValue | null>(null);

export function GoalProvider({
  children,
  repository = localGoalRepository,
}: {
  children: ReactNode;
  repository?: GoalRepository;
}) {
  const [state, dispatch] = useReducer(goalReducer, initialGoalState);

  const loadGoals = useCallback(async () => {
    try {
      const snapshots = await repository.list();
      dispatch({ type: "hydrate", snapshots });
    } catch (error) {
      console.warn("[nivva] falha ao carregar metas", error);
      dispatch({ type: "hydrate-failed" });
    }
  }, [repository]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const reloadGoals = useCallback(async () => {
    dispatch({ type: "reload" });
    await loadGoals();
  }, [loadGoals]);

  const createGoal = useCallback(
    async (input: NewGoalInput) => {
      try {
        const snapshot = await repository.create(input);
        dispatch({ type: "upsert", snapshot, notice: "Meta criada" });
        return snapshot;
      } catch (error) {
        dispatch({ type: "set-notice", notice: toGoalUserMessage(error) });
        throw error;
      }
    },
    [repository],
  );

  const updateGoal = useCallback(
    async (id: string, input: GoalEditInput) => {
      try {
        const snapshot = await repository.update(id, input);
        const previous = state.snapshots.find((item) => item.goal.id === id);
        dispatch({
          type: "upsert",
          snapshot: {
            ...snapshot,
            contributions: snapshot.contributions.length > 0 ? snapshot.contributions : previous?.contributions ?? [],
          },
          notice: "Meta atualizada",
        });
        return snapshot;
      } catch (error) {
        dispatch({ type: "set-notice", notice: toGoalUserMessage(error) });
        throw error;
      }
    },
    [repository, state.snapshots],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      try {
        await repository.remove(id);
        dispatch({ type: "remove", goalId: id });
      } catch (error) {
        dispatch({ type: "set-notice", notice: toGoalUserMessage(error) });
        throw error;
      }
    },
    [repository],
  );

  const addContribution = useCallback(
    async (goalId: string, input: ContributeGoalInput) => {
      try {
        const result = await repository.contribute(goalId, input);
        const previous = state.snapshots.find((item) => item.goal.id === goalId);
        const contributions = sortContributionsByNewest([
          result.contribution,
          ...(previous?.contributions ?? []).filter((item) => item.id !== result.contribution.id),
        ]);
        const snapshot = { ...result.snapshot, contributions };
        dispatch({ type: "upsert", snapshot, notice: "Progresso registrado" });
        return snapshot;
      } catch (error) {
        dispatch({ type: "set-notice", notice: toGoalUserMessage(error) });
        throw error;
      }
    },
    [repository, state.snapshots],
  );

  const loadGoalDetail = useCallback(
    async (id: string) => {
      try {
        const snapshot = await repository.get(id);
        dispatch({ type: "upsert", snapshot });
      } catch (error) {
        dispatch({ type: "set-notice", notice: toGoalUserMessage(error) });
      }
    },
    [repository],
  );

  const getSnapshot = useCallback(
    (id: string) => state.snapshots.find((snapshot) => snapshot.goal.id === id),
    [state.snapshots],
  );

  const clearNotice = useCallback(() => {
    dispatch({ type: "set-notice", notice: null });
  }, []);

  const value = useMemo(
    () => ({
      snapshots: state.snapshots,
      loadStatus: state.loadStatus,
      notice: state.notice,
      createGoal,
      updateGoal,
      deleteGoal,
      addContribution,
      getSnapshot,
      loadGoalDetail,
      reloadGoals,
      clearNotice,
    }),
    [
      state.snapshots,
      state.loadStatus,
      state.notice,
      createGoal,
      updateGoal,
      deleteGoal,
      addContribution,
      getSnapshot,
      loadGoalDetail,
      reloadGoals,
      clearNotice,
    ],
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoals(): GoalContextValue {
  const context = useContext(GoalContext);

  if (!context) {
    throw new Error("useGoals precisa estar dentro de GoalProvider");
  }

  return context;
}
