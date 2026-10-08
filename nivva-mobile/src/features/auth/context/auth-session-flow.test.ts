import assert from "node:assert/strict";
import { test } from "node:test";

import { ApiError } from "@/data/api/api-error";
import { createAuthSession } from "@/data/auth/auth-session";
import { createMemoryTokenStore } from "@/data/auth/token-store";

import { restoreAuthSession } from "./auth-session-flow";

const user = { id: "u1", displayName: "Michele", email: "michele@email.com" };

test("sem token fica unauthenticated", async () => {
  const snapshot = await restoreAuthSession({
    tokenStore: createMemoryTokenStore(),
    session: createAuthSession(),
    repository: {
      register: async () => ({ accessToken: "t", user }),
      login: async () => ({ accessToken: "t", user }),
      me: async () => user,
    },
  });

  assert.equal(snapshot.status, "unauthenticated");
  assert.equal(snapshot.user, null);
});

test("token + me 200 autentica", async () => {
  const session = createAuthSession();
  const snapshot = await restoreAuthSession({
    tokenStore: createMemoryTokenStore("stored-token"),
    session,
    repository: {
      register: async () => ({ accessToken: "t", user }),
      login: async () => ({ accessToken: "t", user }),
      me: async () => user,
    },
  });

  assert.equal(snapshot.status, "authenticated");
  assert.equal(snapshot.user?.id, "u1");
  assert.equal(await session.getAccessToken(), "stored-token");
});

test("token + me 401 remove o token", async () => {
  const store = createMemoryTokenStore("expired");
  const session = createAuthSession();
  const snapshot = await restoreAuthSession({
    tokenStore: store,
    session,
    repository: {
      register: async () => ({ accessToken: "t", user }),
      login: async () => ({ accessToken: "t", user }),
      me: async () => {
        throw new ApiError({ message: "Authentication is required", status: 401 });
      },
    },
  });

  assert.equal(snapshot.status, "unauthenticated");
  assert.equal(await store.get(), null);
  assert.equal(await session.getAccessToken(), null);
});

test("token + network error não apaga o token", async () => {
  const store = createMemoryTokenStore("kept");
  const session = createAuthSession();
  const snapshot = await restoreAuthSession({
    tokenStore: store,
    session,
    repository: {
      register: async () => ({ accessToken: "t", user }),
      login: async () => ({ accessToken: "t", user }),
      me: async () => {
        throw new ApiError({ message: "Não foi possível conectar ao Nivva." });
      },
    },
  });

  assert.equal(snapshot.status, "unreachable");
  assert.equal(await store.get(), "kept");
  assert.equal(await session.getAccessToken(), "kept");
});
