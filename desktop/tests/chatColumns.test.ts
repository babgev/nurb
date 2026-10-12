import assert from "node:assert/strict";
import test from "node:test";
import {
  chatKey,
  closeChatTab,
  markChatSeen,
  readChatTabs,
  selectedChat,
  updateChatActivity,
  type ChatColumn,
} from "../src/chatColumns.ts";

const fresh = (id = "first", path = "/projects/alpha"): ChatColumn => ({
  id, path, part: "bracket", agent: "claude", resume: null, unseen: false,
});

test("busy state and unread completion belong to one tab, not its siblings", () => {
  const columns = [fresh(), fresh("second")];
  const completed = updateChatActivity(columns, "first", "claude", false, false, true);
  assert.equal(completed[0].unseen, true);
  assert.equal(completed[1], columns[1]);
  assert.equal(markChatSeen(completed, "second"), completed);
  assert.equal(markChatSeen(completed, "first")[0].unseen, false);
});

test("starting a turn pins only the selected tab's resolved agent", () => {
  const columns = [{ ...fresh(), agent: null }, fresh("second")];
  const next = updateChatActivity(columns, "first", "codex", true, true, false);
  assert.equal(next[0].agent, "codex");
  assert.equal(next[1].agent, "claude");
});

test("an initial idle report does not invent unread work", () => {
  const columns = [fresh()];
  assert.equal(updateChatActivity(columns, "first", "claude", false, false, false), columns);
});

test("saved tabs restore each provider, session, draft, model, and effort independently", () => {
  const columns = [
    { ...fresh(), resume: "session-a", model: "Opus 5.5", config: { model: "opus", thought_level: "high" }, draft: { text: "Keep this draft", files: ["/projects/alpha/reference.png"] } },
    { ...fresh("second"), agent: "codex", resume: "session-b", config: { model: "gpt-current", thought_level: "medium" }, draft: { text: "Another draft", files: [] } },
  ];
  const state = readChatTabs(JSON.stringify({ columns, selected: { [chatKey(columns[0].path, "bracket")]: "second" } }));
  assert.equal(state.columns.length, 2);
  assert.deepEqual(state.columns[0].draft, columns[0].draft);
  assert.deepEqual(state.columns[0].config, columns[0].config);
  assert.deepEqual(state.columns[1].config, columns[1].config);
  assert.equal(selectedChat(state.columns, state.selected, columns[0].path, "bracket")?.resume, "session-b");
});

test("switching project or part uses each scope's remembered tab", () => {
  const columns = [fresh(), fresh("second"), fresh("other", "/projects/beta"), { ...fresh("part"), part: "lid" }];
  const selected = { [chatKey("/projects/alpha", "bracket")]: "second" };
  assert.equal(selectedChat(columns, selected, "/projects/alpha", "bracket")?.id, "second");
  assert.equal(selectedChat(columns, selected, "/projects/beta", "bracket")?.id, "other");
  assert.equal(selectedChat(columns, selected, "/projects/alpha", "lid")?.id, "part");
});

test("closing selected tab selects a neighbor without altering its session or draft", () => {
  const nextTab = { ...fresh("second"), resume: "retained", draft: { text: "Retain", files: [] } };
  const key = chatKey(nextTab.path, nextTab.part);
  const next = closeChatTab({ columns: [fresh(), nextTab], selected: { [key]: "first" } }, "first");
  assert.deepEqual(next.columns, [nextTab]);
  assert.equal(next.selected[key], "second");
  assert.equal(closeChatTab(next, "second"), next);
});

test("corrupt storage and stale or cross-project selections are ignored safely", () => {
  assert.deepEqual(readChatTabs("broken"), { columns: [], selected: {} });
  const parsed = readChatTabs(JSON.stringify({ columns: [fresh(), fresh(), { id: 5 }], selected: { [chatKey("/projects/beta", "bracket")]: "first" } }));
  assert.equal(parsed.columns.length, 1);
  assert.deepEqual(parsed.selected, {});
});
