import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Channel, invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { open } from "@tauri-apps/plugin-dialog";
import { IconMessagePlus, IconPaperclip } from "./Icons";
import Markdown from "./Markdown";
import { playChime, shouldPlayCompletionChime } from "./chime";
import { AttachmentDraft, restoreDraftText } from "./chatDraft";
import { activityStatus, elapsedLabel, mergeTool, type ToolItem } from "./chatActivity";
import "./ChatActivity.css";
import ModelPicker, { type ConfigRow } from "./ModelPicker";

// The whole-project conversation rides the per-part plumbing under a name no part
// file can have. Twins live in App.tsx's mount and acp.rs's context line.
export const PROJECT_CHAT = "//project";

// Mirrors ChatEvent in src-tauri/src/acp.rs.
type ChatEvent =
  | { type: "activity"; phase: string }
  | { type: "user_text"; text: string }
  | { type: "agent_text"; text: string }
  | { type: "agent_thought"; text: string }
  | { type: "session_info"; title: string | null }
  | { type: "note"; text: string }
  | { type: "tool_call"; id: string; title: string; kind?: string; status: string; input?: string; output?: string }
  | { type: "tool_call_update"; id: string; title?: string; kind?: string; status?: string; input?: string; output?: string }
  | { type: "plan"; entries: PlanEntry[] }
  | { type: "permission_request"; id: number; title: string; options: PermissionOption[] }
  | { type: "permission_resolved"; id: number }
  | { type: "session_error"; message: string };

type PlanEntry = { content: string; status: string };
type PermissionOption = { optionId: string; name: string; kind: string };

type Item =
  | { kind: "user"; text: string; files?: string[]; localId?: number }
  | { kind: "agent"; text: string }
  | { kind: "thought"; text: string }
  | ToolItem
  | { kind: "plan"; entries: PlanEntry[] }
  | { kind: "note"; text: string };

type Permission = { id: number; title: string; options: PermissionOption[] };

// Mirrors AgentKind::label in src-tauri/src/agents.rs.
export const AGENT_LABEL: Record<string, string> = {
  claude: "Claude",
  codex: "Codex",
  gemini: "Gemini",
  cursor: "Cursor",
  grok: "Grok",
};

const TOOL_STATUS_LABEL: Record<string, string> = {
  pending: "waiting",
  in_progress: "working…",
  completed: "done",
  failed: "failed",
  interrupted: "stopped",
};

// Tool titles arrive as developer-speak ("Edit parts/lid.py", "nurb check").
// The app's audience is hobbyists, so cards and permission dialogs translate
// what they can into plain activity language and fall back to the raw title,
// which stays untouched in state and in the debug event log.
const FILE_TITLE = /^(Read|Edit|Write)\s+(?:.*\/)?parts\/([A-Za-z0-9_]+)\.py$/;
const NURB_TITLE = /^(?:uv run\s+)?nurb\s+([a-z]+)/;
const FILE_VERBS: Record<string, [string, string]> = {
  Read: ["looking at", "look at"],
  Edit: ["editing", "edit"],
  Write: ["creating", "create"],
};
const NURB_VERBS: Record<string, [string, string]> = {
  build: ["building the part", "build the part"],
  check: ["checking printability", "check printability"],
  inspect: ["inspecting the part", "inspect the part"],
  verify: ["double-checking the part", "double-check the part"],
  compare: ["measuring against the original", "measure against the original"],
  render: ["rendering a preview", "render a preview"],
  export: ["exporting print files", "export print files"],
  rules: ["reading the design rules", "read the design rules"],
  api: ["checking the toolbox", "check the toolbox"],
  card: ["updating the part's notes", "update the part's notes"],
};
const KIND_VERBS: Record<string, [string, string]> = {
  read: ["reading project files", "read project files"],
  edit: ["editing project files", "edit project files"],
  delete: ["removing project files", "remove project files"],
  search: ["searching the project", "search the project"],
  execute: ["running a command", "run a command"],
  fetch: ["looking something up", "look something up"],
  think: ["thinking", "think"],
};

const basename = (path: string) => path.split("/").pop() ?? path;

// mode 0 is the activity form for cards ("editing lid"); mode 1 the plain verb
// form for permission dialogs ("edit lid").
function describe(title: string, kind: string | undefined, mode: 0 | 1): string {
  const file = title.match(FILE_TITLE);
  if (file) return `${FILE_VERBS[file[1]][mode]} ${file[2]}`;
  const nurb = title.match(NURB_TITLE);
  if (nurb && NURB_VERBS[nurb[1]]) return NURB_VERBS[nurb[1]][mode];
  if (kind && KIND_VERBS[kind]) return KIND_VERBS[kind][mode];
  return title;
}

