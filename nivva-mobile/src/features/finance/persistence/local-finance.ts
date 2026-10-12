import {
  money,
  type Account,
  type AccountView,
  type CreateTransactionInput,
  type NewExpenseInput,
  type NewIncomeInput,
  type Transaction,
} from "@/domain/models";
import { deriveAccountViews } from "@/features/finance/calculations/calculations";

export function toCreateExpenseInput(input: NewExpenseInput): CreateTransactionInput {
  return {
    title: input.title.trim(),
    categoryId: input.categoryId,
    accountId: input.accountId,
    amount: money(-Math.abs(input.amountInCents)),
    occurredAt: input.occurredAt,
    type: "expense",
    note: input.note?.trim() || undefined,
  };
}

export function toCreateIncomeInput(input: NewIncomeInput): CreateTransactionInput {
  return {
    title: input.title.trim(),
    categoryId: "income",
    accountId: input.accountId,
    amount: money(Math.abs(input.amountInCents)),
    occurredAt: input.occurredAt,
    type: "income",
    note: input.note?.trim() || undefined,
  };
}

export function mergeSeedAndUserTransactions(
  seedTransactions: Transaction[],
  userTransactions: Transaction[],
): Transaction[] {
  const userIds = new Set(userTransactions.map((transaction) => transaction.id));

  return [...userTransactions, ...seedTransactions.filter((transaction) => !userIds.has(transaction.id))];
}

export function resolveDisplayedTransactions(
  source: "local" | "api",
  seedTransactions: Transaction[],
  userTransactions: Transaction[],
): Transaction[] {
  if (source === "api") {
    return userTransactions;
  }

  return mergeSeedAndUserTransactions(seedTransactions, userTransactions);
}

export type TransactionEditInput = {
  title: string;
  amountInCents: number;
  categoryId: string;
  accountId: string;
  occurredAt: string;
  note?: string;
};

export function isUserOwnedTransaction(userTransactions: Transaction[], id: string): boolean {
  return userTransactions.some((transaction) => transaction.id === id);
}

export function applyTransactionEdits(existing: Transaction, input: TransactionEditInput): Transaction {
  return {
    id: existing.id,
    type: existing.type,
    title: input.title.trim(),
    categoryId: existing.type === "income" ? "income" : input.categoryId,
    accountId: input.accountId,
    amount: money(
      existing.type === "income" ? Math.abs(input.amountInCents) : -Math.abs(input.amountInCents),
    ),
    occurredAt: input.occurredAt,
    note: input.note?.trim() || undefined,
  };
}

export function replaceUserTransaction(
  userTransactions: Transaction[],
  next: Transaction,
): Transaction[] | null {
  const current = userTransactions.find((transaction) => transaction.id === next.id);

  if (!current || current.type !== next.type) {
    return null;
  }

  return userTransactions.map((transaction) => (transaction.id === next.id ? next : transaction));
}

export function removeUserTransaction(userTransactions: Transaction[], id: string): Transaction[] | null {
  if (!isUserOwnedTransaction(userTransactions, id)) {
    return null;
  }

  return userTransactions.filter((transaction) => transaction.id !== id);
}

/**
 * Saldos da semente já incluem as transações iniciais.
 * Só os movimentos locais do usuário entram neste cálculo.
 */
export function applyUserTransactionsToAccounts(
  seedAccounts: Account[],
  userTransactions: Transaction[],
): AccountView[] {
  return deriveAccountViews(seedAccounts, userTransactions);
}
