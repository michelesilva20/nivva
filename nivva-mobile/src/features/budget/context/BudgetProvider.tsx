import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { View } from "react-native";

import { useTheme } from "@/core/design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_MONTHLY_BUDGET_CENTS } from "@/data/mock/budget";
import { getTransactionSource } from "@/data/repositories/active-transaction-repository";
import { createBudgetRepository } from "@/data/repositories/budget-repository";
import { money, type Money, type MonthlyBudget } from "@/domain/models";
import { getCurrentBudgetPeriod } from "@/features/budget/calculations/budget-calculations";
import { upsertMonthlyBudget } from "@/features/budget/persistence/budget-mutations";

import { budgetReducer, type BudgetLoadStatus } from "./budget-reducer";

type BudgetContextValue = {
  budgets: MonthlyBudget[];
  notice: string | null;
  loadStatus: BudgetLoadStatus;
  getBudgetForPeriod: (period: string) => MonthlyBudget | undefined;
  isConfigured: (period?: string, referenceDate?: Date) => boolean;
  getDisplayLimit: (period?: string, referenceDate?: Date) => Money | null;
  setBudgetForPeriod: (period: string, limitInCents: number) => void;
  clearNotice: () => void;
};

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({
  children,
  userId = null,
}: {
  children: ReactNode;
  userId?: string | null;
}) {
  const { theme } = useTheme();
  const source = getTransactionSource();
  const repository = useMemo(() => createBudgetRepository(AsyncStorage, userId), [userId]);
  const [state, dispatch] = useReducer(budgetReducer, {
    budgets: [],
    notice: null,
    isHydrated: false,
    loadStatus: "ready",
  });
  const budgetsRef = useRef(state.budgets);
  budgetsRef.current = state.budgets;

  useEffect(() => {
    let cancelled = false;

    repository.load().then((result) => {
      if (!cancelled) {
        dispatch({
          type: "hydrate",
          budgets: result.budgets,
          loadStatus: result.status === "error" ? "error" : "ready",
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  const persist = useCallback((budgets: MonthlyBudget[]) => {
    budgetsRef.current = budgets;
    void repository.save({ budgets }).catch((error) => {
      console.warn("[nivva] falha ao persistir orçamentos locais", error);
    });
  }, [repository]);

  const getBudgetForPeriod = useCallback(
    (period: string) => state.budgets.find((budget) => budget.period === period),
    [state.budgets],
  );

  const isConfigured = useCallback(
    (period?: string, referenceDate?: Date) =>
      state.loadStatus === "ready" &&
      getBudgetForPeriod(period ?? getCurrentBudgetPeriod(referenceDate)) != null,
    [getBudgetForPeriod, state.loadStatus],
  );

  const getDisplayLimit = useCallback(
    (period?: string, referenceDate?: Date) => {
      if (state.loadStatus === "error") {
        return null;
      }

      const resolvedPeriod = period ?? getCurrentBudgetPeriod(referenceDate);
      const configured = getBudgetForPeriod(resolvedPeriod);
      if (configured) {
        return configured.limit;
      }

      if (source === "local") {
        return money(DEFAULT_MONTHLY_BUDGET_CENTS);
      }

      return null;
    },
    [getBudgetForPeriod, source, state.loadStatus],
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
      loadStatus: state.loadStatus,
      getBudgetForPeriod,
      isConfigured,
      getDisplayLimit,
      setBudgetForPeriod,
      clearNotice,
    }),
    [
      state.budgets,
      state.notice,
      state.loadStatus,
      getBudgetForPeriod,
      isConfigured,
      getDisplayLimit,
      setBudgetForPeriod,
      clearNotice,
    ],
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
