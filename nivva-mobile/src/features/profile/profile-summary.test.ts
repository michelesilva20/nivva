import assert from "node:assert/strict";
import { test } from "node:test";

import { formatProfileCount, profileCountFromLoad } from "./profile-summary";

test("loading e erro não viram zero", () => {
  assert.deepEqual(profileCountFromLoad("loading", 0), { status: "loading", value: null });
  assert.deepEqual(profileCountFromLoad("error", 3), { status: "error", value: null });
  assert.equal(formatProfileCount({ status: "loading", value: null }), "—");
  assert.equal(formatProfileCount({ status: "error", value: null }), "—");
});

test("ready usa a quantidade confirmada", () => {
  assert.deepEqual(profileCountFromLoad("ready", 0), { status: "ready", value: 0 });
  assert.equal(formatProfileCount({ status: "ready", value: 2 }), "2");
});
