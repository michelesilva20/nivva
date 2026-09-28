import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { View } from "react-native";

import { useTheme } from "@/core/design-system";
import { localBudgetRepository } from "@/data/repositories/async-storage-budget-repository";
import type { Money, MonthlyBudget } from "@/domain/models";
import { getCurrentBudgetPeriod, resolveEffectiveLimit } from "@/features/budget/calculations/budget-calculations";
import { upsertMonthlyBudget } from "@/features/budget/persistence/budget-mutations";

import { budgetReducer } from "./budget-reducer";

type BudgetContextValue = {
  budgets: MonthlyBudget[];
  notice: string | null;
  getBudgetForPeriod: (period: string) => MonthlyBudget | undefined;
  getEffectiveLimit: (period?: string, referenceDate?: Date) => Money;
  setBudgetForPeriod: (period: string, limitInCents: number) => void;
  clearNotice: () => void;
};

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [state, dispatch] = useReducer(budgetReducer, {
    budgets: [],
    notice: null,
    isHydrated: false,
  });
  const budgetsRef = useRef(state.budgets);
  budgetsRef.current = state.budgets;

  useEffect(() => {
    let cancelled = false;

    localBudgetRepository.load().then((store) => {
      if (!cancelled) {
        dispatch({ type: "hydrate", budgets: store.budgets });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((budgets: MonthlyBudget[]) => {
    budgetsRef.current = budgets;
    void localBudgetRepository.save({ budgets }).catch((error) => {
      console.warn("[nivva] falha ao persistir orçamentos locais", error);
    });
  }, []);

  const getBudgetForPeriod = useCallback(
    (period: string) => state.budgets.find((budget) => budget.period === period),
    [state.budgets],
  );

  const getEffectiveLimit = useCallback(
    (period?: string, referenceDate?: Date) =>
      resolveEffectiveLimit(state.budgets, period ?? getCurrentBudgetPeriod(referenceDate)),
    [state.budgets],
  );

  const setBudgetForPeriod = useCallback(
    (period: string, limitInCents: number) => {
      const next = upsertMonthlyBudget(budgetsRef.current, period, limitInCents);
      persist(next);
      dispatch({ type: "replace-budgets", budgets: next });
    },
    [persist],
  );

  const clearNotice = useCallback(() => {
    dispatch({ type: "clear-notice" });
  }, []);

  const value = useMemo(
    () => ({
      budgets: state.budgets,
      notice: state.notice,
      getBudgetForPeriod,
      getEffectiveLimit,
      setBudgetForPeriod,
      clearNotice,
    }),
    [state.budgets, state.notice, getBudgetForPeriod, getEffectiveLimit, setBudgetForPeriod, clearNotice],
  );

  if (!state.isHydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget(): BudgetContextValue {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("useBudget precisa estar dentro de BudgetProvider");
  }

  return context;
}
