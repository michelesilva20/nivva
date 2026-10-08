import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { apiRequest, createApiClient } from "./api-client";
import { ApiError } from "./api-error";

const originalFetch = globalThis.fetch;
const originalBaseUrl = process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = originalBaseUrl;
});

test("envia Bearer quando há token", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  let authorization: string | null = null;
  globalThis.fetch = (async (_url, init) => {
    authorization = new Headers(init?.headers).get("Authorization");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  const client = createApiClient({
    getAccessToken: async () => "token-a",
  });
  await client.request("/api/v1/me");
  assert.equal(authorization, "Bearer token-a");
});

test("401 autenticado dispara onUnauthorized", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  globalThis.fetch = (async () => new Response("{}", { status: 401 })) as typeof fetch;
  let unauthorized = false;

  await assert.rejects(
    () =>
      apiRequest("/api/v1/transactions", {}, {
        getAccessToken: async () => "token-a",
        onUnauthorized: () => {
          unauthorized = true;
        },
      }),
    (error: unknown) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(unauthorized, true);
});

test("401 sem token não dispara onUnauthorized", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  globalThis.fetch = (async () => new Response("{}", { status: 401 })) as typeof fetch;
  let unauthorized = false;

  await assert.rejects(
    () =>
      apiRequest("/api/v1/auth/login", { method: "POST", body: {} }, {
        onUnauthorized: () => {
          unauthorized = true;
        },
      }),
    (error: unknown) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(unauthorized, false);
});

test("falha de rede não dispara onUnauthorized", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  globalThis.fetch = (async () => {
    throw new TypeError("Network request failed");
  }) as typeof fetch;
  let unauthorized = false;

  await assert.rejects(
    () =>
      apiRequest("/api/v1/me", {}, {
        getAccessToken: async () => "token-a",
        onUnauthorized: () => {
          unauthorized = true;
        },
      }),
    (error: unknown) => error instanceof ApiError && error.isNetworkError,
  );
  assert.equal(unauthorized, false);
});
