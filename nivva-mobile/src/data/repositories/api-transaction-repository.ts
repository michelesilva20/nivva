import { apiRequest } from "@/data/api/api-client";
import type { ApiTransactionResponse } from "@/data/api/api-transaction";
import { mapApiTransactionToDomain, mapCreateInputToApiRequest, mapTransactionToApiRequest } from "@/data/api/map-transaction";
import type { CreateTransactionInput, Transaction } from "@/domain/models";

import type { TransactionRepository } from "./transaction-repository";

const TRANSACTIONS_PATH = "/api/v1/transactions";

export function createApiTransactionRepository(): TransactionRepository {
  return {
    async list() {
      const payload = await apiRequest<ApiTransactionResponse[]>(TRANSACTIONS_PATH);
      return payload.map(mapApiTransactionToDomain);
    },

    async create(input: CreateTransactionInput) {
      const payload = await apiRequest<ApiTransactionResponse>(TRANSACTIONS_PATH, {
        method: "POST",
        body: mapCreateInputToApiRequest(input),
      });
      return mapApiTransactionToDomain(payload);
    },

    async update(transaction: Transaction) {
      const payload = await apiRequest<ApiTransactionResponse>(`${TRANSACTIONS_PATH}/${transaction.id}`, {
        method: "PUT",
        body: mapTransactionToApiRequest(transaction),
      });
      return mapApiTransactionToDomain(payload);
    },

    async remove(id: string) {
      await apiRequest<void>(`${TRANSACTIONS_PATH}/${id}`, {
        method: "DELETE",
      });
    },
  };
}
