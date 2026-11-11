import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AssistantMarkdown, Button } from "@nurb/ui";
import type { LegacyConversation } from "./legacyRecords";
import { saveToDownloads } from "./downloads";
import { legacyContext } from "./legacyContext";

type Archive = { messages: { role: string; content: string }[]; raw: string; note: string };

/** The original provider transcript remains readable without resuming it in a different engine. */
export default function LegacyChat({ conversation: chat, onContinue }: {
  conversation: LegacyConversation; onContinue: (draft: string) => void;
}) {
  const [archive, setArchive] = useState<Archive | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => {
    let stale = false;
    if (!chat.sessionId) { setArchive({ messages: [], raw: "", note: "" }); return; }
    invoke<Archive>("read_legacy_chat", { path: chat.path, sessionId: chat.sessionId, agent: chat.agent })
      .then((value) => { if (!stale) setArchive(value); })
      .catch((cause) => { if (!stale) setError(String(cause)); });
    return () => { stale = true; };
  }, [chat.path, chat.sessionId, chat.agent]);
  const continueChat = () => {
    const files = chat.draft?.files.length ? `Saved attachment paths (reattach these files if needed):\n${chat.draft.files.join("\n")}` : "";
    onContinue([legacyContext(archive?.messages ?? [], chat.draft?.text), files].filter(Boolean).join("\n\n"));
  };
  const firstVisible = Math.max(0, (archive?.messages.length ?? 0) - visibleCount);
  const downloadOriginal = async () => {
    if (!archive) return;
    try {
      await saveToDownloads("nurb-original-conversation.jsonl", new Blob([archive.raw], { type: "text/plain" }));
      setDownloaded(true);
    } catch (cause) { setError(`Could not save transcript: ${String(cause)}`); }
  };
  return <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-auto p-4 [overflow-wrap:anywhere] [&_pre]:max-w-full [&_pre]:overflow-auto">
      <div className="rounded-md border border-line p-3 text-chat text-muted">
        <strong className="text-ink">Saved conversation from Nurb 0.x</strong>
        <p>This original conversation is preserved. Add its recent context to your current draft to continue with the upgraded engine. Nothing is sent automatically.</p>
      </div>
      {chat.draft && <div className="rounded-md border border-line p-3 text-chat text-ink-soft"><strong>Unsent draft</strong><p className="whitespace-pre-wrap">{chat.draft.text}</p>{chat.draft.files.map((file) => <p key={file} className="break-all">{file}</p>)}</div>}
      {error && <p role="alert" className="text-chat text-muted">{error}</p>}
      {!archive && !error && <p className="text-chat text-muted">Loading saved conversation…</p>}
      {firstVisible > 0 && <Button onClick={() => setVisibleCount((count) => count + 50)}>Load earlier messages ({firstVisible} remaining)</Button>}
      {archive?.messages.slice(firstVisible).map((row, index) => <div key={firstVisible + index} className="min-w-0 text-chat text-ink-soft">
        <div className="mono-label text-muted">{row.role === "user" ? "You" : row.role === "assistant" ? chat.agent : row.role}</div>
        {row.role === "tool" ? <details><summary>Tool output</summary><pre className="whitespace-pre-wrap break-all">{row.content}</pre></details> : <AssistantMarkdown content={row.content} />}
      </div>)}
      {archive?.raw && <div><Button onClick={downloadOriginal}>Save original transcript</Button>{downloaded && <p className="text-chat text-muted">Saved to Downloads.</p>}</div>}
    </div>
    <div className="shrink-0 border-t border-line p-4"><Button disabled={!archive && !chat.draft} onClick={continueChat}>Add context to draft</Button></div>
  </section>;
}
