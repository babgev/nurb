import assert from "node:assert/strict";
import test from "node:test";
import { legacyContext } from "../src/legacyContext.ts";

test("short archive carries complete spoken context and original unsent draft", () => {
  const result = legacyContext([{ role: "user", content: "Question" }, { role: "tool", content: "Noise" }, { role: "assistant", content: "Answer" }], "Unsent");
  assert.match(result, /user: Question\n\nassistant: Answer/);
  assert.match(result, /Unsent draft preserved.*\nUnsent/);
  assert.doesNotMatch(result, /Noise|Recent excerpt/);
});

test("bounded context keeps newest whole messages and explicitly names omitted history", () => {
  const messages = [{ role: "user", content: "Older" }, { role: "assistant", content: "Newest" }];
  const result = legacyContext(messages, "Keep this draft", "assistant: Newest".length);
  assert.match(result, /Recent excerpt only/);
  assert.match(result, /assistant: Newest/);
  assert.doesNotMatch(result, /user: Older/);
  assert.match(result, /Keep this draft/);
  assert.equal(messages[0].content, "Older");
});

test("one oversized message is bounded with disclosure and never loses the unsent draft", () => {
  const result = legacyContext([{ role: "user", content: "x".repeat(1000) }], "Original draft", 20);
  assert.match(result, /oversized message were omitted/);
  assert.match(result, /user: x{14}\n/);
  assert.doesNotMatch(result, /x{15}/);
  assert.match(result, /Original draft/);
});
