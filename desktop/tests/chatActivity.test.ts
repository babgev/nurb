import assert from "node:assert/strict";
import test from "node:test";
import { activityStatus, elapsedLabel, mergeTool } from "../src/chatActivity.ts";

test("tool updates without an opening event create visible activity, later updates retain details", () => {
  const first = mergeTool(undefined, { id: "t1", title: "Bash", status: "in_progress", input: "nurb build lid" }, 1000);
  const done = mergeTool(first, { id: "t1", status: "completed", output: "Built lid" }, 4500);
  assert.equal(done.input, "nurb build lid");
  assert.equal(done.title, "Bash");
  assert.equal(done.startedAt, 1000);
  assert.equal(done.finishedAt, 4500);
  assert.equal(mergeTool(undefined, { id: "old", status: "completed" }, 5000, true).startedAt, undefined);
});

test("silence is reported honestly and permission/start/stop phases take priority", () => {
  const state = { label: "Claude", starting: false, restoring: false, cancelling: false, permission: false, phase: "Receiving response", lastEventAt: 1000, now: 22000, tools: [] };
  assert.equal(activityStatus(state).quiet, true);
  assert.match(activityStatus(state).detail, /No new activity reported for 21s/);
  assert.equal(activityStatus({ ...state, permission: true }).quiet, false);
  assert.equal(activityStatus({ ...state, permission: true }).title, "Waiting for your permission");
  assert.equal(activityStatus({ ...state, cancelling: true }).title, "Stop requested");
  assert.equal(activityStatus({ ...state, starting: true, phase: "", restoring: true }).title, "Restoring conversation");
  const tool = mergeTool(undefined, { id: "1", title: "Bash", status: "in_progress" }, 0);
  assert.equal(activityStatus({ ...state, tools: [tool] }).title, "Bash");
  assert.equal(activityStatus({ ...state, tools: [mergeTool(tool, { id: "1", status: "completed" }, 2000)] }).title, "Receiving response");
  assert.equal(elapsedLabel(127000), "2m 7s");
});
