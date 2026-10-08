import assert from "node:assert/strict";
import { test } from "node:test";

import { ACCESS_TOKEN_STORAGE_KEY, createMemoryTokenStore } from "./token-store";

test("memory token store guarda e limpa o access token", async () => {
  const store = createMemoryTokenStore();
  assert.equal(await store.get(), null);
  await store.set("token-a");
  assert.equal(await store.get(), "token-a");
  await store.clear();
  assert.equal(await store.get(), null);
  assert.equal(ACCESS_TOKEN_STORAGE_KEY, "nivva.auth.access-token.v1");
  assert.match(ACCESS_TOKEN_STORAGE_KEY, /^[A-Za-z0-9._-]+$/);
});
