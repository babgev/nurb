import assert from "node:assert/strict";
import test from "node:test";
import { mcpStatusLabel, parseMcpArgs, parseMcpValues } from "../src/mcpConfig.ts";

test("MCP arguments preserve spaces and quoting without shell parsing", () => {
  assert.deepEqual(parseMcpArgs('["--path", "folder with spaces", "$(not executed)"]'), ["--path", "folder with spaces", "$(not executed)"]);
  assert.throws(() => parseMcpArgs('{"command":"node"}'), /array of strings/);
  assert.throws(() => parseMcpArgs('["node", 1]'), /array of strings/);
});

test("MCP credential editor validates maps without including their contents in errors", () => {
  assert.deepEqual(parseMcpValues('{"TOKEN":"private value"}', "Environment"), { TOKEN: "private value" });
  for (const value of ['{"TOKEN":42}', 'null', '["private value"]', '{"":"private value"}', 'private value']) {
    assert.throws(() => parseMcpValues(value, "Environment"), (error: Error) => !error.message.includes("private value"));
  }
});

test("MCP labels distinguish zero tools and unchecked servers", () => {
  assert.equal(mcpStatusLabel({ state: "ready", toolCount: 0 }), "0 tools");
  assert.equal(mcpStatusLabel({ state: "ready", toolCount: 1 }), "1 tool");
  assert.equal(mcpStatusLabel({ state: "unchecked" }), "Not checked");
  assert.equal(mcpStatusLabel({ state: "error", toolCount: 12 }), "Error");
});
