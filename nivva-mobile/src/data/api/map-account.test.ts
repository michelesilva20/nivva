import assert from "node:assert/strict";
import { test } from "node:test";

import { money } from "@/domain/models";

import { mapAccountToApiRequest, mapApiAccountToDomain } from "./map-account";

test("preserva UUID e converte openingBalanceCents em Money", () => {
  const account = mapApiAccountToDomain({
    id: "8cc5f32a-1111-4111-8111-aaaaaaaaaaaa",
    name: "Nubank",
    type: "DIGITAL",
    openingBalanceCents: 250000,
    createdAt: "2026-10-01T12:00:00Z",
    updatedAt: "2026-10-01T12:00:00Z",
  });

  assert.equal(account.id, "8cc5f32a-1111-4111-8111-aaaaaaaaaaaa");
  assert.equal(account.name, "Nubank");
  assert.equal(account.type, "digital");
  assert.equal(account.openingBalance.cents, 250000);
  assert.equal("createdAt" in account, false);
});

test("mapeia type do domínio para o enum da API", () => {
  const request = mapAccountToApiRequest({
    name: "Caixa",
    type: "cash",
    openingBalance: money(0),
  });

  assert.deepEqual(request, {
    name: "Caixa",
    type: "CASH",
    openingBalanceCents: 0,
  });
});
