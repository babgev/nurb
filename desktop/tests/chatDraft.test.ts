import assert from "node:assert/strict";
import test from "node:test";
import {
  AttachmentDraft,
  restoreDraftFiles,
  restoreDraftText,
} from "../src/chatDraft.ts";

test("an auth failure preserves work composed during the failed turn", () => {
  assert.equal(
    restoreDraftText("Original message", "Next draft"),
    "Original message\n\nNext draft",
  );
  assert.equal(restoreDraftText("", "Next draft"), "Next draft");
  assert.equal(restoreDraftText("Original message", ""), "Original message");
  assert.deepEqual(
    restoreDraftFiles(["original.stl"], ["next.png", "original.stl"]),
    ["original.stl", "next.png"],
  );
});

test("submission waits for every paste already being saved", async () => {
  let shown: string[] = [];
  let finishFirst!: (paths: string[]) => void;
  let finishSecond!: (paths: string[]) => void;
  const first = new Promise<string[]>((resolve) => {
    finishFirst = resolve;
  });
  const second = new Promise<string[]>((resolve) => {
    finishSecond = resolve;
  });
  const draft = new AttachmentDraft((files) => {
    shown = files;
  });

  draft.track(first);
  draft.track(second);
  const submitted = draft.take();
  finishSecond(["second.png"]);
  finishFirst(["first.png"]);

  assert.deepEqual(await submitted, ["first.png", "second.png"]);
  assert.deepEqual(shown, []);
});


test("provider changes carry existing and pending attachments into the remounted composer", async () => {
  let finishPaste!: (paths: string[]) => void;
  const paste = new Promise<string[]>((resolve) => { finishPaste = resolve; });
  const original = new AttachmentDraft(() => {}, ["design.stl"]);
  original.track(paste);
  const transferred = original.take();
  finishPaste(["reference.png"]);
  const files = await transferred;
  const newComposer = new AttachmentDraft(() => {}, files);

  assert.equal(original.hasContent, false);
  assert.equal(newComposer.hasContent, true);
  assert.deepEqual(await newComposer.take(), ["design.stl", "reference.png"]);
  assert.deepEqual(files, ["design.stl", "reference.png"]);
});

test("a refused provider switch can restore the original attachments", async () => {
  let shown: string[] = [];
  const draft = new AttachmentDraft((files) => { shown = files; }, ["design.stl"]);
  const transferred = await draft.take();
  draft.restore(transferred);
  assert.deepEqual(shown, ["design.stl"]);
  assert.deepEqual(await draft.take(), ["design.stl"]);
});


test("opening another provider tab copies pending attachments without consuming the source draft", async () => {
  let finish!: (paths: string[]) => void;
  const draft = new AttachmentDraft(() => {}, ["model.stl"]);
  draft.track(new Promise<string[]>((resolve) => { finish = resolve; }));
  const copied = draft.snapshot();
  finish(["reference.png"]);
  assert.deepEqual(await copied, ["model.stl", "reference.png"]);
  assert.equal(draft.hasContent, true);
  assert.deepEqual(await draft.take(), ["model.stl", "reference.png"]);
});
