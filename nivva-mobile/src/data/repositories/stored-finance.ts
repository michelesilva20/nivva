import { money, type Transaction } from "@/domain/models";

export type StoredFinanceDataV1 = {
  version: 1;
  transactions: Transaction[];
};

export function serializeUserTransactions(transactions: Transaction[]): string {
  const payload: StoredFinanceDataV1 = {
    version: 1,
    transactions,
  };

  return JSON.stringify(payload);
}

export function parseUserTransactions(raw: string | null): Transaction[] {
  if (raw == null || raw.trim() === "") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isStoredFinanceDataV1(parsed)) {
      console.warn("[nivva] storage financeiro inválido; usando estado inicial");
      return [];
    }

    return parsed.transactions
      .map(normalizeTransaction)
      .filter((transaction): transaction is Transaction => transaction !== null);
  } catch (error) {
    console.warn("[nivva] JSON financeiro inválido; usando estado inicial", error);
    return [];
  }
}

function isStoredFinanceDataV1(value: unknown): value is { version: 1; transactions: unknown[] } {
  return isRecord(value) && value.version === 1 && Array.isArray(value.transactions);
}

function normalizeTransaction(value: unknown): Transaction | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || value.id.length === 0) {
    return null;
  }

  if (typeof value.title !== "string") {
    return null;
  }

  if (typeof value.categoryId !== "string" || typeof value.accountId !== "string") {
    return null;
  }

  if (typeof value.occurredAt !== "string" || Number.isNaN(Date.parse(value.occurredAt))) {
    return null;
  }

  if (value.type !== "income" && value.type !== "expense") {
    return null;
  }

  if (!isRecord(value.amount) || typeof value.amount.cents !== "number" || !Number.isInteger(value.amount.cents)) {
    return null;
  }

  const cents = value.amount.cents;
  const transaction: Transaction = {
    id: value.id,
    title: value.title,
    categoryId: value.categoryId,
    accountId: value.accountId,
    amount: money(cents),
    occurredAt: value.occurredAt,
    type: value.type,
  };

  if (typeof value.note === "string" && value.note.length > 0) {
    transaction.note = value.note;
  }

  return transaction;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
