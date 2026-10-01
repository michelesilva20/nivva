import assert from "node:assert/strict";
import { test } from "node:test";

import { money } from "@/domain/models";

import type { ApiTransactionResponse } from "./api-transaction";
import { mapApiTransactionToDomain, mapCreateInputToApiRequest } from "./map-transaction";

const expenseResponse: ApiTransactionResponse = {
  id: "8d3a1eb2-defa-4a45-93d3-7cd7b345dd09",
  type: "EXPENSE",
  title: "Mercado",
  categoryId: "food",
  accountId: "main",
  amountCents: -10_000,
  occurredAt: "2026-09-29T16:30:00Z",
  note: null,
  createdAt: "2026-09-29T19:58:41.132Z",
  updatedAt: "2026-09-29T19:58:41.132Z",
};

test("API EXPENSE vira domain expense com Money e UUID", () => {
  const transaction = mapApiTransactionToDomain(expenseResponse);

  assert.equal(transaction.id, "8d3a1eb2-defa-4a45-93d3-7cd7b345dd09");
  assert.equal(transaction.type, "expense");
  assert.equal(transaction.amount.cents, -10_000);
  assert.equal(transaction.note, undefined);
  assert.equal(transaction.occurredAt, "2026-09-29T16:30:00Z");
});

test("API INCOME vira domain income", () => {
  const transaction = mapApiTransactionToDomain({
    ...expenseResponse,
    type: "INCOME",
    title: "Freelance",
    categoryId: "income",
    amountCents: 100_000,
    note: "extra",
  });

  assert.equal(transaction.type, "income");
  assert.equal(transaction.amount.cents, 100_000);
  assert.equal(transaction.note, "extra");
});

test("create expense envia type e amountCents da API", () => {
  const request = mapCreateInputToApiRequest({
    title: "Mercado",
    categoryId: "food",
    accountId: "main",
    amount: money(-10_000),
    occurredAt: "2026-09-29T13:30:00-03:00",
    type: "expense",
  });

  assert.equal(request.type, "EXPENSE");
  assert.equal(request.amountCents, -10_000);
  assert.equal(request.note, null);
});

test("create income envia INCOME positivo", () => {
  const request = mapCreateInputToApiRequest({
    title: "Freelance",
    categoryId: "income",
    accountId: "main",
    amount: money(100_000),
    occurredAt: "2026-09-29T14:00:00-03:00",
    type: "income",
    note: "pix",
  });

  assert.equal(request.type, "INCOME");
  assert.equal(request.amountCents, 100_000);
  assert.equal(request.note, "pix");
});
