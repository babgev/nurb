import assert from "node:assert/strict";
import test from "node:test";
import { coalescedSave } from "../src/coalescedSave.ts";

test("continuous events save the latest snapshot without postponing the interval", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const saved: number[] = [];
  const saver = coalescedSave(async (value: number) => { saved.push(value); }, assert.fail);
  saver.update(1);
  t.mock.timers.tick(100);
  saver.update(2);
  t.mock.timers.tick(50);
  await Promise.resolve();
  assert.deepEqual(saved, [2]);
  saver.update(3);
  t.mock.timers.tick(100);
  saver.update(4);
  t.mock.timers.tick(50);
  await saver.flush();
  assert.deepEqual(saved, [2, 4]);
});

test("flush writes the pending draft and a failed write does not block later saves", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const failures: unknown[] = [];
  const saved: string[] = [];
  const saver = coalescedSave(async (value: string) => {
    if (value === "failed") throw new Error("disk busy");
    saved.push(value);
  }, (error) => failures.push(error));
  saver.update("failed");
  await saver.flush();
  assert.equal(failures.length, 1);
  saver.update("retained draft");
  await saver.flush();
  t.mock.timers.tick(1000);
  assert.deepEqual(saved, ["retained draft"]);
});
