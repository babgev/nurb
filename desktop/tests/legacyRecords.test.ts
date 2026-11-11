import assert from "node:assert/strict";
import test from "node:test";
import { previousConversations } from "../src/legacyRecords.ts";

test("removing tabs retains archived sessions and their unsent attachments without mutating storage", () => {
  const rows = [{ id: "archive", path: "/old/one", agent: "claude", title: "Original", sessionId: "s1" }];
  const source = { columns: [{ id: "tab", path: "/old/one", resume: "s1", agent: "claude", draft: { text: "Finish this", files: ["/old/photo.png", 3] } }] };
  const before = JSON.stringify(source);
  const result = previousConversations(rows, ["/old/one"], [source]);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].draft, { text: "Finish this", files: ["/old/photo.png"] });
  assert.equal(JSON.stringify(source), before);
  assert.equal("draft" in rows[0], false);
});

test("blank drafts and unavailable sessions remain visible, scoped to their original project", () => {
  const source = { columns: [{ id: "draft", path: "/old/one", agent: null, resume: null, draft: { text: "Unsent", files: [] } }], history: [{ id: "missing", path: "/old/one", agent: "codex", resume: "missing" }, { id: "other", path: "/old/two", resume: "s2" }] };
  const result = previousConversations([], ["/old/one"], [source, source]);
  assert.equal(result.length, 2);
  assert.equal(result[0].sessionId, undefined);
  assert.equal(result[0].draft?.text, "Unsent");
  assert.equal(result[1].sessionId, "missing");
});

test("migrated storage uses the preserved original path and provider", () => {
  const result = previousConversations([], ["/old/one"], [{ history: [{ id: "tab", path: "/new/project", legacyPath: "/old/one", legacySession: "s1", legacyAgent: "claude", agent: "codex" }] }]);
  assert.equal(result[0].agent, "claude");
  assert.equal(result[0].path, "/old/one");
  assert.equal(result[0].sessionId, "s1");
});

test("distinct drafts for the same conversation are both recoverable", () => {
  const columns = ["first", "second"].map((text) => ({ id: text, path: "/old/one", resume: "s1", agent: "claude", draft: { text, files: [] } }));
  const result = previousConversations([], ["/old/one"], [{ columns }, { columns }]);
  assert.deepEqual(result.map((row) => row.draft?.text), ["first", "second"]);
  assert.equal(new Set(result.map((row) => row.id)).size, 2);
});
