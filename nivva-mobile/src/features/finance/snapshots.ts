import type { Account, AnalyticsPeriod, Category, HomeSnapshot, Transaction, WalletSnapshot } from "@/domain/models";
import { money } from "@/domain/models";
import { formatExpenseDate } from "@/shared/utils/format";

import {
  calculateAvailableBudget,
  calculateBalance,
  calculateBudgetProgress,
  calculateComparisonLabel,
  calculateExpenses,
  calculateExpensesByCategory,
  calculateIncome,
  calculateMonthlyChart,
  filterByPeriod,
  sortByNewest,
} from "./calculations/calculations";

type FinanceSnapshotInput = {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgetTotalCents: number;
  referenceDate: Date;
};

export function buildHomeSnapshot(input: FinanceSnapshotInput): HomeSnapshot {
  const monthly = filterByPeriod(input.transactions, "month", input.referenceDate);
  const income = calculateIncome(monthly);
  const expenses = calculateExpenses(monthly);
  const available = calculateAvailableBudget(expenses, money(input.budgetTotalCents));

  return {
    balance: calculateBalance(input.accounts),
    balanceVariationLabel: "2,4% este mês",
    metrics: [
      { label: "Receitas", amount: income, kind: "income" },
      { label: "Despesas", amount: expenses, kind: "expense" },
      { label: "Ainda posso gastar", amount: available, kind: "available" },
    ],
    insight: {
      message: "Você gastou 12% menos em alimentação este mês.",
    },
    transactions: sortByNewest(input.transactions).slice(0, 3),
    profileInitials: "MS",
  };
}

export function buildAnalyticsSnapshot(input: FinanceSnapshotInput, period: AnalyticsPeriod) {
  const current = filterByPeriod(input.transactions, period, input.referenceDate);
  const previousMonthDate = new Date(input.referenceDate.getFullYear(), input.referenceDate.getMonth() - 1, 1);
  const previous = filterByPeriod(input.transactions, "month", previousMonthDate);
  const spent = calculateExpenses(current);
  const budgetTotal = money(input.budgetTotalCents);

  return {
    totalExpenses: spent,
    comparisonLabel: calculateComparisonLabel(spent, calculateExpenses(previous)),
    chart: calculateMonthlyChart(input.transactions, input.referenceDate),
    budget: {
      spent,
      total: budgetTotal,
      available: calculateAvailableBudget(spent, budgetTotal),
      usageRatio: calculateBudgetProgress(spent, budgetTotal),
    },
    categories: calculateExpensesByCategory(current, input.categories),
  };
}

export function buildWalletSnapshot(input: FinanceSnapshotInput): WalletSnapshot {
  const monthlyExpenses = sortByNewest(
    filterByPeriod(input.transactions, "month", input.referenceDate).filter(
      (transaction) => transaction.type === "expense",
    ),
  );
  const newestExpense = monthlyExpenses[0];

  return {
    accounts: input.accounts,
    transactions: monthlyExpenses,
    historyLabel: newestExpense
      ? formatExpenseDate(new Date(newestExpense.occurredAt), input.referenceDate)
      : "Sem movimentações",
  };
}
