import { CSSProperties, FormEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { mcpStatusLabel, parseMcpArgs, parseMcpValues, type McpConfig, type McpServer } from "./mcpConfig";
import "./McpPanel.css";

type SessionStatus = { revision: number; sessionRevision?: number; attachedIds: string[]; unsupportedIds: string[] };
type Editor = { id: string; name: string; enabled: boolean; transport: "stdio" | "http"; preset?: "browser"; command: string; args: string; env: string; url: string; headers: string };
const emptyEditor = (): Editor => ({ id: crypto.randomUUID(), name: "", enabled: true, transport: "stdio", command: "", args: "[]", env: "{}", url: "", headers: "{}" });
const asEditor = (server: McpConfig): Editor => ({ id: server.id, name: server.name, enabled: server.enabled, transport: server.transport, preset: server.preset, command: server.command ?? "", args: JSON.stringify(server.args ?? [], null, 2), env: JSON.stringify(server.env ?? {}, null, 2), url: server.url ?? "", headers: JSON.stringify(server.headers ?? {}, null, 2) });

function McpIcon() {
  return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2" y="9" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><rect x="10" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M13 12h4v5h-4M3 6V3h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function McpPanel({ path, sessionId, hidden = false }: { path: string; sessionId: string | null; hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const [servers, setServers] = useState<McpServer[]>([]);
  const [session, setSession] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [preparingBrowser, setPreparingBrowser] = useState(false);
  const [checking, setChecking] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showValues, setShowValues] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);
  const actionRef = useRef(false);
  const checkingRef = useRef(new Set<string>());
  const panelId = useId();
  const selectedServer = servers.find((server) => server.id === selected);
  const modified = session?.sessionRevision !== undefined && session.sessionRevision !== session.revision;

  async function load() {
    const request = ++requestRef.current;
    setLoading(true);
    try {
      const [next, status] = await Promise.all([
        invoke<McpServer[]>("list_mcp_servers"),
        invoke<SessionStatus>("mcp_session_status", { sessionId }),
      ]);
      if (request !== requestRef.current) return;
      setServers(next);
      setSession(status);
    } catch (reason) {
      if (request === requestRef.current) setError(String(reason));
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    void load();
    const subscriptions = [listen("mcp-config", () => void load()), listen("mcp-status", () => void load())];
    return () => { requestRef.current += 1; subscriptions.forEach((subscription) => void subscription.then((unlisten) => unlisten())); };
  }, [open, sessionId]);

  useEffect(() => { if (hidden) setOpen(false); }, [hidden]);

  function close() {
    setOpen(false);
    setEditor(null);
    setShowValues(false);
    setConfirmRemove(false);
    buttonRef.current?.focus();
  }

  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(390, window.innerWidth - 24);
      const above = rect.top - 20;
      const below = window.innerHeight - rect.bottom - 20;
      setPosition({ width, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), ...(above >= below ? { bottom: window.innerHeight - rect.top + 8, maxHeight: Math.min(620, Math.max(120, above)) } : { top: rect.bottom + 8, maxHeight: Math.min(620, Math.max(120, below)) }) });
    }
    place();
    panelRef.current?.focus();
    const outside = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) close();
    };
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
    };
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keys);
    return () => { window.removeEventListener("resize", place); document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", keys); };
  }, [open]);

  async function action(run: () => Promise<void>) {
    if (actionRef.current) return;
    actionRef.current = true;
    setWorking(true);
    setError(null);
    try { await run(); } catch (reason) { setError(String(reason)); }
    finally { actionRef.current = false; setWorking(false); }
  }

  async function check(server: McpServer) {
    if (!server.enabled || checkingRef.current.has(server.id)) return;
    checkingRef.current.add(server.id);
    setChecking([...checkingRef.current]);
    try {
      const result = await invoke<McpServer>("check_mcp_server", { id: server.id, path });
      setServers((current) => current.map((item) => item.id === result.id ? result : item));
    } catch (reason) {
      setServers((current) => current.map((item) => item.id === server.id ? { ...item, status: { state: "error", error: String(reason) } } : item));
    } finally {
      checkingRef.current.delete(server.id);
      setChecking([...checkingRef.current]);
    }
  }

  async function refresh() {
    setError(null);
    await Promise.all(servers.filter((server) => server.enabled).map(check));
  }

  async function addBrowser() {
    await action(async () => {
      setPreparingBrowser(true);
      try {
        const server = await invoke<McpServer>("mcp_browser_preset");
        await load();
        setSelected(server.id);
        await check(server);
      } finally { setPreparingBrowser(false); }
    });
  }

  async function edit(server: McpServer) {
    await action(async () => {
      const config = await invoke<McpConfig>("get_mcp_server", { id: server.id });
      setEditor(asEditor(config));
      setShowValues(false);
      setConfirmRemove(false);
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    // Portals still bubble React events to the chat composer form.
    event.stopPropagation();
    if (!editor) return;
    await action(async () => {
      if (!editor.name.trim()) throw new Error("Enter a server name.");
      if (editor.transport === "stdio" && !editor.command.trim()) throw new Error("Enter the executable command.");
      if (editor.transport === "http") {
        let url: URL;
        try { url = new URL(editor.url.trim()); } catch { throw new Error("Enter a full HTTP or HTTPS server URL."); }
        if (!["https:", "http:"].includes(url.protocol)) throw new Error("Use an HTTP or HTTPS server URL.");
      }
      const server: McpConfig = {
        id: editor.id, name: editor.name.trim(), enabled: editor.enabled, transport: editor.transport, preset: editor.preset,
        ...(editor.transport === "stdio" ? { command: editor.command.trim(), args: parseMcpArgs(editor.args), env: parseMcpValues(editor.env, "Environment"), headers: {} } : { url: editor.url.trim(), args: [], env: {}, headers: parseMcpValues(editor.headers, "Headers") }),
      };
      const result = await invoke<McpServer>("save_mcp_server", { server });
      setEditor(null);
      setShowValues(false);
      setSelected(result.id);
      await load();
      if (result.enabled) await check(result);
    });
  }

  function setField<K extends keyof Editor>(key: K, value: Editor[K]) {
    setEditor((current) => current ? { ...current, [key]: value } : current);
  }

  return <>
    <button ref={buttonRef} type="button" className="mcp-trigger" aria-label="MCP servers" title="MCP servers" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? panelId : undefined} onClick={() => { if (open) close(); else { setError(null); setSelected(null); setOpen(true); } }}><McpIcon /></button>
    {open && createPortal(<div ref={panelRef} id={panelId} className="mcp-panel" role="dialog" aria-label="MCP servers" tabIndex={-1} style={position}>
      <header className="mcp-header">
        <span>{editor ? (servers.some((server) => server.id === editor.id) ? "Edit MCP server" : "Add MCP server") : "MCPs"}</span>
        <div>{!editor && <button type="button" aria-label="Refresh MCP servers" title="Check enabled servers and count tools" disabled={loading || checking.length > 0 || working || !servers.some((server) => server.enabled)} onClick={() => void refresh()} className={checking.length ? "mcp-refresh checking" : "mcp-refresh"}>↻</button>}<button type="button" aria-label="Close MCP panel" onClick={close}>×</button></div>
      </header>
      {error && <div className="mcp-error" role="alert">{error}</div>}
      {editor ? <form className="mcp-editor" onSubmit={(event) => void save(event)}>
        <label>Name<input autoFocus value={editor.name} onChange={(event) => setField("name", event.target.value)} placeholder="My MCP server" disabled={working} /></label>
        <label>Connection<select value={editor.transport} onChange={(event) => setField("transport", event.target.value as Editor["transport"])} disabled={working}><option value="stdio">Local command (stdio)</option><option value="http">Remote URL (HTTP)</option></select></label>
        {editor.transport === "stdio" ? <>
          <label>Command<input value={editor.command} onChange={(event) => setField("command", event.target.value)} placeholder="/path/to/server or npx" disabled={working} autoCapitalize="none" autoCorrect="off" spellCheck={false} /></label>
          <label>Arguments (JSON array)<textarea value={editor.args} onChange={(event) => setField("args", event.target.value)} rows={3} disabled={working} spellCheck={false} /></label>
        </> : <label>Server URL<input value={editor.url} onChange={(event) => setField("url", event.target.value)} placeholder="https://example.com/mcp" disabled={working} autoCapitalize="none" autoCorrect="off" spellCheck={false} /></label>}
        <details className="mcp-credentials"><summary>{editor.transport === "stdio" ? "Environment variables" : "Authentication headers"}</summary>
          <label>{editor.transport === "stdio" ? "Environment (JSON object)" : "Headers (JSON object)"}<textarea className={showValues ? "" : "mcp-secret-values"} value={editor.transport === "stdio" ? editor.env : editor.headers} onChange={(event) => setField(editor.transport === "stdio" ? "env" : "headers", event.target.value)} rows={4} disabled={working} spellCheck={false} autoComplete="off" /></label>
          <label className="mcp-checkbox"><input type="checkbox" checked={showValues} onChange={(event) => setShowValues(event.target.checked)} />Show values</label>
          <p>Stored in Nurb’s private local configuration.</p>
        </details>
        <label className="mcp-checkbox"><input type="checkbox" checked={editor.enabled} onChange={(event) => setField("enabled", event.target.checked)} disabled={working} />Enable for new conversations</label>
        <p className="mcp-hint">Saving an enabled server checks its connection. Local commands run on this Mac; use servers you trust.</p>
        <div className="mcp-actions"><button type="button" disabled={working} onClick={() => { setEditor(null); setShowValues(false); setError(null); }}>Cancel</button><button type="submit" className="mcp-primary" disabled={working}>{working ? "Saving…" : "Save server"}</button></div>
      </form> : <>
        <div className="mcp-list" aria-label="Configured MCP servers">
          {loading && servers.length === 0 ? <p className="mcp-empty">Loading servers…</p> : servers.length === 0 ? <div className="mcp-empty"><strong>Add tools to your agents</strong><p>Connect a browser, computer-control server, or another MCP server.</p><button type="button" className="mcp-primary" disabled={working} onClick={() => void addBrowser()}>{preparingBrowser ? "Preparing browser…" : "Add browser"}</button><p className="mcp-hint">Uses an isolated Chrome session without your existing cookies.</p></div> : servers.map((server) => {
            const status = !server.enabled ? { state: "disabled" as const } : checking.includes(server.id) ? { state: "checking" as const } : server.status;
            const unsupported = Boolean(session?.unsupportedIds.includes(server.id));
            return <button key={server.id} type="button" className={`mcp-server ${selected === server.id ? "selected" : ""}`} onClick={() => { setSelected(selected === server.id ? null : server.id); setConfirmRemove(false); }} aria-expanded={selected === server.id}>
              <span className="mcp-server-icon" aria-hidden="true">{server.name.slice(0, 1).toUpperCase()}</span><span className="mcp-server-name">{server.name}</span><span className="mcp-server-state">{unsupported && server.enabled ? "Not attached" : mcpStatusLabel(status)}</span><span className={`mcp-state-mark ${unsupported ? "error" : status.state}`} aria-label={unsupported ? "Not attached to this agent" : status.state === "ready" ? "Check passed" : status.state}>{unsupported || status.state === "error" ? "×" : status.state === "ready" ? "✓" : status.state === "checking" ? "◌" : "·"}</span>
            </button>;
          })}
        </div>
        {selectedServer && <section className="mcp-details" aria-label={`${selectedServer.name} details`}>
          <div className="mcp-detail-heading"><strong>{selectedServer.name}</strong><label className="mcp-checkbox"><input type="checkbox" checked={selectedServer.enabled} disabled={working} onChange={(event) => { const enabled = event.target.checked; void action(async () => { await invoke("set_mcp_enabled", { id: selectedServer.id, enabled }); await load(); }); }} />Enabled</label></div>
          <p>{selectedServer.transport === "stdio" ? "Local command" : "HTTP server"}{selectedServer.envKeys?.length || selectedServer.headerKeys?.length ? " · Saved credentials" : ""}</p>
          {selectedServer.status.error && <div className="mcp-error" role="status">{selectedServer.status.error}</div>}
          {session?.unsupportedIds.includes(selectedServer.id) && <p className="mcp-error">This server could not be attached to the agent. Check its command and connection type, then open a new conversation.</p>}
          {session?.attachedIds.includes(selectedServer.id) && <p className="mcp-hint">Provided to this conversation’s agent. The agent controls tool access.</p>}
          <div className="mcp-actions"><button type="button" disabled={working || checking.includes(selectedServer.id) || !selectedServer.enabled} onClick={() => void check(selectedServer)}>Check</button><button type="button" disabled={working || selectedServer.preset === "browser"} title={selectedServer.preset === "browser" ? "Browser connection is managed by Nurb" : undefined} onClick={() => void edit(selectedServer)}>Edit</button><button type="button" disabled={working} onClick={() => setConfirmRemove(true)}>Remove</button></div>
          {confirmRemove && <div className="mcp-remove"><p>Remove {selectedServer.name} from Nurb? Existing conversations keep their connections until closed.</p><div className="mcp-actions"><button type="button" disabled={working} onClick={() => setConfirmRemove(false)}>Cancel</button><button type="button" disabled={working} onClick={() => void action(async () => { await invoke("remove_mcp_server", { id: selectedServer.id }); setSelected(null); setConfirmRemove(false); await load(); })}>Remove server</button></div></div>}
        </section>}
        <footer className="mcp-footer"><p>{modified ? "MCP settings changed. Open a new conversation to use them." : sessionId ? "Changes apply to new or reopened conversations." : "Enabled servers are added when your conversation starts."} Checks show server availability, not whether the agent has loaded every tool.</p><div className="mcp-actions"><button type="button" disabled={working} onClick={() => { setEditor(emptyEditor()); setError(null); }}>Add server</button>{servers.length > 0 && !servers.some((server) => server.id === "browser") && <button type="button" disabled={working} onClick={() => void addBrowser()}>{preparingBrowser ? "Preparing browser…" : "Add browser"}</button>}</div></footer>
      </>}
    </div>, document.body)}
  </>;
}
