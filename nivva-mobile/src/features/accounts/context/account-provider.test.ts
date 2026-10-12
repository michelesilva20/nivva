import assert from "node:assert/strict";
import { test } from "node:test";

import { money, type Account } from "@/domain/models";

import { accountReducer, initialAccountState } from "./account-reducer";

const nubank: Account = {
  id: "8cc5f32a-1111-4111-8111-aaaaaaaaaaaa",
  name: "Nubank",
  type: "digital",
  openingBalance: money(250_000),
};

test("create rejeitado não altera a lista", () => {
  const state = { ...initialAccountState, loadStatus: "ready" as const };
  assert.equal(state.accounts.length, 0);
  const afterNotice = accountReducer(state, { type: "set-notice", notice: "Falha de rede" });
  assert.equal(afterNotice.accounts.length, 0);
});

test("hydration failure não vira lista vazia pronta", () => {
  const state = accountReducer(initialAccountState, { type: "hydrate-failed" });
  assert.equal(state.loadStatus, "error");
  assert.equal(state.accounts.length, 0);
});

test("user switch começa vazio e só hidrata as contas novas", () => {
  const userA = accountReducer(initialAccountState, { type: "hydrate", accounts: [nubank] });
  const reset = initialAccountState;
  const userB = accountReducer(reset, {
    type: "hydrate",
    accounts: [{ id: "bbbb", name: "Conta principal", type: "checking", openingBalance: money(0) }],
  });

  assert.equal(userA.accounts[0]?.name, "Nubank");
  assert.equal(userB.accounts[0]?.name, "Conta principal");
  assert.equal(userB.accounts.some((account) => account.id === nubank.id), false);
});
