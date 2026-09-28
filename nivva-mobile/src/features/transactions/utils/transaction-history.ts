import type { Category, Transaction } from "@/domain/models";
import { isSameCalendarDay } from "@/shared/utils/format";

export type TransactionTypeFilter = "all" | "expense" | "income";

export type TransactionDaySection = {
  key: string;
  title: string;
  data: Transaction[];
};

export type TransactionHistoryQuery = {
  transactions: Transaction[];
  categories: Category[];
  searchQuery: string;
  typeFilter: TransactionTypeFilter;
  categoryId: string | "all";
  referenceDate?: Date;
};

export type TransactionHistoryResult = {
  sections: TransactionDaySection[];
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
};

export function sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}

export function filterTransactionsByType(
  transactions: Transaction[],
  typeFilter: TransactionTypeFilter,
): Transaction[] {
  if (typeFilter === "all") {
    return transactions;
  }

  return transactions.filter((transaction) => transaction.type === typeFilter);
}

export function filterTransactionsByCategory(
  transactions: Transaction[],
  categoryId: string | "all",
): Transaction[] {
  if (categoryId === "all") {
    return transactions;
  }

  return transactions.filter((transaction) => transaction.categoryId === categoryId);
}

export function searchTransactions(
  transactions: Transaction[],
  query: string,
  categories: Category[],
): Transaction[] {
  const needle = normalizeSearch(query);

  if (!needle) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const categoryName = categories.find((category) => category.id === transaction.categoryId)?.name ?? "";
    return normalizeSearch(`${transaction.title} ${categoryName}`).includes(needle);
  });
}

export function formatDaySectionTitle(date: Date, referenceDate: Date): string {
  if (isSameCalendarDay(date, referenceDate)) {
    return "Hoje";
  }

  const yesterday = new Date(referenceDate);
  yesterday.setDate(referenceDate.getDate() - 1);

  if (isSameCalendarDay(date, yesterday)) {
    return "Ontem";
  }

  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");

  if (date.getFullYear() !== referenceDate.getFullYear()) {
    return `${day} ${month} ${date.getFullYear()}`;
  }

  return `${day} ${month}`;
}

export function groupTransactionsByDay(
  transactions: Transaction[],
  referenceDate = new Date(),
): TransactionDaySection[] {
  const sections: TransactionDaySection[] = [];
  const indexByKey = new Map<string, number>();

  for (const transaction of transactions) {
    const occurred = new Date(transaction.occurredAt);
    const key = `${occurred.getFullYear()}-${occurred.getMonth()}-${occurred.getDate()}`;
    let index = indexByKey.get(key);

    if (index === undefined) {
      index = sections.length;
      indexByKey.set(key, index);
      sections.push({
        key,
        title: formatDaySectionTitle(occurred, referenceDate),
        data: [],
      });
    }

    sections[index]?.data.push(transaction);
  }

  return sections;
}

export function queryTransactions(input: TransactionHistoryQuery): TransactionHistoryResult {
  const filtered = searchTransactions(
    filterTransactionsByCategory(
      filterTransactionsByType(input.transactions, input.typeFilter),
      input.categoryId,
    ),
    input.searchQuery,
    input.categories,
  );
  const sorted = sortTransactionsByDate(filtered);

  return {
    sections: groupTransactionsByDay(sorted, input.referenceDate),
    totalCount: input.transactions.length,
    filteredCount: sorted.length,
    hasActiveFilters:
      input.searchQuery.trim().length > 0 || input.typeFilter !== "all" || input.categoryId !== "all",
  };
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
