import assert from "node:assert/strict";
import { test } from "node:test";

import { ApiError } from "@/data/api/api-error";

import { nextSavingState, resolveAuthFormError, validateAuthForm } from "./auth-form-logic";

test("valida nome, email e senha mínima", () => {
  assert.equal(
    validateAuthForm({ includeName: true, displayName: "A", email: "a@b.com", password: "senha-segura" }),
    "Informe seu nome.",
  );
  assert.equal(
    validateAuthForm({ includeName: false, displayName: "", email: "", password: "senha-segura" }),
    "Informe seu email.",
  );
  assert.equal(
    validateAuthForm({ includeName: false, displayName: "", email: "a@b.com", password: "123" }),
    "A senha precisa ter pelo menos 8 caracteres.",
  );
  assert.equal(
    validateAuthForm({ includeName: false, displayName: "", email: "a@b.com", password: "senha-segura" }),
    null,
  );
});

test("erro de credenciais e de rede usam copy de produto", () => {
  assert.equal(
    resolveAuthFormError(new ApiError({ message: "Email ou senha inválidos.", status: 401 })),
    "Email ou senha inválidos.",
  );
  assert.equal(
    resolveAuthFormError(new ApiError({ message: "Não foi possível conectar ao Nivva." })),
    "Não foi possível conectar ao Nivva.",
  );
  assert.equal(resolveAuthFormError(new Error("boom")), "Não foi possível conectar ao Nivva.");
});

test("submit em andamento não reabre", () => {
  assert.equal(nextSavingState(false), true);
  assert.equal(nextSavingState(true), true);
});
