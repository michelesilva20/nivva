import assert from "node:assert/strict";
import { test } from "node:test";

import { ApiError } from "@/data/api/api-error";

import { createAuthRepository } from "./auth-repository";

test("register success devolve token e user", async () => {
  const repository = createAuthRepository({
    request: async () => ({
      accessToken: "token-a",
      tokenType: "Bearer",
      expiresInSeconds: 3600,
      user: { id: "u1", displayName: "Michele", email: "michele@email.com" },
    }),
  });

  const result = await repository.register({
    displayName: "Michele",
    email: "michele@email.com",
    password: "senha-segura",
  });

  assert.equal(result.accessToken, "token-a");
  assert.equal(result.user.displayName, "Michele");
});

test("login success devolve token", async () => {
  const repository = createAuthRepository({
    request: async () => ({
      accessToken: "token-b",
      tokenType: "Bearer",
      expiresInSeconds: 3600,
      user: { id: "u1", displayName: "Michele", email: "michele@email.com" },
    }),
  });

  const result = await repository.login({ email: "michele@email.com", password: "senha-segura" });
  assert.equal(result.accessToken, "token-b");
});

test("me success devolve o usuário", async () => {
  const repository = createAuthRepository({
    request: async () => ({ id: "u1", displayName: "Michele", email: "michele@email.com" }),
  });

  const user = await repository.me();
  assert.equal(user.id, "u1");
});

test("login 401 usa copy genérica", async () => {
  const repository = createAuthRepository({
    request: async () => {
      throw new ApiError({ message: "Unauthorized", status: 401 });
    },
  });

  await assert.rejects(() => repository.login({ email: "a@b.com", password: "x" }), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.message, "Email ou senha inválidos.");
    return true;
  });
});

test("register 409 preserva status", async () => {
  const repository = createAuthRepository({
    request: async () => {
      throw new ApiError({ message: "Este email já está cadastrado.", status: 409 });
    },
  });

  await assert.rejects(() => repository.register({ displayName: "A", email: "a@b.com", password: "senha-segura" }), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 409);
    return true;
  });
});

test("network error sobe sem status", async () => {
  const repository = createAuthRepository({
    request: async () => {
      throw new ApiError({ message: "Não foi possível conectar ao Nivva." });
    },
  });

  await assert.rejects(() => repository.me(), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.isNetworkError, true);
    return true;
  });
});
