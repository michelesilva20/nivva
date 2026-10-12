import assert from "node:assert/strict";
import { test } from "node:test";

import { initialsFromDisplayName, LOCAL_DEMO_DISPLAY_NAME } from "./initials";

test("iniciais usam primeiro e último nome", () => {
  assert.equal(initialsFromDisplayName("Michele Silva"), "MS");
});

test("nome único usa até duas letras", () => {
  assert.equal(initialsFromDisplayName("Ana"), "AN");
});

test("ausência de nome não inventa iniciais", () => {
  assert.equal(initialsFromDisplayName(null), null);
  assert.equal(initialsFromDisplayName("   "), null);
});

test("identidade local demo é explícita", () => {
  assert.equal(initialsFromDisplayName(LOCAL_DEMO_DISPLAY_NAME), "ND");
});
