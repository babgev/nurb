import {
  ClipboardEvent,
  DragEvent,
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
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import clsx from "clsx";
import {
  ApprovalCard,
  AssistantMarkdown,
  useContextMenu,
  Button,
  ChatPanel,
  changedSize,
  CyclingPlaceholder,
  DropHint,
  Icon,
  IconButton,
  MeasurementCard,
  NewItemsPill,
  SpecCard,
  cue,
  type Message,
} from "@nurb/ui";
import { addMessage } from "@nurb/workbench/api";
import {
  applyChatEvent,
  claudeNote,
  describe,
  type ChatEvent,
  type Item,
  type PermissionOption,
  withNote,
} from "./chatItems";
import { AttachmentDraft, restoreDraftText, stashDraft, unstashDraft } from "./chatDraft";
import ModelPicker, { type ConfigRow } from "./ModelPicker";
import McpPanel from "./McpPanel";
import { activityStatus, elapsedLabel } from "./chatActivity";

// The whole-project conversation rides the per-part plumbing under a name no part
// file can have. Twins live in App.tsx's mount and acp.rs's context line.
export const PROJECT_CHAT = "//project";
// A part being started inside a folder has no name yet. Its turns are stored
// unnamed and handed to the part once the agent writes it. Twin in acp.rs.
export const NEW_PART = "//new";

type Permission = { id: number; title: string; options: PermissionOption[] };

// Mirrors AgentKind::label in src-tauri/src/agents.rs.
export const AGENT_LABEL: Record<string, string> = {
  claude: "Claude",
  codex: "Codex",
  gemini: "Gemini",
  cursor: "Cursor",
  grok: "Grok",
};

const basename = (path: string) => path.split("/").pop() ?? path;

// A plan entry reads by its state alone, so the three states stay separable
// without a legend.
const PLAN_TONE: Record<string, string> = {
  completed: "text-faint line-through",
  in_progress: "text-ink",
  pending: "text-muted",
};

// The ACP kind decides the weight: standing permission is the loud one, this
// once is the quiet allow, and everything else (the refusals) is plain text.
function permissionVariant(kind: string): "accent" | "outline" | "ghost" {
  if (kind === "allow_always") return "accent";
  if (kind === "allow_once") return "outline";
  return "ghost";
}

/** Word for word what the Claude driver says when a resume finds no transcript. */
const RESTORE_FAILED = "Couldn't restore this conversation, so this is a fresh one.";

// The first conversation on this Mac gets examples instead of an instruction: the
// hard part of a first part is believing it can be asked for in plain words.
const PRIMED_KEY = "nurb-composer-primed";
const FIRST_RUN_PLACEHOLDERS = [
  "a bracket for the 25 mm rail above my bench",
  "a knob to replace the one I snapped off",
  "a bin that fits the drawer, not the other way round",
];

// A locked-down webview throws on plain access, so an unreadable store counts as
// primed: an example reel is a nicety, and showing it forever is worse than never.
function readPrimed(): boolean {
  try {
    return localStorage.getItem(PRIMED_KEY) !== null;
  } catch {
    return true;
  }
}

// How far up the transcript counts as reading rather than following.
const PINNED_SLACK_PX = 24;
// The viewer resnaps its grid on this, so a held key cannot make it stutter.
const GRIDFINITY_GAP_MS = 10_000;

const CLAUDE_SIGN_IN =
  "Sign in to Claude Code first: open a terminal, run claude, and follow the prompts. Then come back here.";

/** A turn: who spoke and its number over the prose itself. */
// A right-click on a turn copies the whole of it, which a drag across a long
// reply with tables and lists in it does badly.
function Turn({ who, n, text, children }: { who: string; n?: string; text?: string; children: ReactNode }) {
  const context = useContextMenu();
  return (
    <div
      className="flex flex-col gap-1.5"
      onContextMenu={(e) => {
        // A selection gets the webview's own Copy, which copies just that.
        if (window.getSelection()?.toString()) return;
        context.open(e, text ? [{ label: "Copy message", onSelect: () => void writeText(text) }] : undefined);
      }}
    >
      {context.menu}
      <div className="flex items-baseline justify-between">
        <span className="mono-label text-muted">{who}</span>
        {n ? <span className="mono-caption text-faint [letter-spacing:0.1em]">{n}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** One row of the project's own transcript. */
// A stored row that is a step of the work rather than something said: a tool call, or
// the build a save ran. The person is not a developer; the part on the stage is the
// result, and the working line says what is happening while it happens.
function isWork(message: Message): boolean {
  const payload = message.payload;
  if (payload?.type === "step" || payload?.type === "build") return true;
  // A size first written down is already in the plan's table; only a change is news.
  return payload?.type === "measurement" && !changedSize(payload.measurement);
}

function FileNames({ names }: { names: string[] }) {
  return (
    <span className="mt-1.5 flex flex-wrap gap-1">
      {names.map((name, i) => (
        <span key={i} className="mono-id rounded-[3px] bg-raised px-1.5 py-0.5 text-muted">
          {name}
        </span>
      ))}
    </span>
  );
}

function Stored({ message, who, n }: { message: Message; who: string; n?: string }) {
  const payload = message.payload;
  return (
    <div className="flex flex-col gap-4">
      {message.content || message.files?.length ? (
        <Turn who={message.role === "user" ? "You" : who} n={n} text={message.content ?? undefined}>
          {message.role === "user" ? (
            <>
              {message.content && (
                <p className="text-chat whitespace-pre-wrap text-ink-soft">{message.content}</p>
              )}
              {message.files?.length ? <FileNames names={message.files} /> : null}
            </>
          ) : (
            <div className="text-chat text-ink-soft">
              <AssistantMarkdown content={message.content ?? ""} />
            </div>
          )}
        </Turn>
      ) : null}
      {payload?.type === "spec" && (
        <SpecCard spec={payload.spec} model={payload.model} effort={payload.effort} />
      )}
      {payload?.type === "measurement" && <MeasurementCard measurement={payload.measurement} />}
    </div>
  );
}

function Chat({
  tabId, tabBar, draft, initialConfig, initialItems, onDraft, onConfig, onModel, onItems,
  path,
  part,
  subject,
  wholeProject,
  messages,
  agent,
  agents,
  resume,
  hidden,
  seed,
  onSeed,
  onSession,
  onAgent,
  onBusy,
  onSignIn,
}: {
  tabId: string;
  tabBar?: ReactNode;
  draft?: { text: string; files: string[] };
  initialConfig?: Record<string, string>;
  initialItems?: Item[];
  onDraft?: (draft: { text: string; files: string[] }) => void;
  onConfig?: (values: Record<string, string>) => void;
  onModel?: (model: string) => void;
  onItems?: (items: Item[]) => void;
  path: string;
  // The project's own transcript, which outlives any one conversation. Hidden
  // columns are handed an empty list, since only the selected project loads one.
  messages: Message[];
  // The column's identity: this is the part's conversation, whatever the
  // viewer shows by the time a reply lands.
  part: string;
  // What the copy calls this conversation: the part, or the folder when the
  // conversation is about every part in it.
  subject?: string | null;
  // True only for a folder's own conversation. A project holding one part has a
  // single conversation, and it is that part's.
  wholeProject?: boolean;
  // Fixed for the life of the conversation: a resumed session keeps the agent
  // that ran it, a fresh one takes the default from the agents pane.
  agent: string;
  // Everything the app can host, for the header's switcher.
  agents: { id: string; label: string; loggedIn: boolean | null }[];
  // Every row the project has stored, this part's or not, so a live step can find its
  // row even when it was a project-wide call that this part's transcript leaves out.
  landed?: Message[];
  resume: string | null;
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
}) {
  const label = AGENT_LABEL[agent] ?? agent;
  // Known signed out, not merely unknown: an unknown status stays quiet.
  const signedOut = agents.find((option) => option.id === agent)?.loggedIn === false;
  // The sentinel never reaches copy: everywhere the column says its name, it
  // says the name the owner gave it.
  const isProject = part === PROJECT_CHAT;
  const isNew = part === NEW_PART;
  // The transcript names a part only once it exists.
  const stamp = isProject || isNew ? null : part;
  // A rename can land mid-turn, and the session's event handler outlives the render
  // that made it, so a reply reads the name at the moment it arrives.
  const stampRef = useRef(stamp);
  stampRef.current = stamp;
  const aboutProject = wholeProject ?? isProject;
  const spoken = subject ?? (isProject ? "this project" : part);
  // Claude runs through the app's own driver, which stores the conversation in
  // the project rather than replaying one of its own.
  const isClaude = agent === "claude";
  // The folder's last segment is the project's id in the store.
  const projectId = path.split("/").filter(Boolean).pop() ?? "";
  const [items, setItems] = useState<Item[]>(initialItems ?? []);
  const [busy, setBusy] = useState(false);
  // A resumed transcript starts loading after the first paint, so treat it as
  // starting immediately rather than briefly exposing a live composer.
  const [starting, setStarting] = useState(Boolean(resume));
  // A refused prompt needs explicit resend guidance; a proactive or resume sign-in does not.
  const [authNeeded, setAuthNeeded] = useState<"none" | "sign-in" | "resume" | "resend">("none");
  const [signingIn, setSigningIn] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  // Absolute paths; the Rust side reads them at send time.
  const [attachments, setAttachments] = useState<string[]>(draft?.files ?? []);
  const refusalRef = useRef<string | null>(null);
  // Stop can land before the prompt has gone out, while the files are checked or
  // the session starts. There is nothing to interrupt yet, so the send stands down.
  const stoppedRef = useRef(false);
  const promptingRef = useRef(false);
  const attachmentDraftRef = useRef<AttachmentDraft | null>(null);
  if (!attachmentDraftRef.current) {
    attachmentDraftRef.current = new AttachmentDraft(setAttachments, draft?.files ?? []);
  }
  const attachmentDraft = attachmentDraftRef.current;
  const [dropping, setDropping] = useState(false);
  // One drag over the composer fires enter and leave for every child it crosses,
  // so the hint follows a depth count rather than the last event seen.
  const dragDepth = useRef(0);
  // The transcript follows the reply only while the reader is at the end of it.
  // Scrolling up is deliberate, so a reply that lands then offers a pill.
  const pinnedRef = useRef(true);
  const [newReply, setNewReply] = useState(false);
  const [primed, setPrimed] = useState(readPrimed);
  const [empty, setEmpty] = useState(true);
  const gridfinityAt = useRef(0);
  // The project's transcript in the order it was written, then whatever this
  // turn has produced that has not reached the store yet.
  // CAD specs and measurement changes belong to the shared part. Spoken turns
  // stay in their own tab, even when another agent edits that same part.
  const ordered = messages.filter((message) => message.payload?.type === "spec" || message.payload?.type === "measurement").sort((a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0));
  const said = messages.length > 0 || items.length > 0;
  // The newest stored row, read at event time so a step remembers where the
  // transcript stood when it was called.
  const seqRef = useRef(0);
  seqRef.current = messages.reduce((top, m) => Math.max(top, m.sequence_number ?? 0), 0);
  // The model and effort this conversation runs on. Empty before the agent has
  // ever reported its lists, which is only ever the first chat on this Mac.
  const [config, setConfig] = useState<ConfigRow[]>([]);
  const choicesRef = useRef<Record<string, string>>({ ...initialConfig });
  const [providerConfigs, setProviderConfigs] = useState<Record<string, ConfigRow[]>>({});
  const [providerLoading, setProviderLoading] = useState<Record<string, boolean>>({});
  const [providerErrors, setProviderErrors] = useState<Record<string, string | null>>({});
  const [configuring, setConfiguring] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const configuringRef = useRef(false);
  const configRequestsRef = useRef<Record<string, number>>({});
  const discoveryRef = useRef(new Set<string>());
  const discoveryStartedRef = useRef(false);
  const providerIds = agents.map((option) => option.id).join(",");
  const startupIdRef = useRef<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [lastEventAt, setLastEventAt] = useState(Date.now());
  const [turnStartedAt, setTurnStartedAt] = useState(Date.now());
  const [clock, setClock] = useState(Date.now());
  const [phase, setPhase] = useState("");
  const callbacks = useRef({ onDraft, onConfig, onModel, onItems });
  callbacks.current = { onDraft, onConfig, onModel, onItems };
  useEffect(() => { callbacks.current.onItems?.(items); }, [items]);
  useEffect(() => {
    callbacks.current.onDraft?.({ text: inputRef.current?.value ?? draft?.text ?? "", files: attachments });
  }, [attachments]);
  useEffect(() => {
    if (!config.length) return;
    callbacks.current.onConfig?.(Object.fromEntries(config.map((row) => [row.category, row.value])));
    const model = config.find((row) => row.category === "model");
    if (model) callbacks.current.onModel?.(model.options.find((option) => option.value === model.value)?.name ?? model.value);
  }, [config]);
  useEffect(() => {
    if (!busy && !starting) return;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [busy, starting]);
  const sessionRef = useRef<string | null>(null);
  // The part named in a Claude session's system prompt, which cannot change once
  // the process is up. Older than `part` after a rename.
  const promptedPartRef = useRef(part);
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // The composer grows with its text, two lines at rest and twelve at most,
  // then scrolls. Called after every programmatic write too, because only
  // typing fires onInput.
  const grow = () => {
    const box = inputRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${box.scrollHeight}px`;
    setEmpty(box.value.trim().length === 0);
    callbacks.current.onDraft?.({ text: box.value, files: attachmentDraft.current });
  };
  // Latest callbacks behind stable refs so ensureSession never goes stale.
  const onSessionRef = useRef(onSession);
  onSessionRef.current = onSession;
  const onBusyRef = useRef(onBusy);
  onBusyRef.current = onBusy;

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
      const session = sessionRef.current;
      if (startupIdRef.current) invoke("cancel_chat_start", { startupId: startupIdRef.current }).catch(() => {});
      sessionRef.current = null;
      if (session) invoke("close_chat", { sessionId: session }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    // The scroller is ChatPanel's own column; the ref rides the transcript it
    // wraps, since the panel shell keeps that element to itself.
    const pane = scrollRef.current?.parentElement;
    if (!pane) return;
    const onScroll = () => {
      const atEnd = pane.scrollHeight - pane.scrollTop - pane.clientHeight <= PINNED_SLACK_PX;
      if (atEnd === pinnedRef.current) return;
      pinnedRef.current = atEnd;
      if (atEnd) setNewReply(false);
    };
    onScroll();
    pane.addEventListener("scroll", onScroll, { passive: true });
    return () => pane.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Follow the end of the transcript, and only from the end of it.
    const pane = scrollRef.current?.parentElement;
    if (pane && pinnedRef.current) pane.scrollTop = pane.scrollHeight;
  }, [messages, items, permissions, busy]);

  // Everything the agent has put on screen, counted so a reply that is still
  // streaming moves the number. The user's own lines are not news to the user.
  const replyMark =
    messages.filter((m) => m.role !== "user").length +
    items.reduce(
      (n, item) => n + (item.kind === "agent" ? item.text.length : item.kind === "user" ? 0 : 1),
      0,
    );
  useEffect(() => {
    if (!pinnedRef.current) setNewReply(true);
  }, [replyMark]);

  const jumpToLatest = () => {
    const pane = scrollRef.current?.parentElement;
    pinnedRef.current = true;
    setNewReply(false);
    // Instant, not smooth: every intermediate frame of a smooth scroll is a
    // scroll event away from the end, which unpins and re-arms the pill mid-jump.
    if (pane) pane.scrollTop = pane.scrollHeight;
  };

  // New conversation clears the composer; every other remount keeps it.
  const discardRef = useRef(false);
  const keyRef = useRef(tabId);
  keyRef.current = tabId;
  useEffect(() => {
    const box = inputRef.current;
    const restored = draft ?? unstashDraft(keyRef.current);
    if (box && restored.text) {
      box.value = restoreDraftText(restored.text, box.value);
      grow();
    }
    attachmentDraft.restore(restored.files);
    return () => {
      if (discardRef.current) return;
      stashDraft(keyRef.current, { text: box?.value ?? "", files: attachmentDraft.current });
    };
  }, [attachmentDraft]);

  useEffect(() => {
    // Dev-only test hook: the Rust side forwards loopback-socket text here so
    // UI automation can fill the composer without stealing keyboard focus.
    if (!import.meta.env.DEV || hidden) return;
    const unlisten = listen<string>("test-type", (event) => {
      if (inputRef.current) inputRef.current.value = event.payload;
      grow();
    });
    return () => {
      unlisten.then((stop) => stop()).catch(() => {});
    };
  }, [hidden]);

  useEffect(() => {
    // Same hook, submit half: every mounted column hears the event, so only
    // the visible one sends.
    if (!import.meta.env.DEV || hidden) return;
    const unlisten = listen("test-send", () => {
      inputRef.current?.form?.requestSubmit();
    });
    return () => {
      unlisten.then((stop) => stop()).catch(() => {});
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
      grow();
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
      if (event.payload.type === "enter") setDropping(true);
      if (event.payload.type === "leave") setDropping(false);
      if (event.payload.type === "drop") {
        setDropping(false);
        const paths = event.payload.paths;
        attachmentDraft.add(paths);
      }
    });
    return () => {
      unlisten.then((stop) => stop()).catch(() => {});
    };
  }, [hidden, attachmentDraft]);

  const applyEvent = useCallback(
    (event: ChatEvent) => {
      setLastEventAt(Date.now());
      if (restoringRef.current && initialItems?.length && !["session_error", "activity"].includes(event.type)) return;
      if (event.type === "activity") { setPhase(event.phase); return; }
      setPhase(event.type === "agent_thought" ? "Receiving provider thinking" : event.type === "agent_text" ? "Receiving response" : `Waiting for ${label}'s next update`);
      switch (event.type) {
        case "session_info":
          // Titles have no home since the visible session list went away.
          return;
        case "permission_request":
          setPermissions((list) => [
            ...list,
            { id: event.id, title: event.title, options: event.options },
          ]);
          return;
        case "permission_resolved":
          setPermissions((list) => list.filter((p) => p.id !== event.id));
          return;
        case "prose":
          // Store prose in the CAD history while retaining this tab's own copy.
          // Another conversation's prose never enters this tab's transcript.
          if (isClaude) {
            // Drop the streaming copy only once the row exists, or the text
            // blinks out for the refetch's round trip.
            addMessage(projectId, "assistant", event.text, stampRef.current)
              .catch((e) => setItems((list) => [...list, { kind: "note", text: String(e) }]));
            return;
          }
          break;
        case "session_error": {
          // The dead session is gone from the Rust map too; forgetting it here
          // is what lets the next send start the fresh chat the note promises.
          // The driver's session lives on disk, so the next start resumes it.
          if (isClaude && sessionRef.current) resumeRef.current = sessionRef.current;
          sessionRef.current = null;
          const trouble = isClaude ? claudeNote(event.message) : null;
          if (trouble) {
            setItems((list) => withNote(list, trouble));
            return;
          }
          break;
        }
      }
      setItems((list) => applyChatEvent(list, event, Date.now(), seqRef.current));
    },
    [isClaude, projectId, label],
  );

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
      setTurnStartedAt(Date.now());
      setLastEventAt(Date.now());
      setPhase(requestedResume ? "Restoring conversation" : `Connecting to ${label}`);
      try {
        const startupId = crypto.randomUUID();
        startupIdRef.current = startupId;
        const onEvent = new Channel<ChatEvent>();
        onEvent.onmessage = applyEvent;
        const session = await invoke<string>("start_chat", {
          path,
          agent,
          part,
          onEvent,
          resume: requestedResume,
          startupId,
          initialConfig: choicesRef.current,
        });
        if (closedRef.current) {
          // The user switched projects while the adapter was starting; without
          // this, the session outlives its column until app exit.
          invoke("close_chat", { sessionId: session }).catch(() => {});
          throw new Error("chat closed");
        }
        if (stoppedRef.current) {
          await invoke("close_chat", { sessionId: session }).catch(() => {});
          throw new Error("Stopped before sending. Your draft is preserved.");
        }
        sessionRef.current = session;
        promptedPartRef.current = part;
        resumeRef.current = null;
        restoringRef.current = false;
        onSessionRef.current(session);
        // The live session is authoritative: it may have clamped a remembered
        // pick the account no longer offers.
        refreshConfig();
        return session;
      } finally {
        startupIdRef.current = null;
        startRef.current = null;
        setStarting(false);
        setCancelling(false);
      }
    })();
    startRef.current = start;
    return start;
  }, [path, part, agent, applyEvent, refreshConfig]);

  const restoreSession = useCallback(async () => {
    try {
      await ensureSession();
    } catch (e) {
      const message = String(e);
      if (message === "Error: chat closed") return;
      const trouble = isClaude ? claudeNote(message) : null;
      if (trouble) {
        setItems((list) => withNote(list, trouble));
      } else if (message.includes("auth_required")) {
        setAuthNeeded("resume");
      } else {
        setItems((list) => [...list, { kind: "note", text: message }]);
      }
    }
  }, [ensureSession, isClaude]);

  useEffect(() => {
    // A history session replays its transcript when it opens, not on the first send; reuse this path after sign-in.
    if (resume) restoreSession();
  }, [resume, restoreSession]);

  const send = useCallback(
    async (text: string, files: string[]) => {
      sendingRef.current = true;
      stoppedRef.current = false;
      setCancelling(false);
      setTurnStartedAt(Date.now());
      setLastEventAt(Date.now());
      setPhase(`Preparing ${label}`);
      // A refused file was about the draft this send replaces, and a failed restore
      // has been said. Live notes sit below Claude's stored turns, so left alone
      // either would trail every later reply.
      setItems((list) =>
        list.filter(
          (item) =>
            item.kind !== "note" ||
            (item.text !== refusalRef.current && !(isClaude && item.text === RESTORE_FAILED)),
        ),
      );
      const localId = nextLocalIdRef.current++;
      // Each conversation owns its spoken turns, including native Claude.
      // The project also keeps a shared audit trail for the CAD tools.
      {
        setItems((list) => [
          ...list,
          {
            kind: "user",
            text,
            files: files.length ? files.map(basename) : undefined,
            localId,
          },
        ]);
      }
      setBusy(true);
      onBusyRef.current(true);
      // The send is the only half of the turn that makes a sound. Stopping is
      // the user changing their mind, which is not news to them.
      cue("press");
      setAuthNeeded("none");
      let completed = false;
      let stored = false;
      let refused = false;
      // Nothing was sent. Restore it ahead of any next draft composed during
      // the turn, and keep both turns' attachments.
      const restoreDraft = () => {
        setItems((list) =>
          list.filter((item) => item.kind !== "user" || item.localId !== localId),
        );
        if (inputRef.current) {
          inputRef.current.value = restoreDraftText(text, inputRef.current.value);
          grow();
        }
        attachmentDraft.restore(files);
      };
      try {
        if (files.length > 0) {
          refused = true;
          await invoke("check_attachments", { attachments: files, claude: isClaude });
          refused = false;
        }
        const session = await ensureSession();
        if (stoppedRef.current) {
          restoreDraft();
          return;
        }
        if (isClaude) {
          await addMessage(
            projectId,
            "user",
            text,
            stamp,
            files.length ? files.map(basename) : undefined,
          );
          stored = true;
        }
        promptingRef.current = true;
        const renamed = isClaude && promptedPartRef.current !== part;
        promptedPartRef.current = part;
        await invoke<string>("send_prompt", {
          sessionId: session,
          // For the agent only: the transcript already holds what the person typed.
          text: renamed ? `${text}\n\n(This part is now called "${part}". Use that name from here on.)` : text,
          part: part ?? null,
          attachments: files,
        });
        completed = true;
      } catch (e) {
        const message = String(e);
        const trouble = isClaude ? claudeNote(message) : null;
        // Before send_prompt starts, every failure is an unsent draft. Once a
        // prompt is in flight, restoring it could accidentally send it twice.
        if (!stored && !promptingRef.current) restoreDraft();
        if (trouble || refused || message.includes("auth_required")) {
          if (trouble) setItems((list) => withNote(list, trouble));
          else if (refused) {
            refusalRef.current = message;
            setItems((list) => withNote(list, message));
          } else setAuthNeeded("resend");
        } else {
          setItems((list) => withNote(list, message));
        }
      } finally {
        promptingRef.current = false;
        sendingRef.current = false;
        setBusy(false);
        onBusyRef.current(false);
        setPermissions([]);
        setCancelling(false);
        // Every completed turn gets a cue, where the old chime waited 8s: the cue
        // is short enough that a short reply can have one, and it marks the beat.
        // Two of them: "ready" is for someone watching the part, "arrival"
        // carries to another window, where the reply is news rather than a beat.
        if (completed) cue(document.hasFocus() ? "ready" : "arrival");
      }
    },
    [ensureSession, part, attachmentDraft, isClaude, projectId],
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
      starting ||
      startRef.current
    )
      return;
    // Reserve the turn before waiting: a second Enter must not queue another
    // send while a pasted image is still crossing the IPC boundary.
    sendingRef.current = true;
    if (box) {
      box.value = "";
      grow();
    }
    const files = await attachmentDraft.take();
    if (!text && files.length === 0) {
      sendingRef.current = false;
      return;
    }
    if (!primed) {
      try {
        localStorage.setItem(PRIMED_KEY, "1");
      } catch {
        // The examples stay for another session; nothing else depends on this.
      }
      setPrimed(true);
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
    attachmentDraft
      .track(saved)
      .catch((e) => setItems((list) => [...list, { kind: "note", text: String(e) }]));
  };

  // The viewer listens for this and snaps its grid to the standard pitch. Once
  // every ten seconds at most, because it fires on every keystroke of the word.
  const nudgeGridfinity = (text: string) => {
    if (!/gridfinity/i.test(text)) return;
    const now = Date.now();
    if (now - gridfinityAt.current < GRIDFINITY_GAP_MS) return;
    gridfinityAt.current = now;
    window.dispatchEvent(new CustomEvent("nurb:gridfinity"));
  };

  const typed = (event: FormEvent<HTMLTextAreaElement>) => {
    grow();
    nudgeGridfinity(event.currentTarget.value);
    callbacks.current.onDraft?.({ text: event.currentTarget.value, files: attachments });
  };

  const dragEnter = (event: DragEvent<HTMLFormElement>) => {
    if (!event.dataTransfer?.types.includes("Files")) return;
    dragDepth.current += 1;
    setDropping(true);
  };

  const dragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDropping(false);
  };

  const dragDrop = (event: DragEvent<HTMLFormElement>) => {
    // Without this the WKWebView navigates to a URL dragged in from Mail or
    // Notes, and there is no back button to come home with.
    event.preventDefault();
    dragDepth.current = 0;
    setDropping(false);
  };

  const keydown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const cancel = async () => {
    stoppedRef.current = true;
    setCancelling(true);
    if (startupIdRef.current) await invoke("cancel_chat_start", { startupId: startupIdRef.current }).catch(() => {});
    const session = sessionRef.current;
    if (session && promptingRef.current) await invoke("cancel_turn", { sessionId: session }).catch((e) => setItems((list) => withNote(list, String(e))));
  };
  const disconnect = async () => {
    stoppedRef.current = true;
    const session = sessionRef.current;
    if (startupIdRef.current) await invoke("cancel_chat_start", { startupId: startupIdRef.current }).catch(() => {});
    if (session) await invoke("close_chat", { sessionId: session });
    sessionRef.current = null;
    setBusy(false); setStarting(false); setCancelling(false); onBusyRef.current(false);
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
      setAuthNeeded((state) => (state === "none" ? "sign-in" : state));
    } finally {
      setSigningIn(false);
    }
  };

  // The permission event carries no tool kind, so only pattern matches
  // translate; anything else reads as "use: <title>". The Rust fallback title
  // is already a full sentence.
  const askedFor = (title: string) => {
    if (title.startsWith(`${label} `)) return title;
    const asked = describe(title, undefined, 1);
    return asked === title ? `${label} wants to use: ${title}` : `${label} wants to ${asked}`;
  };

  // First run, an idle composer, nothing typed: the examples have the floor.
  const priming = !primed && !busy && !starting && empty;

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

  // Turn numbers run across the stored transcript and whatever this turn has
  // produced that has not reached the store yet.
  let counted = 0;
  const nextTurn = () => String(++counted).padStart(2, "0");

  // Shared CAD cards precede this conversation's own prose and expandable tool calls.
  const flow: ({ kind: "stored"; message: Message } | { kind: "live"; item: Item; index: number })[] = [];
  for (const message of ordered) if (message.content || !isWork(message)) flow.push({ kind: "stored", message });
  items.forEach((item, index) => flow.push({ kind: "live", item, index }));

  const work = activityStatus({ label, starting, restoring: restoringRef.current, cancelling, permission: permissions.length > 0, phase, lastEventAt, now: clock, tools: items.flatMap((item) => item.kind === "step" ? [{ kind: "tool" as const, id: item.step.id, title: item.tool ?? `${item.step.verb} ${item.step.object}`, status: item.step.status === "running" ? "in_progress" : item.step.status === "done" ? "completed" : item.step.status }] : []) });

  return (
    <div className="fork-chat" hidden={hidden}>
    {tabBar}
    <ChatPanel
      hidden={hidden}
      dragRegion
      strip={{ label: "Conversation" }}
      composer={
        <form
          onSubmit={submit}
          onDragEnter={dragEnter}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={dragLeave}
          onDrop={dragDrop}
          className={clsx(
            "relative flex flex-col gap-2.5 rounded-[6px] border pt-2.5 pr-2.5 pb-2 pl-3 transition-colors",
            dropping ? "border-accent bg-accent-wash" : "border-line bg-ground",
          )}
        >
          <DropHint active={dropping} />
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {attachments.map((path) => (
                <span
                  key={path}
                  className="mono-id inline-flex items-center gap-1 rounded-[3px] bg-raised px-1.5 py-0.5 text-muted"
                >
                  <span className="max-w-[140px] truncate">{basename(path)}</span>
                  <button
                    type="button"
                    className="text-faint hover:text-ink"
                    aria-label={`remove ${basename(path)}`}
                    onClick={() => attachmentDraft.remove(path)}
                  >
                    <Icon name="xmark" className="size-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <span className="relative block">
            <textarea
              ref={inputRef}
              className="text-chat max-h-[216px] min-h-[36px] w-full resize-none overflow-y-auto bg-transparent text-ink placeholder:text-faint focus:outline-none disabled:text-muted"
              placeholder={
                priming
                  ? ""
                  : busy
                    ? `${label} is working…`
                    : starting
                      ? restoringRef.current
                        ? "Restoring conversation…"
                        : `Starting ${label}…`
                      : isNew
                        ? "Describe the new part…"
                        : `Describe or change ${spoken}…`
              }
              rows={2}
              disabled={starting}
              onInput={typed}
              onKeyDown={keydown}
              onPaste={paste}
            />
            <CyclingPlaceholder
              lines={FIRST_RUN_PLACEHOLDERS}
              active={priming}
              className="text-chat text-faint"
            />
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-0.5">
              <IconButton
                icon="plus"
                label="attach photos or files"
                className="size-6.5"
                disabled={starting}
                onClick={attach}
              />
              <ModelPicker agent={agent} providers={agents.map((provider) => ({ ...provider, config: provider.id === agent ? config : providerConfigs[provider.id] ?? [], loading: providerLoading[provider.id], error: providerErrors[provider.id] }))}
                config={config} disabled={false} activeProviderBusy={busy || starting} configuring={configuring} error={configError} hasConversation={said}
                onSelectModel={selectModel} onSelectConfig={pick} onRefresh={discoverModels} onSignIn={onSignIn}
                onOpen={() => { if (!discoveryStartedRef.current) { discoveryStartedRef.current = true; void discoverModels(); } }} />
              <McpPanel path={path} sessionId={sessionRef.current} hidden={hidden} />
            </div>
            {busy || starting ? (
              <Button type="button" variant="accent" onClick={(event) => { event.preventDefault(); void cancel(); }}>
                stop
              </Button>
            ) : (
              <Button type="submit" variant="ink" trailingIcon="arrow-up" disabled={starting}>
                send
              </Button>
            )}
          </div>
        </form>
      }
    >
      <div ref={scrollRef} className="flex flex-col gap-4 px-4 pt-3.5 pb-3">
        {!said && !busy && (
          <p className="text-chat text-muted">
            {isNew
              ? `Describe the new part for ${spoken}, and ${label} will model it here. It can use the sizes the other parts in ${spoken} share.`
              : aboutProject
              ? `This conversation covers every part in ${spoken}. Ask ${label} for a new part, or for a change they should all share.`
              : `You're chatting with ${spoken}. Describe it or ask for changes, and ${label} will model it in the viewer.`}
          </p>
        )}
        {/* Nothing said yet and the agent is known to be signed out: ask before the first message bounces. */}
        {!said && !starting && authNeeded === "none" && signedOut && (
          <div className="flex flex-col items-start gap-2 rounded-[6px] bg-raised p-3">
            <p className="text-chat text-muted">
              {isClaude ? CLAUDE_SIGN_IN : `Sign in to ${label} to start.`}
            </p>
            {!isClaude && (
              <Button variant="accent" disabled={signingIn} onClick={signIn}>
                {signingIn ? "signing in…" : "sign in"}
              </Button>
            )}
          </div>
        )}
        {flow.map((entry) => {
          if (entry.kind === "stored") {
            return (
              <Stored
                key={entry.message.id}
                message={entry.message}
                who={label}
                n={entry.message.content || entry.message.files?.length ? nextTurn() : undefined}
              />
            );
          }
          const { item, index } = entry;
          switch (item.kind) {
            case "user":
              return (
                <Turn key={index} who="You" n={nextTurn()} text={item.text}>
                  <p className="text-chat whitespace-pre-wrap text-ink-soft">{item.text}</p>
                  {item.files && <FileNames names={item.files} />}
                </Turn>
              );
            case "agent":
              return (
                <Turn key={index} who={label} n={nextTurn()} text={item.text}>
                  <div className="text-chat text-ink-soft">
                    <AssistantMarkdown
                      content={item.text}
                      streaming={busy && index === items.length - 1}
                    />
                  </div>
                </Turn>
              );
            case "thought":
              return (
                <details key={index} className="group">
                  <summary className="mono-label chrome cursor-default list-none text-faint hover:text-muted">
                    Thinking
                  </summary>
                  <div className="mt-1.5 text-[12.5px] leading-[18px] text-faint">{item.text}</div>
                </details>
              );
            case "plan":
              return (
                <ul key={index} className="flex flex-col gap-1">
                  {item.entries.map((entry, i) => (
                    <li
                      key={i}
                      className={clsx(
                        "text-[12.5px] leading-[18px]",
                        PLAN_TONE[entry.status] ?? "text-muted",
                      )}
                    >
                      {entry.content}
                    </li>
                  ))}
                </ul>
              );
            case "step":
              return <details key={item.step.id} className="fork-tool">
                <summary><span>{item.tool ?? `${item.step.verb} ${item.step.object}`}</span><span>{item.step.status} · {elapsedLabel((item.step.elapsed_s ?? Math.max(0, (clock - Date.parse(item.step.started_at)) / 1000)) * 1000)}</span></summary>
                {item.step.input !== undefined && <pre>{typeof item.step.input === "string" ? item.step.input : JSON.stringify(item.step.input, null, 2)}</pre>}
                {item.step.output && <pre>{typeof item.step.output === "string" ? item.step.output : JSON.stringify(item.step.output, null, 2)}</pre>}
              </details>;
            case "note":
              return (
                <p key={index} className="text-chat text-muted">
                  {item.text}
                </p>
              );
          }
        })}
        {(busy || starting) && <div className="fork-activity" role="status" aria-live="polite">
          <div><strong>{work.title}</strong><span>{elapsedLabel(clock - turnStartedAt)}</span></div>
          <p>{work.detail}</p>
          {cancelling && work.quiet && <button type="button" onClick={() => void disconnect().catch((e) => setItems((list) => withNote(list, String(e))))}>Disconnect agent</button>}
        </div>}
        {authNeeded !== "none" && (
          <div className="flex flex-col items-start gap-2 rounded-[6px] bg-raised p-3">
            <p className="text-chat text-muted">{label} isn't signed in on this Mac.</p>
            <Button variant="accent" disabled={signingIn} onClick={signIn}>
              {signingIn ? "signing in…" : "sign in"}
            </Button>
          </div>
        )}
        <ApprovalCard
          questions={permissions.map((permission) => ({
            id: permission.id,
            title: askedFor(permission.title),
            actions: permission.options.map((option) => ({
              id: option.optionId,
              label: option.name,
              variant: permissionVariant(option.kind),
            })),
          }))}
          onAnswer={(id, optionId) => {
            const permission = permissions.find((p) => p.id === id);
            if (permission) answerPermission(permission, optionId);
          }}
        />
        {/* The pill rides the end of the transcript, so a reply that lands while
            the user is reading further up is an offer rather than a jump. */}
        <div className="sticky bottom-2 z-10 h-0">
          <NewItemsPill count={newReply ? 1 : 0} onClick={jumpToLatest} label={() => "New reply"} />
        </div>
      </div>
    </ChatPanel>
    </div>
  );
}

export default Chat;
