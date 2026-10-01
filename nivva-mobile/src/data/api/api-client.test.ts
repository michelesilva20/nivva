import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { apiRequest } from "./api-client";
import { ApiError } from "./api-error";

const originalFetch = globalThis.fetch;
const originalBaseUrl = process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = originalBaseUrl;
});

test("ProblemDetail 422 vira ApiError com status e detail", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        status: 422,
        title: "Invalid transaction",
        detail: "EXPENSE amountCents must be less than zero",
      }),
      { status: 422, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;

  await assert.rejects(
    () => apiRequest("/api/v1/transactions", { method: "POST", body: {} }),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 422);
      assert.equal(error.detail, "EXPENSE amountCents must be less than zero");
      assert.equal(error.message, "EXPENSE amountCents must be less than zero");
      return true;
    },
  );
});

test("falha de rede é distinguível de HTTP 500", async () => {
  process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL = "http://example.test";
  globalThis.fetch = (async () => {
    throw new TypeError("Network request failed");
  }) as typeof fetch;

  await assert.rejects(
    () => apiRequest("/api/v1/transactions"),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, undefined);
      assert.equal(error.isNetworkError, true);
      assert.equal(error.message, "Não foi possível conectar ao Nivva.");
      return true;
    },
  );
});
