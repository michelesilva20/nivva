import { localTransactionRepository } from "./async-storage-transaction-repository";
import { createApiTransactionRepository } from "./api-transaction-repository";
import type { TransactionRepository } from "./transaction-repository";

export type TransactionSource = "local" | "api";

export function getTransactionSource(): TransactionSource {
  return process.env.EXPO_PUBLIC_TRANSACTION_SOURCE === "api" ? "api" : "local";
}

export function createActiveTransactionRepository(
  source: TransactionSource = getTransactionSource(),
): TransactionRepository {
  if (source === "api") {
    return createApiTransactionRepository();
  }

  return localTransactionRepository;
}

export const activeTransactionRepository = createActiveTransactionRepository();
