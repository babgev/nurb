import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@nurb/ui";
import LegacyChat from "./LegacyChat";
import { previousConversations, type LegacyConversation } from "./legacyRecords";

export default function LegacyHistory({ projectId, part, onContinue }: {
  projectId: string; part: string; onContinue: (text: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<LegacyConversation[]>([]);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!open) return;
    let stale = false;
    setLoading(true); setError(null); setRows([]);
    void (async () => {
      const mappings = await invoke<{ path: string; projectId: string }[]>("v1_project_mappings");
      const paths = mappings.filter((row) => row.projectId === projectId).map((row) => row.path);
      const rows = (await Promise.all(paths.map(async (path) => {
        const records = await invoke<{ id: string; agent: string; title: string; part?: string }[]>("list_legacy_chats", { path });
        return records.map((row): LegacyConversation => ({ ...row, path, sessionId: row.id, id: `${path}:${row.agent}:${row.id}` }));
      }))).flat();
      const saved: unknown[] = [];
      const warnings: string[] = [];
      try { saved.push(await invoke("load_chat_tabs")); }
      catch { warnings.push("Some saved drafts could not be read. Their original files have been kept."); }
      for (const key of ["nurb-conversation-tabs-v1", "nurb-conversation-tabs-v1-closed"]) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) saved.push(JSON.parse(raw));
        } catch { warnings.push("Some older draft data could not be read. The original data has been kept."); }
      }
      if (stale) return;
      const all = previousConversations(rows, paths, saved);
      if (warnings.length) setError([...new Set(warnings)].join(" "));
      setRows(all); setSelected(Math.max(0, all.findIndex((row) => row.part === part)));
    })().catch((cause) => { if (!stale) setError(String(cause)); })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [open, projectId, part]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  useEffect(() => { setOpen(false); }, [projectId, part]);
  const close = () => setOpen(false);
  return <>
    <button type="button" className="mono-caption text-muted hover:text-ink" onClick={() => setOpen(true)}>Previous chats</button>
    <dialog ref={dialog} className="legacy-history" aria-label="Previous chats" onCancel={close} onClose={close}>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line p-4">
        <h2 className="text-lg font-medium text-ink">Previous chats</h2>
        <Button onClick={close}>Close</Button>
      </div>
      {loading && <p className="p-4 text-muted">Loading previous conversations…</p>}
      {error && <p className="p-4 text-muted" role="alert">{error}</p>}
      {!loading && !error && !rows.length && <p className="p-4 text-muted">No conversations from before the upgrade were found for this project.</p>}
      {rows.length > 0 && <>
        <label className="flex shrink-0 flex-col gap-2 p-4 text-sm text-muted">Saved conversation
          <select aria-label="Saved conversation" className="min-w-0 rounded border border-line bg-ground p-2 text-ink" value={selected} onChange={(event) => setSelected(Number(event.target.value))}>
            {rows.map((row, index) => <option key={row.id} value={index}>{row.title} · {row.agent}{row.draft ? " · draft saved" : ""}</option>)}
          </select>
        </label>
        <LegacyChat key={rows[selected].id} conversation={rows[selected]} onContinue={(text) => { onContinue(text); close(); }} />
      </>}
    </dialog>
  </>;
}
