import { useEffect, useState, type ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AssistantMarkdown, Button } from "@nurb/ui";
import type { ChatColumn } from "./chatColumns";
import { saveToDownloads } from "./downloads";
import { legacyContext } from "./legacyContext";

type Archive = { messages: { role: string; content: string }[]; raw: string; note: string };

/** The original provider transcript remains readable without resuming it in a different engine. */
export default function LegacyChat({ tab, hidden, tabBar, onContinue }: {
  tab: ChatColumn; hidden: boolean; tabBar: ReactNode; onContinue: (draft: string) => void;
}) {
  const [archive, setArchive] = useState<Archive | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => {
    let stale = false;
    invoke<Archive>("read_legacy_chat", { path: tab.legacyPath, sessionId: tab.legacySession, agent: tab.legacyAgent ?? tab.agent ?? "claude" })
      .then((value) => { if (!stale) setArchive(value); })
      .catch((cause) => { if (!stale) setError(String(cause)); });
    return () => { stale = true; };
  }, [tab.legacyPath, tab.legacySession, tab.legacyAgent, tab.agent]);
  const continueChat = () => {
    onContinue(legacyContext(archive?.messages ?? [], tab.draft?.text));
  };
  const firstVisible = Math.max(0, (archive?.messages.length ?? 0) - visibleCount);
  const downloadOriginal = async () => {
    if (!archive) return;
    try {
      await saveToDownloads("nurb-original-conversation.jsonl", new Blob([archive.raw], { type: "text/plain" }));
      setDownloaded(true);
    } catch (cause) { setError(`Could not save transcript: ${String(cause)}`); }
  };
  return <section className="fork-chat panel" hidden={hidden}>
    {tabBar}
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-auto p-4 [overflow-wrap:anywhere] [&_pre]:max-w-full [&_pre]:overflow-auto">
      <div className="rounded-md border border-line p-3 text-chat text-muted">
        <strong className="text-ink">Saved conversation from Nurb 0.x</strong>
        <p>This original conversation is preserved. Continue in a new tab to work with the upgraded engine; recent conversation context will be placed in your draft for review.</p>
      </div>
      {error && <p role="alert" className="text-chat text-muted">{error}</p>}
      {!archive && !error && <p className="text-chat text-muted">Loading saved conversation…</p>}
      {firstVisible > 0 && <Button onClick={() => setVisibleCount((count) => count + 50)}>Load earlier messages ({firstVisible} remaining)</Button>}
      {archive?.messages.slice(firstVisible).map((row, index) => <div key={firstVisible + index} className="min-w-0 text-chat text-ink-soft">
        <div className="mono-label text-muted">{row.role === "user" ? "You" : row.role === "assistant" ? tab.legacyAgent ?? tab.agent ?? "Agent" : row.role}</div>
        {row.role === "tool" ? <details><summary>Tool output</summary><pre className="whitespace-pre-wrap break-all">{row.content}</pre></details> : <AssistantMarkdown content={row.content} />}
      </div>)}
      {archive?.raw && <div><Button onClick={downloadOriginal}>Save original transcript</Button>{downloaded && <p className="text-chat text-muted">Saved to Downloads.</p>}</div>}
    </div>
    <div className="shrink-0 border-t border-line p-4"><Button disabled={!archive} onClick={continueChat}>Continue in new tab</Button></div>
  </section>;
}
