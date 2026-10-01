export type ApiTransactionType = "INCOME" | "EXPENSE";

export type ApiTransactionResponse = {
  id: string;
  type: ApiTransactionType;
  title: string;
  categoryId: string;
  accountId: string;
  amountCents: number;
  occurredAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiTransactionWriteRequest = {
  type: ApiTransactionType;
  title: string;
  categoryId: string;
  accountId: string;
  amountCents: number;
  occurredAt: string;
  note: string | null;
};
