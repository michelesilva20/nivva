import assert from "node:assert/strict";
import { test } from "node:test";

import { ApiError } from "@/data/api/api-error";
import { money } from "@/domain/models";

import { createApiAccountRepository } from "./api-account-repository";

const response = {
  id: "8cc5f32a-1111-4111-8111-aaaaaaaaaaaa",
  name: "Nubank",
  type: "DIGITAL",
  openingBalanceCents: 250000,
  createdAt: "2026-10-01T12:00:00Z",
  updatedAt: "2026-10-01T12:00:00Z",
};

test("list mapeia contas da API", async () => {
  const repository = createApiAccountRepository({
    request: async () => [response],
  });

  const accounts = await repository.list();
  assert.equal(accounts[0]?.id, response.id);
  assert.equal(accounts[0]?.openingBalance.cents, 250000);
});

test("create envia o body mapeado", async () => {
  let body: unknown;
  const repository = createApiAccountRepository({
    request: async (_path, options) => {
      body = options?.body;
      return response;
    },
  });

  await repository.create({ name: "Nubank", type: "digital", openingBalance: money(250000) });
  assert.deepEqual(body, { name: "Nubank", type: "DIGITAL", openingBalanceCents: 250000 });
});

test("update e delete usam o id da conta", async () => {
  const paths: string[] = [];
  const repository = createApiAccountRepository({
    request: async (path) => {
      paths.push(path);
      return response;
    },
  });

  await repository.update({
    id: response.id,
    name: "Nubank",
    type: "digital",
    openingBalance: money(250000),
  });
  await repository.remove(response.id);

  assert.equal(paths[0], `/api/v1/accounts/${response.id}`);
  assert.equal(paths[1], `/api/v1/accounts/${response.id}`);
});

test("409 de exclusão preserva status e detail", async () => {
  const repository = createApiAccountRepository({
    request: async () => {
      throw new ApiError({
        message: "Account has transactions and cannot be deleted.",
        status: 409,
        detail: "Account has transactions and cannot be deleted.",
      });
    },
  });

  await assert.rejects(
    () => repository.remove(response.id),
    (error: unknown) => error instanceof ApiError && error.status === 409,
  );
});

test("falha de rede sobe sem status", async () => {
  const repository = createApiAccountRepository({
    request: async () => {
      throw new ApiError({ message: "Não foi possível conectar ao Nivva." });
    },
  });

  await assert.rejects(
    () => repository.list(),
    (error: unknown) => error instanceof ApiError && error.status == null,
  );
});
