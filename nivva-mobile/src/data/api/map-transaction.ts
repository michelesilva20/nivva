import type { CreateTransactionInput, Transaction } from "@/domain/models";
import { money } from "@/domain/models";

import type { ApiTransactionResponse, ApiTransactionType, ApiTransactionWriteRequest } from "./api-transaction";

export function mapApiTransactionToDomain(response: ApiTransactionResponse): Transaction {
  const transaction: Transaction = {
    id: response.id,
    title: response.title,
    categoryId: response.categoryId,
    accountId: response.accountId,
    amount: money(response.amountCents),
    occurredAt: response.occurredAt,
    type: response.type === "INCOME" ? "income" : "expense",
  };

  if (response.note) {
    transaction.note = response.note;
  }

  return transaction;
}

export function mapCreateInputToApiRequest(input: CreateTransactionInput): ApiTransactionWriteRequest {
  return {
    type: toApiType(input.type),
    title: input.title,
    categoryId: input.categoryId,
    accountId: input.accountId,
    amountCents: input.amount.cents,
    occurredAt: input.occurredAt,
    note: input.note ?? null,
  };
}

export function mapTransactionToApiRequest(transaction: Transaction): ApiTransactionWriteRequest {
  return {
    type: toApiType(transaction.type),
    title: transaction.title,
    categoryId: transaction.categoryId,
    accountId: transaction.accountId,
    amountCents: transaction.amount.cents,
    occurredAt: transaction.occurredAt,
    note: transaction.note ?? null,
  };
}

function toApiType(type: Transaction["type"]): ApiTransactionType {
  return type === "income" ? "INCOME" : "EXPENSE";
}
