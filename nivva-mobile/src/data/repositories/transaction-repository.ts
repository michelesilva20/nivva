import type { Transaction } from "@/domain/models";

import { parseUserTransactions, serializeUserTransactions } from "./stored-finance";

/**
 * Contrato pequeno. A UI não conhece AsyncStorage nem a API futura.
 * Hoje a implementação grava no aparelho. Depois este mesmo contrato
 * aponta para REST / Spring Boot / PostgreSQL.
 */
export type TransactionRepository = {
  loadUserTransactions(): Promise<Transaction[]>;
  saveUserTransactions(transactions: Transaction[]): Promise<void>;
  clearUserTransactions(): Promise<void>;
};

export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export const FINANCE_TRANSACTIONS_STORAGE_KEY = "@nivva/finance/transactions:v1";

export function createTransactionRepository(storage: KeyValueStorage): TransactionRepository {
  return {
    async loadUserTransactions() {
      try {
        const raw = await storage.getItem(FINANCE_TRANSACTIONS_STORAGE_KEY);
        return parseUserTransactions(raw);
      } catch (error) {
        console.warn("[nivva] falha ao ler transações locais; usando estado inicial", error);
        return [];
      }
    },

    async saveUserTransactions(transactions) {
      await storage.setItem(FINANCE_TRANSACTIONS_STORAGE_KEY, serializeUserTransactions(transactions));
    },

    async clearUserTransactions() {
      await storage.removeItem(FINANCE_TRANSACTIONS_STORAGE_KEY);
    },
  };
}