function Chat({
  path,
  part,
  agent,
  agents,
  resume,
  draft,
  hidden,
  seed,
  onSeed,
  onSession,
  onFresh,
  onAgent,
  onBusy,
  onSignIn,
  tabBar,
  onModel,
  onDraft,
  onConfig,
  initialConfig,
}: {
  path: string;
  // The column's identity: this is the part's conversation, whatever the
  // viewer shows by the time a reply lands.
  part: string;
  // Fixed for the life of the conversation: a resumed session keeps the agent
  // that ran it, a fresh one takes the default from the agents pane.
  agent: string;
  // Installed providers offered together in the model picker.
  agents: { id: string; label: string; loggedIn: boolean | null }[];
  resume: string | null;
  draft?: { text: string; files: string[] };
  hidden: boolean;
  // Text waiting for the composer, from a viewer nudge. Prefilled when the column
  // is visible, never sent; onSeed reports it landed so the owner clears it.
  seed?: string | null;
  onSeed?: () => void;
  onSession: (id: string) => void;
  onFresh: () => void;
  // Switching agents cannot move a conversation across two different session
  // stores, so it starts a fresh one on the agent picked. `unstarted` is true
  // when nothing has been said yet, which makes the pick the new default.
  onAgent: (id: string, unstarted: boolean, draft: { text: string; files: string[] }, model: string) => Promise<boolean>;
  onBusy: (busy: boolean) => void;
  onSignIn: (agent: string) => Promise<boolean>;
  tabBar?: ReactNode;
  onModel?: (label: string) => void;
  onDraft?: (draft: { text: string; files: string[] }) => void;
  onConfig?: (values: Record<string, string>) => void;
  initialConfig?: Record<string, string>;
}) {
  const label = AGENT_LABEL[agent] ?? agent;
  // Known signed out, not merely unknown: an unknown status stays quiet.
  const signedOut = agents.find((option) => option.id === agent)?.loggedIn === false;
  // The sentinel never reaches copy: everywhere the column says its name, the
  // project conversation speaks of the project.
  const isProject = part === PROJECT_CHAT;
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("");
  const [clock, setClock] = useState(Date.now());
  const [lastEventAt, setLastEventAt] = useState(Date.now());
  const [turnStartedAt, setTurnStartedAt] = useState(Date.now());
  const [cancelledAt, setCancelledAt] = useState<number | null>(null);
  const cancelRef = useRef(false);
  const choicesRef = useRef<Record<string, string>>({ ...initialConfig });
  const onDraftRef = useRef(onDraft);
  onDraftRef.current = onDraft;
  const onModelRef = useRef(onModel);
  onModelRef.current = onModel;
  const onConfigRef = useRef(onConfig);
  onConfigRef.current = onConfig;
  // A resumed transcript starts loading after the first paint, so treat it as
  // starting immediately rather than briefly exposing a live composer.
  const [starting, setStarting] = useState(Boolean(resume));
  // A refused prompt needs explicit resend guidance; a proactive or resume sign-in does not.
  const [authNeeded, setAuthNeeded] = useState<"none" | "sign-in" | "resume" | "resend">("none");
  const [signingIn, setSigningIn] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  // Absolute paths; the Rust side reads them at send time.
  const [attachments, setAttachments] = useState<string[]>(draft?.files ?? []);
  const attachmentDraftRef = useRef<AttachmentDraft | null>(null);
  if (!attachmentDraftRef.current) {
    attachmentDraftRef.current = new AttachmentDraft(setAttachments, draft?.files);
  }
  const attachmentDraft = attachmentDraftRef.current;
  const [dropping, setDropping] = useState(false);
  // The model and effort this conversation runs on. Empty before the agent has
  // ever reported its lists, which is only ever the first chat on this Mac.
  const [config, setConfig] = useState<ConfigRow[]>([]);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState(false);
  const configuringRef = useRef(false);
  const [providerConfigs, setProviderConfigs] = useState<Record<string, ConfigRow[]>>({});
  const [providerLoading, setProviderLoading] = useState<Record<string, boolean>>({});
  const [providerErrors, setProviderErrors] = useState<Record<string, string | null>>({});
  const discoveryRef = useRef(new Set<string>());
  const discoveryStartedRef = useRef(false);
  const configRequestsRef = useRef<Record<string, number>>({});
  const providerIds = agents.map((option) => option.id).join(",");
  const sessionRef = useRef<string | null>(null);
  // A resume id is single-use after the adapter accepts it. Authentication
  // failures retain it; a dead resumed session must not replay it again.
  const resumeRef = useRef<string | null>(resume);
  const restoringRef = useRef(Boolean(resume));
  // Refs, not state: these guard against races within a tick (double-Enter)
  // and after unmount, where state reads are stale or gone.
  const closedRef = useRef(false);
  const sendingRef = useRef(false);
  const nextLocalIdRef = useRef(1);
  // In-flight start, shared across StrictMode's double mount so a resume on
  // mount cannot spawn two adapters.
  const startRef = useRef<Promise<string> | null>(null);
  const startupIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Latest callbacks behind stable refs so ensureSession never goes stale.
  const onSessionRef = useRef(onSession);
  onSessionRef.current = onSession;
  const onBusyRef = useRef(onBusy);
  onBusyRef.current = onBusy;

  useEffect(() => {
    if (!busy && !starting) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [busy, starting]);

  useEffect(() => {
    onDraftRef.current?.({ text: inputRef.current?.value ?? "", files: attachments });
  }, [attachments]);

  useEffect(() => {
    const row = config.find((row) => row.category === "model");
    const name = row?.options.find((option) => option.value === row.value)?.name;
    if (name) onModelRef.current?.(name);
    if (config.length) onConfigRef.current?.(Object.fromEntries(config.map((row) => [row.category, row.value])));
  }, [config]);

  const publishDraft = () => onDraftRef.current?.({ text: inputRef.current?.value ?? "", files: attachments });

  useEffect(() => {
    // A removed column cannot leave a stale rail dot behind. Turn transitions
    // report synchronously in send(), before adapter startup can race UI state.
    return () => onBusyRef.current(false);
  }, []);

  useEffect(() => {
    // Kill the adapter when this project's chat column goes away. StrictMode
    // remounts reuse the refs, so closed is reset on mount.
    closedRef.current = false;
    return () => {
      closedRef.current = true;
      const startup = startupIdRef.current;
      if (startup) invoke("cancel_chat_start", { startupId: startup }).catch(() => {});
      const session = sessionRef.current;
      sessionRef.current = null;
      if (session) invoke("close_chat", { sessionId: session }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    const pane = scrollRef.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [items, permissions, busy]);

  useEffect(() => {
    // Dev-only test hook: the Rust side forwards loopback-socket text here so
    // UI automation can fill the composer without stealing keyboard focus.
    if (!import.meta.env.DEV) return;
    const unlisten = listen<string>("test-type", (event) => {
      if (inputRef.current) inputRef.current.value = event.payload;
    });
    return () => {
      unlisten.then((stop) => stop());
    };
  }, []);

  useEffect(() => {
    // Same hook, submit half: every mounted column hears the event, so only
    // the visible one sends.
    if (!import.meta.env.DEV || hidden) return;
    const unlisten = listen("test-send", () => {
      inputRef.current?.form?.requestSubmit();
    });
    return () => {
      unlisten.then((stop) => stop());
    };
  }, [hidden]);

  useEffect(() => {
    // A seed lands once the column is visible. Below any half-typed draft rather
    // than over it; the user's own words outrank a nudge's.
    if (hidden || !seed) return;
    const box = inputRef.current;
    if (box) {
      // Idempotent: StrictMode double-runs mount effects, and the clearing of
      // the seed above only lands after this commit.
      if (box.value !== seed && !box.value.endsWith(`\n${seed}`)) {
        box.value = box.value.trim() ? `${box.value}\n${seed}` : seed;
      }
      box.focus();
    }
    onSeed?.();
  }, [hidden, seed, onSeed]);

  useEffect(() => {
    // OS file drags arrive as Tauri window events with paths, not HTML5 drops.
    // Every part's chat is mounted at once, so only the visible column listens
    // or one drop would attach to every conversation.
    if (hidden) return;
    const unlisten = getCurrentWebview().onDragDropEvent((event) => {
      if (configuringRef.current) { setDropping(false); return; }
      if (event.payload.type === "enter") setDropping(true);
      if (event.payload.type === "leave") setDropping(false);
      if (event.payload.type === "drop") {
        setDropping(false);
        const paths = event.payload.paths;
        attachmentDraft.add(paths);
      }
    });
    return () => {
      unlisten.then((stop) => stop());
    };
  }, [hidden, attachmentDraft]);

  const applyEvent = useCallback((event: ChatEvent) => {
    const now = Date.now();
    setLastEventAt(now);
    setClock(now);
    switch (event.type) {
      case "activity":
        setPhase(event.phase);
        break;
      case "user_text":
        // Only replayed history carries user chunks; live turns render the
        // composer text directly in send().
        setItems((list) => {
          const last = list[list.length - 1];
          if (last && last.kind === "user") {
            return [...list.slice(0, -1), { ...last, text: last.text + event.text }];
          }
          return [...list, { kind: "user", text: event.text }];
        });
        break;
      case "session_info":
        // Titles have no home since the visible session list went away.
        break;
      case "note":
        setItems((list) => [...list, { kind: "note", text: event.text }]);
        break;
      case "agent_text":
      case "agent_thought": {
        setPhase(event.type === "agent_text" ? "Receiving response" : "Receiving provider thinking update");
        const kind = event.type === "agent_text" ? "agent" : "thought";
        setItems((list) => {
          const last = list[list.length - 1];
          if (last && last.kind === kind) {
            return [...list.slice(0, -1), { ...last, text: last.text + event.text }];
          }
          return [...list, { kind, text: event.text } as Item];
        });
        break;
      }
      case "tool_call":
      case "tool_call_update":
        setPhase(`Waiting for ${label}'s next update`);
        setItems((list) => {
          const index = list.findIndex((item) => item.kind === "tool" && item.id === event.id);
          const previous = index < 0 ? undefined : list[index] as ToolItem;
          const tool = mergeTool(previous, event, now, restoringRef.current);
          if (index < 0) return [...list, tool];
          return list.map((item, at) => at === index ? tool : item);
        });
        break;
      case "plan":
        setItems((list) => {
          let index = -1;
          for (let i = list.length - 1; i >= 0; i--) {
            if (list[i].kind === "plan") {
              index = i;
              break;
            }
          }
          if (index >= 0) {
            const next = [...list];
            next[index] = { kind: "plan", entries: event.entries };
            return next;
          }
          return [...list, { kind: "plan", entries: event.entries }];
        });
        break;
      case "permission_request":
        setPermissions((list) => [
          ...list,
          { id: event.id, title: event.title, options: event.options },
        ]);
        break;
      case "permission_resolved":
        setPermissions((list) => list.filter((p) => p.id !== event.id));
        break;
      case "session_error":
        setBusy(false);
        onBusyRef.current(false);
        setPermissions([]);
        // The dead session is gone from the Rust map too; forgetting it here
        // is what lets the next send start the fresh chat the note promises.
        sessionRef.current = null;
        setItems((list) => [...list, { kind: "note", text: event.message }]);
        break;
    }
  }, [label]);

  const readConfig = useCallback(async (id: string) => {
    const request = (configRequestsRef.current[id] ?? 0) + 1;
    configRequestsRef.current[id] = request;
    try {
      const rows = await invoke<ConfigRow[]>("chat_config", {
        agent: id,
        sessionId: id === agent ? sessionRef.current : null,
      });
      if (closedRef.current || configRequestsRef.current[id] !== request || (id === agent && configuringRef.current)) return;
      setProviderConfigs((current) => ({ ...current, [id]: rows }));
      if (id === agent) {
        const chosen = sessionRef.current ? rows : rows.map((row) => {
          const value = choicesRef.current[row.category];
          return value && row.options.some((option) => option.value === value) ? { ...row, value } : row;
        });
        choicesRef.current = Object.fromEntries(chosen.map((row) => [row.category, row.value]));
        setConfig(chosen);
      }
    } catch (error) {
      if (!closedRef.current && configRequestsRef.current[id] === request) {
        setProviderErrors((current) => ({ ...current, [id]: String(error) }));
      }
    }
  }, [agent]);

  const refreshConfig = useCallback(() => { void readConfig(agent); }, [agent, readConfig]);

  useEffect(() => {
    for (const id of new Set([...providerIds.split(",").filter(Boolean), agent])) void readConfig(id);
  }, [providerIds, agent, readConfig]);

  useEffect(() => {
    const unlisten = listen("agent-config", () => {
      for (const id of new Set([...providerIds.split(",").filter(Boolean), agent])) void readConfig(id);
    });
    return () => { unlisten.then((stop) => stop()); };
  }, [providerIds, agent, readConfig]);

  const discoverModels = async (id?: string) => {
    const ids = id ? [id] : providerIds.split(",").filter(Boolean);
    await Promise.all(ids.map(async (provider) => {
      if (discoveryRef.current.has(provider)) return;
      discoveryRef.current.add(provider);
      setProviderLoading((current) => ({ ...current, [provider]: true }));
      setProviderErrors((current) => ({ ...current, [provider]: null }));
      try {
        await invoke<ConfigRow[]>("refresh_chat_config", { path, agent: provider });
        await readConfig(provider);
      } catch (error) {
        if (!closedRef.current) setProviderErrors((current) => ({ ...current, [provider]: String(error) }));
      } finally {
        discoveryRef.current.delete(provider);
        if (!closedRef.current) setProviderLoading((current) => ({ ...current, [provider]: false }));
      }
    }));
  };

  const pick = useCallback(
    async (category: string, value: string) => {
      if (configuringRef.current || sendingRef.current || startRef.current) return;
      configuringRef.current = true;
      configRequestsRef.current[agent] = (configRequestsRef.current[agent] ?? 0) + 1;
      setConfiguring(true);
      setConfigError(null);
      // Optimistic: the round trip goes through the adapter, and a select that
      // lags behind the click reads as a dropped one.
      setConfig((rows) =>
        rows.map((row) => (row.category === category ? { ...row, value } : row)),
      );
      try {
        const rows = await invoke<ConfigRow[]>("set_chat_config", {
          agent, sessionId: sessionRef.current, category, value,
        });
        choicesRef.current[category] = value;
        setConfig(rows.map((row) => {
          const own = choicesRef.current[row.category];
          return !sessionRef.current && own && row.options.some((option) => option.value === own)
            ? { ...row, value: own } : row;
        }));
      } catch (error) {
        setConfigError(`Could not change this setting: ${String(error)}`);
        refreshConfig();
        throw error;
      } finally {
        configuringRef.current = false;
        setConfiguring(false);
      }
    },
    [agent, refreshConfig],
  );

  const selectModel = async (target: string, value: string) => {
    if (configuringRef.current) return;
    if (target === agent) {
      if (sendingRef.current || startRef.current || busy || starting) return;
      await pick("model", value);
      return;
    }
    configuringRef.current = true;
    setConfiguring(true);
    setConfigError(null);
    let files: string[] = [];
    try {
      // Validate the choice before opening a tab. The new tab applies its own
      // selection before prompting, while this conversation stays mounted.
      await invoke<ConfigRow[]>("set_chat_config", {
        agent: target, sessionId: null, category: "model", value,
      });
      files = await attachmentDraft.snapshot();
      const transferred = await onAgent(target, items.length === 0 && !resumeRef.current && !sessionRef.current, {
        text: inputRef.current?.value ?? "", files,
      }, value);
      if (!transferred) {
        throw new Error("Your conversation and draft are still here. Try switching providers again.");
      }
    } catch (error) {
      setConfigError(`Could not switch providers: ${String(error)}`);
      throw error;
    } finally {
      configuringRef.current = false;
      if (!closedRef.current) setConfiguring(false);
    }
  };

  const ensureSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current;
    // One start at a time: StrictMode double-mounts share this promise, so a
    // resume on mount cannot spawn two adapters.
    if (startRef.current) return startRef.current;
    const start = (async () => {
      const requestedResume = resumeRef.current;
      restoringRef.current = Boolean(requestedResume);
      setStarting(true);
      setLastEventAt(Date.now());
      setTurnStartedAt(Date.now());
      setPhase(requestedResume ? "Restoring conversation" : `Connecting to ${label}`);
      try {
        const startupId = crypto.randomUUID();
        startupIdRef.current = startupId;
        const onEvent = new Channel<ChatEvent>();
        onEvent.onmessage = applyEvent;
        const session = await invoke<string>("start_chat", {
          path,
          agent,
          onEvent,
          resume: requestedResume,
          startupId,
        });
        if (closedRef.current) {
          // The user switched projects while the adapter was starting; without
          // this, the session outlives its column until app exit.
          invoke("close_chat", { sessionId: session }).catch(() => {});
          throw new Error("chat closed");
        }
        sessionRef.current = session;
        resumeRef.current = null;
        restoringRef.current = false;
        if (cancelRef.current) {
          await invoke("close_chat", { sessionId: session });
          sessionRef.current = null;
          throw new Error("Stopped before sending. Send your message again when ready.");
        }
        // Each tab owns its selection even when another tab changed provider defaults.
        try {
          if (!requestedResume) {
            for (const [category, value] of Object.entries(choicesRef.current).sort(([a], [b]) => Number(b === "model") - Number(a === "model"))) {
              const rows = await invoke<ConfigRow[]>("set_chat_config", { agent, sessionId: session, category, value });
              setConfig(rows);
            }
          }
          if (cancelRef.current) throw new Error("Stopped before sending. Send your message again when ready.");
        } catch (error) {
          sessionRef.current = null;
          await invoke("close_chat", { sessionId: session }).catch(() => {});
          throw error;
        }
        onSessionRef.current(session);
        // The live session is authoritative: it may have clamped a remembered
        // pick the account no longer offers.
        refreshConfig();
        return session;
      } catch (error) {
        if (cancelRef.current) throw new Error("Stopped before sending the message.");
        throw error;
      } finally {
        startupIdRef.current = null;
        startRef.current = null;
        setStarting(false);
      }
    })();
    startRef.current = start;
    return start;
  }, [path, agent, label, applyEvent, refreshConfig]);

  const restoreSession = useCallback(async () => {
    try {
      await ensureSession();
    } catch (e) {
      const message = String(e);
      if (message === "Error: chat closed") return;
      if (message.includes("auth_required")) {
        setAuthNeeded("resume");
      } else {
        setItems((list) => [...list, { kind: "note", text: message }]);
      }
    }
  }, [ensureSession]);

  useEffect(() => {
    // A history session replays its transcript when it opens, not on the first send; reuse this path after sign-in.
    if (resume && !hidden && !sessionRef.current) restoreSession();
  }, [resume, hidden, restoreSession]);

  const send = useCallback(
    async (text: string, files: string[]) => {
      sendingRef.current = true;
      const startedAt = Date.now();
      cancelRef.current = false;
      setCancelledAt(null);
      setTurnStartedAt(startedAt);
      setLastEventAt(startedAt);
      setClock(startedAt);
      setPhase(`Waiting for ${label}'s response`);
      const localId = nextLocalIdRef.current++;
      setItems((list) => [
        ...list,
        {
          kind: "user",
          text,
          files: files.length ? files.map(basename) : undefined,
          localId,
        },
      ]);
      setBusy(true);
      onBusyRef.current(true);
      setAuthNeeded("none");
      let completed = false;
      try {
        const session = await ensureSession();
        if (cancelRef.current) throw new Error("Stopped before sending. Send your message again when ready.");
        setPhase(`Waiting for ${label}'s response`);
        const stopReason = await invoke<string>("send_prompt", {
          sessionId: session,
          text,
          part: part ?? null,
          attachments: files,
        });
        completed = stopReason !== "cancelled";
        if (stopReason === "cancelled") setItems((list) => [...list, { kind: "note", text: "Turn stopped." }]);
      } catch (e) {
        const message = String(e);
        if (message.includes("auth_required")) {
          // Nothing was sent. Restore it ahead of any next draft composed
          // during the turn, and keep both turns' attachments.
          setItems((list) =>
            list.filter((item) => item.kind !== "user" || item.localId !== localId),
          );
          if (inputRef.current) {
            inputRef.current.value = restoreDraftText(text, inputRef.current.value);
          }
          attachmentDraft.restore(files);
          setAuthNeeded("resend");
        } else {
          setItems((list) => [...list, { kind: "note", text: message }]);
        }
      } finally {
        sendingRef.current = false;
        setBusy(false);
        onBusyRef.current(false);
        setPermissions([]);
        setItems((list) => list.map((item) => item.kind === "tool" && ["pending", "in_progress"].includes(item.status)
          ? { ...item, status: "interrupted", finishedAt: Date.now() } : item));
        // Only successful turns long enough to wander away from earn a chime;
        // quick back-and-forth and failures should stay quiet.
        if (shouldPlayCompletionChime(completed, Date.now() - startedAt)) playChime();
      }
    },
    [ensureSession, part, attachmentDraft, label],
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const box = inputRef.current;
    const text = box?.value.trim() ?? "";
    // sendingRef, not busy: two Enters in one tick both read the stale state,
    // and a double send would spawn a second adapter. A photo alone is a
    // legitimate message ("model this"), so attachments count as content.
    if (
      (!text && !attachmentDraft.hasContent) ||
      sendingRef.current ||
      configuringRef.current ||
      starting ||
      startRef.current
    )
      return;
    // Reserve the turn before waiting: a second Enter must not queue another
    // send while a pasted image is still crossing the IPC boundary.
    sendingRef.current = true;
    if (box) box.value = "";
    publishDraft();
    const files = await attachmentDraft.take();
    if (!text && files.length === 0) {
      sendingRef.current = false;
      return;
    }
    send(text, files);
  };

  const attach = async () => {
    const picked = await open({ multiple: true, title: "Attach files" });
    if (!picked) return;
    const paths = Array.isArray(picked) ? picked : [picked];
    attachmentDraft.add(paths);
  };

  // A pasted image (a screenshot, or an image copied from another app) has no
  // path, so the backend writes it to a temporary file that attaches like a
  // dropped one. Consuming the paste keeps a copied file's name out of the text.
  const paste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const images = Array.from(event.clipboardData.items)
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((blob): blob is File => blob !== null);
    if (images.length === 0) return;
    event.preventDefault();
    const saved = Promise.all(
      images.map((blob) =>
        blob.arrayBuffer().then((bytes) =>
          invoke<string>("save_pasted_image", new Uint8Array(bytes), {
            headers: { mime: blob.type },
          }),
        ),
      ),
    );
    attachmentDraft.track(saved).catch((e) =>
      setItems((list) => [...list, { kind: "note", text: String(e) }]),
    );
  };

  const keydown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const cancel = async () => {
    cancelRef.current = true;
    setCancelledAt(Date.now());
    const session = sessionRef.current;
    if (!session && startupIdRef.current) {
      await invoke("cancel_chat_start", { startupId: startupIdRef.current }).catch((error) =>
        setItems((list) => [...list, { kind: "note", text: `Could not stop connection: ${String(error)}` }]),
      );
    }
    if (session) {
      try { await invoke("cancel_turn", { sessionId: session }); }
      catch (error) { setItems((list) => [...list, { kind: "note", text: `Could not stop: ${String(error)}` }]); }
    }
  };

  const disconnect = async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      await invoke("close_chat", { sessionId: session });
      sessionRef.current = null;
      setItems((list) => [...list, { kind: "note", text: "Disconnected the agent. Your files and conversation history are kept. Send a message to reconnect." }]);
    } catch (error) {
      setItems((list) => [...list, { kind: "note", text: `Could not disconnect: ${String(error)}` }]);
    }
  };

  const signIn = async () => {
    const needsResend = authNeeded === "resend";
    const needsRestore = authNeeded === "resume";
    setSigningIn(true);
    try {
      if (!(await onSignIn(agent))) return;
      setAuthNeeded("none");
      if (needsRestore) await restoreSession();
      // Only a refused message needs sending again; a proactive sign-in has nothing to repeat.
      if (needsResend) {
        setItems((list) => [
          ...list,
          { kind: "note", text: "Signed in. Send your message again." },
        ]);
      }
    } catch (e) {
      setItems((list) => [...list, { kind: "note", text: String(e) }]);
      // Keep retry visible even though the failure adds an item to the transcript.
      setAuthNeeded((state) => state === "none" ? "sign-in" : state);
    } finally {
      setSigningIn(false);
    }
  };

  const answerPermission = (permission: Permission, optionId: string) => {
    const session = sessionRef.current;
    if (!session) return;
    setPermissions((list) => list.filter((p) => p.id !== permission.id));
    invoke("respond_permission", {
      sessionId: session,
      requestId: permission.id,
      optionId,
    }).catch(() => {});
  };

  const activity = activityStatus({ label, starting, restoring: restoringRef.current,
    cancelling: cancelledAt !== null, permission: permissions.length > 0, phase,
    lastEventAt, now: clock, tools: items.filter((item): item is ToolItem => item.kind === "tool"),
  });

  return (
    <section className={hidden ? "chat chat-hidden" : "chat"}>
      <div className="chat-header" data-tauri-drag-region>
        {/* The part name is the only thing here allowed to truncate, so the
            switcher lives beside it rather than inside it. */}
        <span className="chat-header-left">
          <span className="chat-header-label">{isProject ? "project" : part}</span>
          <span aria-hidden="true">·</span>
          <span>{label}</span>
        </span>
        {items.length > 0 && (
          <button
            className="chat-fresh"
            title="open a new conversation tab sharing the same project files"
            disabled={busy || starting || configuring}
            onClick={onFresh}
          >
            <IconMessagePlus />
            new tab
          </button>
        )}
      </div>
      {tabBar}
      <div className="chat-transcript" ref={scrollRef}>
        {items.length === 0 && !busy && (
          <div className="chat-empty">
            {isProject
              ? `This conversation covers the whole project. Ask ${label} for new parts, or for changes every part should share.`
              : `You're chatting with ${part}. Describe it or ask for changes, and ${label} will model it in the viewer.`}
          </div>
        )}
        {/* Nothing said yet and the agent is known to be signed out: ask before the first message bounces. */}
        {items.length === 0 && !starting && authNeeded === "none" && signedOut && (
          <div className="chat-auth">
            Sign in to {label} to start.{" "}
            <button className="chat-auth-button" disabled={signingIn} onClick={signIn}>
              {signingIn ? "signing in…" : "sign in"}
            </button>
          </div>
        )}
        {items.map((item, index) => {
          switch (item.kind) {
            case "user":
              return (
                <div key={index} className="chat-user">
                  {item.text}
                  {item.files && (
                    <span className="chat-user-files">
                      {item.files.map((name, i) => (
                        <span key={i} className="chat-user-file">
                          {name}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              );
            case "agent":
              return (
                <div key={index} className="chat-agent">
                  <Markdown text={item.text} />
                </div>
              );
            case "thought":
              return (
                <details key={index} className="chat-thought">
                  <summary>thinking</summary>
                  <div>{item.text}</div>
                </details>
              );
            case "tool": {
              const duration = item.startedAt === undefined ? null : elapsedLabel((item.finishedAt ?? clock) - item.startedAt);
              return (
                <details key={index} className={`chat-tool expandable ${item.status}`}>
                  <summary>
                    <span className="chat-tool-heading">
                      <span className="chat-tool-title" title={item.title}>{item.title}</span>
                      {item.input && item.input !== item.title && <code className="chat-tool-preview" title={item.input}>{item.input}</code>}
                    </span>
                    {duration && <span className="chat-tool-duration">{duration}</span>}
                    <span className="chat-tool-status">{TOOL_STATUS_LABEL[item.status] ?? item.status}</span>
                  </summary>
                  <div className="chat-tool-detail">
                    {item.input && <><span className="chat-tool-detail-label">Command / input</span><pre className="chat-tool-input">{item.input}</pre></>}
                    {item.output ? <><span className="chat-tool-detail-label">Output</span><pre className="chat-tool-output">{item.output}</pre></>
                      : <span className="chat-activity-detail">No output reported by the provider.</span>}
                  </div>
                </details>
              );
            }
            case "plan":
              return (
                <ul key={index} className="chat-plan">
                  {item.entries.map((entry, i) => (
                    <li key={i} className={entry.status}>
                      {entry.content}
                    </li>
                  ))}
                </ul>
              );
            case "note":
              return (
                <div key={index} className="chat-note">
                  {item.text}
                </div>
              );
          }
        })}
        {(busy || starting) && (
          <div className={`chat-activity${activity.quiet ? " quiet" : ""}`} role="status" aria-live="polite">
            <div className="chat-activity-main">
              <span className="chat-activity-title">{activity.title}</span>
              <span className="chat-activity-time">{elapsedLabel(clock - turnStartedAt)}</span>
            </div>
            <div className="chat-activity-detail">{activity.detail}</div>
            {cancelledAt !== null && clock - cancelledAt >= 5000 && sessionRef.current && (
              <button type="button" className="chat-activity-disconnect" onClick={disconnect}>Disconnect agent</button>
            )}
          </div>
        )}
        {authNeeded !== "none" && (
          <div className="chat-auth">
            {label} isn't signed in on this Mac.{" "}
            <button
              className="chat-auth-button"
              disabled={signingIn}
              onClick={signIn}
            >
              {signingIn ? "signing in…" : "sign in"}
            </button>
          </div>
        )}
        {permissions.map((permission) => (
          <div key={permission.id} className="chat-permission">
            <div className="chat-permission-title">
              {(() => {
                // The permission event carries no tool kind, so only pattern
                // matches translate; anything else reads as "use: <title>".
                // The Rust fallback title is already a full sentence.
                if (permission.title.startsWith(`${label} `)) return permission.title;
                const asked = describe(permission.title, undefined, 1);
                return asked === permission.title
                  ? `${label} wants to use: ${permission.title}`
                  : `${label} wants to ${asked}`;
              })()}
            </div>
            <div className="chat-permission-options">
              {permission.options.map((option) => (
                <button
                  key={option.optionId}
                  className={`chat-permission-button ${option.kind}`}
                  onClick={() => answerPermission(permission, option.optionId)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <form
        className={dropping ? "chat-composer dropping" : "chat-composer"}
        onSubmit={submit}
      >
        {attachments.length > 0 && (
          <div className="chat-attachments">
            {attachments.map((path) => (
              <span key={path} className="chat-attachment">
                <span className="chat-attachment-name">{basename(path)}</span>
                <button
                  type="button"
                  className="chat-attachment-remove"
                  aria-label={`remove ${basename(path)}`}
                  disabled={configuring}
                  onClick={() => attachmentDraft.remove(path)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <textarea
          ref={inputRef}
          defaultValue={draft?.text ?? ""}
          className="chat-input"
          placeholder={
            busy
              ? "Write your next message…"
              : starting
                ? restoringRef.current
                  ? "Restoring conversation…"
                  : `Starting ${label}…`
                : `Describe or change ${isProject ? "the project" : part}…`
          }
          rows={2}
          disabled={starting || configuring}
          onChange={publishDraft}
          onKeyDown={keydown}
          onPaste={paste}
        />
        <div className="chat-composer-controls">
          <button
            type="button"
            className="chat-attach"
            title="attach photos or files"
            aria-label="attach photos or files"
            disabled={starting || configuring}
            onClick={attach}
          >
            <IconPaperclip />
          </button>
          <ModelPicker
            agent={agent}
            config={config}
            providers={agents.map((provider) => ({
              ...provider,
              config: provider.id === agent ? config : providerConfigs[provider.id] ?? [],
              loading: providerLoading[provider.id] ?? false,
              error: providerErrors[provider.id] ?? null,
            }))}
            disabled={configuring}
            activeProviderBusy={busy || starting}
            configuring={configuring}
            error={configError}
            hasConversation={items.length > 0 || Boolean(resume)}
            onSelectModel={selectModel}
            onSelectConfig={pick}
            onRefresh={discoverModels}
            onSignIn={async (id) => {
              if (await onSignIn(id)) await discoverModels(id);
            }}
            onOpen={() => {
              if (discoveryStartedRef.current || !providerIds) return;
              discoveryStartedRef.current = true;
              void discoverModels();
            }}
          />
          {busy || starting ? (
            <button type="button" className="chat-send chat-stop" onClick={cancel} disabled={cancelledAt !== null}>
              {cancelledAt !== null ? "stopping…" : "stop"}
            </button>
          ) : (
            <button type="submit" className="chat-send" disabled={starting || configuring}>
              send
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default Chat;
