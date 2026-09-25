import type { Money } from "./money";

export type TransactionType = "income" | "expense";

/**
 * Movimento financeiro.
 * `amount.cents` é inteiro: positivo para receita, negativo para despesa.
 * Ex.: R$ 129,90 de gasto = -12990.
 */
export type Transaction = {
  id: string;
  title: string;
  categoryId: string;
  accountId: string;
  amount: Money;
  occurredAt: string;
  type: TransactionType;
  note?: string;
};

export type NewExpenseInput = {
  title: string;
  amountInCents: number;
  categoryId: string;
  accountId: string;
  occurredAt: string;
  note?: string;
};
