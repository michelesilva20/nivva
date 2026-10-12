import {
  ACCOUNT_TYPE_LABELS,
  money,
  type Account,
  type AccountView,
  type AnalyticsPeriod,
  type Category,
  type ChartBar,
  type ExpenseCategory,
  type Money,
  type Transaction,
} from "@/domain/models";

export function calculateIncome(transactions: Transaction[]): Money {
  const cents = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount.cents, 0);

  return money(cents);
}

export function calculateExpenses(transactions: Transaction[]): Money {
  const cents = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Math.abs(transaction.amount.cents), 0);

  return money(cents);
}

export function calculateNetBalance(transactions: Transaction[]): Money {
  return money(calculateIncome(transactions).cents - calculateExpenses(transactions).cents);
}

export function calculateBalance(accounts: Array<{ balance: Money }>): Money {
  const cents = accounts.reduce((total, account) => total + account.balance.cents, 0);
  return money(cents);
}

export function deriveAccountViews(accounts: Account[], transactions: Transaction[]): AccountView[] {
  return accounts.map((account) => {
    const delta = transactions
      .filter((transaction) => transaction.accountId === account.id)
      .reduce((total, transaction) => total + transaction.amount.cents, 0);

    return {
      ...account,
      typeLabel: ACCOUNT_TYPE_LABELS[account.type],
      balance: money(account.openingBalance.cents + delta),
    };
  });
}

export function calculateAvailableBudget(spent: Money, budgetTotal: Money): Money {
  return money(Math.max(0, budgetTotal.cents - spent.cents));
}

export function calculateBudgetProgress(spent: Money, budgetTotal: Money): number {
  if (budgetTotal.cents <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, spent.cents / budgetTotal.cents));
}

export function filterByPeriod(
  transactions: Transaction[],
  period: AnalyticsPeriod,
  referenceDate: Date,
): Transaction[] {
  return transactions.filter((transaction) => isInPeriod(transaction.occurredAt, period, referenceDate));
}

export function calculateExpensesByCategory(
  transactions: Transaction[],
  categories: Category[],
): ExpenseCategory[] {
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const total = calculateExpenses(expenses).cents;

  return categories
    .filter((category) => category.kind !== "income")
    .map((category) => {
      const amountCents = expenses
        .filter((transaction) => transaction.categoryId === category.id)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount.cents), 0);

      return {
        id: category.id,
        name: category.name,
        amount: money(amountCents),
        percentage: total === 0 ? 0 : Math.round((amountCents / total) * 100),
        kind: category.kind,
        icon: category.icon,
      };
    })
    .filter((category) => category.amount.cents > 0)
    .sort((left, right) => right.amount.cents - left.amount.cents);
}

export function calculateMonthlyChart(transactions: Transaction[], referenceDate: Date): ChartBar[] {
  const months: ChartBar[] = [];
  const currentMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);

  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - offset, 1);
    const monthTransactions = transactions.filter((transaction) => {
      const occurred = new Date(transaction.occurredAt);
      return (
        transaction.type === "expense" &&
        occurred.getFullYear() === monthDate.getFullYear() &&
        occurred.getMonth() === monthDate.getMonth()
      );
    });

    months.push({
      label: new Intl.DateTimeFormat("pt-BR", { month: "short" })
        .format(monthDate)
        .replace(".", "")
        .replace(/^\w/, (letter) => letter.toUpperCase())
        .slice(0, 3),
      ratio: calculateExpenses(monthTransactions).cents,
      highlighted: offset === 0,
    });
  }

  const max = Math.max(...months.map((item) => item.ratio), 1);

  return months.map((item) => ({
    ...item,
    ratio: item.ratio / max,
  }));
}

export function calculateComparisonLabel(current: Money, previous: Money): string {
  if (previous.cents <= 0) {
    return "sem base anterior";
  }

  const change = (current.cents - previous.cents) / previous.cents;
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(change));

  return `${formatted} vs. mês anterior`;
}

export function toOccurredAt(date: Date, now = new Date()): string {
  const stamped = new Date(date);
  const sameDay =
    stamped.getFullYear() === now.getFullYear() &&
    stamped.getMonth() === now.getMonth() &&
    stamped.getDate() === now.getDate();

  if (sameDay) {
    stamped.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  } else {
    stamped.setHours(12, 0, 0, 0);
  }

  return stamped.toISOString();
}

export function sortByNewest(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}

function isInPeriod(occurredAt: string, period: AnalyticsPeriod, referenceDate: Date): boolean {
  const occurred = new Date(occurredAt);

  if (period === "year") {
    return occurred.getFullYear() === referenceDate.getFullYear();
  }

  if (period === "week") {
    const start = new Date(referenceDate);
    start.setDate(referenceDate.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const end = new Date(referenceDate);
    end.setHours(23, 59, 59, 999);
    return occurred >= start && occurred <= end;
  }

  return (
    occurred.getFullYear() === referenceDate.getFullYear() &&
    occurred.getMonth() === referenceDate.getMonth()
  );
}
