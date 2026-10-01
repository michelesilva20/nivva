import type { CreateTransactionInput, Transaction } from "@/domain/models";

import { parseUserTransactions, serializeUserTransactions } from "./stored-finance";

/**
 * Persistência de transações do usuário.
 * A UI e o FinanceProvider não conhecem AsyncStorage nem HTTP.
 * Quem implementa resolve a identidade no create().
 */
export type TransactionRepository = {
  list(): Promise<Transaction[]>;
  create(input: CreateTransactionInput): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  remove(id: string): Promise<void>;
};

export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export const FINANCE_TRANSACTIONS_STORAGE_KEY = "@nivva/finance/transactions:v1";

export type LocalTransactionRepository = TransactionRepository & {
  clear(): Promise<void>;
};

export function createTransactionRepository(storage: KeyValueStorage): LocalTransactionRepository {
  async function readAll(): Promise<Transaction[]> {
    try {
      const raw = await storage.getItem(FINANCE_TRANSACTIONS_STORAGE_KEY);
      return parseUserTransactions(raw);
    } catch (error) {
      console.warn("[nivva] falha ao ler transações locais; usando estado inicial", error);
      return [];
    }
  }

  async function writeAll(transactions: Transaction[]): Promise<void> {
    await storage.setItem(FINANCE_TRANSACTIONS_STORAGE_KEY, serializeUserTransactions(transactions));
  }

  return {
    list: readAll,

    async create(input) {
      const current = await readAll();
      const created: Transaction = {
        id: `${input.type}-${Date.now()}`,
        title: input.title,
        categoryId: input.categoryId,
        accountId: input.accountId,
        amount: input.amount,
        occurredAt: input.occurredAt,
        type: input.type,
        note: input.note,
      };
      await writeAll([created, ...current]);
      return created;
    },

    async update(transaction) {
      const current = await readAll();
      const existing = current.find((item) => item.id === transaction.id);

      if (!existing || existing.type !== transaction.type) {
        throw new Error("Este lançamento não pode ser editado.");
      }

      const next = current.map((item) => (item.id === transaction.id ? transaction : item));
      await writeAll(next);
      return transaction;
    },

    async remove(id) {
      const current = await readAll();

      if (!current.some((item) => item.id === id)) {
        throw new Error("Este lançamento não pode ser excluído.");
      }

      await writeAll(current.filter((item) => item.id !== id));
    },

    async clear() {
      await storage.removeItem(FINANCE_TRANSACTIONS_STORAGE_KEY);
    },
  };
}
