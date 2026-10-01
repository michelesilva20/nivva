import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { money } from "@/domain/models";

import { createApiTransactionRepository } from "./api-transaction-repository";

const originalFetch = globalThis.fetch;
const originalBaseUrl = process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = originalBaseUrl;
});

function jsonResponse(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("list mapeia DTOs da API para Transaction", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  globalThis.fetch = (async () =>
    jsonResponse(200, [
      {
        id: "uuid-1",
        type: "EXPENSE",
        title: "Mercado",
        categoryId: "food",
        accountId: "main",
        amountCents: -10_000,
        occurredAt: "2026-09-29T16:30:00Z",
        note: null,
        createdAt: "2026-09-29T19:00:00Z",
        updatedAt: "2026-09-29T19:00:00Z",
      },
    ])) as typeof fetch;

  const listed = await createApiTransactionRepository().list();

  assert.equal(listed[0]?.id, "uuid-1");
  assert.equal(listed[0]?.type, "expense");
  assert.equal(listed[0]?.amount.cents, -10_000);
});

test("create usa o UUID do servidor", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  globalThis.fetch = (async () =>
    jsonResponse(201, {
      id: "UUID-123",
      type: "EXPENSE",
      title: "Mercado",
      categoryId: "food",
      accountId: "main",
      amountCents: -10_000,
      occurredAt: "2026-09-29T16:30:00Z",
      note: null,
      createdAt: "2026-09-29T19:00:00Z",
      updatedAt: "2026-09-29T19:00:00Z",
    })) as typeof fetch;

  const created = await createApiTransactionRepository().create({
    title: "Mercado",
    categoryId: "food",
    accountId: "main",
    amount: money(-10_000),
    occurredAt: "2026-09-29T13:30:00-03:00",
    type: "expense",
  });

  assert.equal(created.id, "UUID-123");
});

test("update devolve a versão do servidor com o mesmo id", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  globalThis.fetch = (async () =>
    jsonResponse(200, {
      id: "uuid-1",
      type: "EXPENSE",
      title: "Mercado",
      categoryId: "transport",
      accountId: "reserve",
      amountCents: -15_000,
      occurredAt: "2026-09-29T16:30:00Z",
      note: "Editado",
      createdAt: "2026-09-29T19:00:00Z",
      updatedAt: "2026-09-29T19:10:00Z",
    })) as typeof fetch;

  const updated = await createApiTransactionRepository().update({
    id: "uuid-1",
    title: "Mercado",
    categoryId: "transport",
    accountId: "reserve",
    amount: money(-15_000),
    occurredAt: "2026-09-29T16:30:00Z",
    type: "expense",
    note: "Editado",
  });

  assert.equal(updated.id, "uuid-1");
  assert.equal(updated.amount.cents, -15_000);
  assert.equal(updated.categoryId, "transport");
});

test("delete 204 não tenta parsear corpo", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  globalThis.fetch = (async () => new Response(null, { status: 204 })) as typeof fetch;

  await createApiTransactionRepository().remove("uuid-1");
});
