import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { message, open as pickFolder } from "@tauri-apps/plugin-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cue, duration, ease, Icon, IconButton, LiveActivity, useLiveActivity } from "@nurb/ui";
import {
  claimMessages,
  configure,
  createProject,
  fetchProject,
  fetchProjects,
  importFolder,
  listParts,
  movePart,
  promoteToFolder,
  type LibraryPart,
  type ProjectSummary,
} from "@nurb/workbench/api";
import { reconnect, useLive } from "@nurb/workbench/live";
import { useProject } from "@nurb/workbench/useProject";
import PartView from "@nurb/workbench/PartView";
import AddAgent from "./AddAgent";
import Chat, { AGENT_LABEL, NEW_PART, PROJECT_CHAT } from "./Chat";
import {
  chatKey,
  markChatSeen,
  renameChatColumn,
  renameChatSelection,
  readChatTabs,
  readDurableChatTabs,
  pinChatProviders,
  selectedChat,
  closeChatTab,
  migrateChatTabs,
  CHAT_TABS_KEY,
  updateChatActivity,
  type ChatColumn,
} from "./chatColumns";
import ConversationTabs from "./ConversationTabs";
import LegacyChat from "./LegacyChat";
import { FORK_LABEL } from "./forkIdentity";
import { coalescedSave } from "./coalescedSave";
import "./fork.css";
import EngineStarting from "./EngineStarting";
import { createLatestRequestGate } from "./latestRequest";
import Library from "./Library";
import ProjectPanel from "./ProjectPanel";
import { openInSlicer, saveToDownloads } from "./downloads";
import { messagesForPart, moveTargets, titleCase } from "./parts";
import ProjectPicker from "./ProjectPicker";
import Setup from "./Setup";
import Settings, { type AboutInfo, type SettingsSection } from "./Settings";
import { broughtOver, importV1Folders, notBroughtOver } from "./v1Import";

/** What the picker needs to know about the part it is placing. */
type PickTarget = { id: string | null; name: string; project_id: string; folder: boolean };

// A part being started inside a folder: the parts the folder already had, its
// last turn before the draft, and the part once the agent has written it.
type Draft = { projectId: string; had: string[]; after: number; landed: string | null };

type ServeInfo = {
  url: string;
  port: number;
  pid: number;
  token: string;
};

type AgentStatus = {
  id: string;
  label: string;
  installed: boolean;
  loggedIn: boolean | null;
  detail: string | null;
  note: string;
  install: string | null;
};

const PROJECT_KEY = "nurb.project";

// motion's types want a tuple; ease.out is a plain number[].
const OUT = ease.out as [number, number, number, number];

/** What a part page asks for when it starts or finishes work the window should show. */
type ActivityDetail = {
  id: string;
  title: string;
  detail?: string;
  tone: "working" | "done" | "fail";
};

const readProject = () => {
  try {
    return localStorage.getItem(PROJECT_KEY);
  } catch {
    return null;
  }
};

const writeProject = (id: string | null) => {
  try {
    if (id) localStorage.setItem(PROJECT_KEY, id);
    else localStorage.removeItem(PROJECT_KEY);
  } catch {
    // A locked storage is not a reason to lose the selection this run.
  }
};

function App() {
  const reduced = useReducedMotion() === true;
  // null while the check runs, which shows the engine screen rather than an
  // empty window; false when first-launch provisioning has work to do; true once
  // the environment is healthy and the app can start.
  const [ready, setReady] = useState<boolean | null>(null);
  const [served, setServed] = useState(false);
  // Settings hands this endpoint to a coding assistant on the same Mac.
  const [serveInfo, setServeInfo] = useState<ServeInfo | null>(null);
  const [serveError, setServeError] = useState<string | null>(null);
  const [serveLog, setServeLog] = useState<string | null>(null);

  // The app is two screens: the library it opens on, and the workspace a part
  // card leads into. Settings takes the whole window over both.
  const [screen, setScreen] = useState<"library" | "workspace">("library");

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  // The library opens on every part at once; a folder narrows it.
  const [allParts, setAllParts] = useState<LibraryPart[]>([]);
  const [showAll, setShowAll] = useState(true);
  // The part waiting for a project, and what the picker has to say about it. A
  // part the person has not described yet has no row of its own, so the picker
  // works from the container it would live in.
  const [picking, setPicking] = useState<PickTarget | null>(null);
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(readProject);
  const [partName, setPartName] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [importing, setImporting] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const listSeq = useRef(0);

  // The agent's working directory for each project, resolved once and reused:
  // a chat column cannot mount before it has one.
  const [dirs, setDirs] = useState<Record<string, string>>({});

  const [columns, setColumns] = useState<ChatColumn[]>([]);
  const [selectedTabs, setSelectedTabs] = useState<Record<string, string>>({});
  const [closedTabs, setClosedTabs] = useState<ChatColumn[]>([]);
  const [tabsReady, setTabsReady] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);
  const [tabWrites] = useState(() => coalescedSave(
    (state: { columns: ChatColumn[]; selected: Record<string, string>; history: ChatColumn[] }) => invoke<void>("save_chat_tabs", { state }),
    (e) => setError(`Could not save conversations: ${String(e)}`),
  ));
  useEffect(() => {
    let stale = false;
    invoke<{ columns: ChatColumn[]; selected: Record<string, string>; history?: ChatColumn[] } | null>("load_chat_tabs").then((saved) => {
      if (stale) return;
      const legacy = readChatTabs(localStorage.getItem(CHAT_TABS_KEY));
      const durable = saved ? readDurableChatTabs(saved) : null;
      const state = durable ?? legacy;
      const provider = localStorage.getItem("nurb-default-agent") ?? "claude";
      setColumns(pinChatProviders(state.columns, provider));
      setSelectedTabs(state.selected);
      setClosedTabs(pinChatProviders(durable ? durable.history : readChatTabs(localStorage.getItem(`${CHAT_TABS_KEY}-closed`)).columns, provider));
      setTabsReady(true);
    }).catch((e) => setError(`Could not load saved conversations: ${String(e)}`));
    return () => { stale = true; };
  }, []);
  useEffect(() => {
    if (!tabsReady || !migrationDone) return;
    tabWrites.update({ columns, selected: selectedTabs, history: closedTabs });
  }, [columns, selectedTabs, closedTabs, tabsReady, migrationDone, tabWrites]);
  useEffect(() => {
    const flush = () => { void tabWrites.flush(); };
    window.addEventListener("pagehide", flush);
    return () => { window.removeEventListener("pagehide", flush); flush(); };
  }, [tabWrites]);
  // The folder just made, until its refetch says so itself: the chat has already
  // moved to the part, and must not vanish for the round trip.
  const [promoted, setPromoted] = useState<string | null>(null);
  const [busyChats, setBusyChats] = useState<Record<string, boolean>>({});
  const busyRef = useRef(busyChats);
  busyRef.current = busyChats;

  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [agentStatusState, setAgentStatusState] = useState<"loading" | "ready" | "error">("loading");
  const agentStatusRequests = useRef(createLatestRequestGate());
  const [signingIn, setSigningIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [defaultAgent, setDefaultAgent] = useState(
    () => localStorage.getItem("nurb-default-agent") ?? "claude",
  );

  const [about, setAbout] = useState<AboutInfo | null>(null);
  const [settingsSection, setSettingsSection] = useState<SettingsSection | null>(null);
  // The project panel (sheet 31), opened over whatever screen asked for it.
  const [projectPanel, setProjectPanel] = useState<{ id: string; name: string } | null>(null);
  // A request waiting in a part's composer, put there by the project panel and never sent for the person.
  const [composerSeed, setComposerSeed] = useState<{ projectId: string; part: string; text: string } | null>(null);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const geminiKeyResolver = useRef<((key: string | null) => void) | null>(null);

  // One pod for work the window should mention: an export the part page started,
  // a build that landed on a part nobody is looking at.
  const { activity, start: startActivity, succeed: activityDone, fail: activityFailed, dismiss: dismissActivity } =
    useLiveActivity({ linger: 2000 });
  const activityId = useRef<string | null>(null);

  useEffect(() => {
    invoke<boolean>("provision_status")
      .then(setReady)
      .catch(() => setReady(false));
  }, []);

  // One serve per app. `resolve` runs before every socket reconnect, so a
  // crashed engine comes back on whatever port the new one took.
  const startServe = useCallback(async () => {
    setServeError(null);
    try {
      const info = await invoke<ServeInfo>("serve_info");
      setServeInfo(info);
      configure({
        base: info.url,
        resolve: async () => {
          // A restarted engine can land on another port; Settings shows this.
          const next = await invoke<ServeInfo>("serve_info");
          setServeInfo(next);
          return next.url;
        },
      });
      // The live hooks subscribed on first render, against the page's own origin.
      reconnect();
      setServed(true);
    } catch (e) {
      setServeError(String(e));
      // The log is what the failed-start screen shows behind "Show log".
      invoke<string>("serve_log")
        .then((text) => setServeLog(text || null))
        .catch(() => setServeLog(null));
      // The launch check never imports the engine, so a venv damaged since
      // install first shows up here. Setup repairs it; Try again never could.
      invoke<boolean>("parts_import_ok")
        .then((ok) => {
          if (!ok) setReady(false);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (ready === true && !served) void startServe();
  }, [ready, served, startServe]);

  const loadProjects = useCallback(async () => {
    const seq = ++listSeq.current;
    const [data, library] = await Promise.all([
      fetchProjects().catch(() => null),
      listParts().catch(() => null),
    ]);
    if (seq !== listSeq.current) return;
    if (library) setAllParts(library.parts);
    if (!data) return;
    setProjects(data.projects);
    setProjectId((current) =>
      current && data.projects.some((p) => p.id === current)
        ? current
        : data.projects[0]?.id ?? null,
    );
  }, []);

  useEffect(() => {
    if (served) void loadProjects();
  }, [served, loadProjects]);

  // Keep the original folder list and tab storage until every migration has succeeded.
  useEffect(() => {
    if (!served || !tabsReady) return;
    let stale = false;
    void (async () => {
      const folders = await invoke<string[]>("take_v1_folders");
      const refused: string[] = [];
      const count = await importV1Folders(folders, async (path) => {
        const imported = await importFolder(path, true);
        await invoke("finish_v1_import", { path, projectId: imported.id });
      }, (text) => refused.push(text));
      const mappings = await invoke<{ path: string; projectId: string }[]>("v1_project_mappings");
      const paths = Object.fromEntries(await Promise.all(mappings.map(async (mapping) => [mapping.path, await invoke<string>("project_dir", { projectId: mapping.projectId })])));
      const archives = (await Promise.all(mappings.map(async (mapping) => {
        const rows = await invoke<{ id: string; agent: string; title: string; part?: string }[]>("list_legacy_chats", { path: mapping.path });
        return rows.map((row): ChatColumn => ({ id: `legacy:${mapping.projectId}:${row.agent}:${row.id}`, path: paths[mapping.path], part: row.part ?? PROJECT_CHAT, agent: row.agent, resume: null, unseen: false, model: row.title || row.agent, legacyPath: mapping.path, legacySession: row.id, legacyAgent: row.agent }));
      }))).flat();
      if (stale) return;
      setDirs((current) => ({ ...current, ...Object.fromEntries(mappings.map((mapping) => [mapping.projectId, paths[mapping.path]])) }));
      setColumns((list) => migrateChatTabs({ columns: list, selected: {} }, paths).columns);
      setClosedTabs((list) => {
        const migrated = migrateChatTabs({ columns: list, selected: {} }, paths).columns;
        const open = migrateChatTabs({ columns, selected: {} }, paths).columns;
        return [...migrated, ...archives.filter((archive) => ![...migrated, ...open].some((tab) => tab.legacySession === archive.legacySession && tab.legacyPath === archive.legacyPath && (tab.legacyAgent ?? tab.agent) === archive.legacyAgent))];
      });
      setSelectedTabs((selected) => {
        const migrated = migrateChatTabs({ columns, selected }, paths);
        return migrated.selected;
      });
      setMigrationDone(true);
      if (refused.length) setError(notBroughtOver(refused));
      await loadProjects();
      if (count) {
        activityId.current = "v1-import";
        startActivity({ title: broughtOver(count) });
        activityDone();
      }
    })().catch((e) => setError(`Could not restore the previous library: ${String(e)}`));
    return () => { stale = true; };
    // This migration runs once after both durable tab state and the engine are ready.
  }, [served, tabsReady]);

  const { project, missing } = useProject(served ? projectId : null);

  // A remembered id whose project is gone clears itself, and the workspace it
  // was showing has nothing left to show.
  useEffect(() => {
    if (!missing) return;
    setProjectId(null);
    setScreen("library");
    void loadProjects();
  }, [missing, loadProjects]);

  // The mounted column is the conversation, so it goes along, running turn and all.
  const moveChat = useCallback((dir: string, was: string, name: string) => {
    setColumns((list) => renameChatColumn(list, dir, was, name));
    setClosedTabs((list) => renameChatColumn(list, dir, was, name));
    setSelectedTabs((map) => renameChatSelection(map, dir, was, name));
  }, []);

  // A rename moves the part's conversation and, when it is the open part, the selection.
  const partRenamed = (renamedIn: string, was: string, name: string) => {
    invoke("rename_part_chat", { projectId: renamedIn, was, name }).catch((e) => setError(String(e)));
    const dir = dirs[renamedIn];
    if (dir) moveChat(dir, was, name);
    if (renamedIn === projectId) setPartName((open) => (open === was ? name : open));
  };

  useLive((event) => {
    // The library's part count and built time move on a build, not only on a
    // project event, so both refetch the list.
    if (event.kind === "project" || event.kind === "part" || event.kind === "build") void loadProjects();
  });

  useEffect(() => writeProject(projectId), [projectId]);

  // The part page speaks to the window through one event, so a panel deep in the
  // workbench can put its work in the pod without knowing the shell exists.
  useEffect(() => {
    const onActivity = (event: Event) => {
      const said = (event as CustomEvent<ActivityDetail>).detail;
      if (!said?.id || !said.title) return;
      // A result for work this pod never showed still needs something to patch.
      if (activityId.current !== said.id) {
        activityId.current = said.id;
        startActivity({ title: said.title, detail: said.detail });
      }
      if (said.tone === "done") {
        activityDone({ title: said.title, detail: said.detail });
        cue("success");
      } else if (said.tone === "fail") {
        activityFailed({ title: said.title, detail: said.detail });
        cue("error");
      }
    };
    window.addEventListener("nurb:activity", onActivity);
    return () => window.removeEventListener("nurb:activity", onActivity);
  }, [startActivity, activityDone, activityFailed]);

  // Part id to the build it was last seen finishing. Null until the first list
  // arrives, because a library that has just loaded is history, not news.
  const seenBuilds = useRef<Map<string, string> | null>(null);
  useEffect(() => {
    const before = seenBuilds.current;
    seenBuilds.current = new Map(
      allParts.map((part) => [part.id, part.build?.finished_at ? part.build.id : ""]),
    );
    if (!before) return;
    for (const part of allParts) {
      const build = part.build;
      if (!build?.finished_at) continue;
      const last = before.get(part.id);
      if (last === undefined || last === build.id) continue;
      // The workspace shows its own project's result in the viewer already.
      if (screen === "workspace" && part.project_id === projectId) continue;
      const ok = build.status === "ok";
      activityId.current = `build-${build.id}`;
      startActivity({ title: titleCase(part.name), detail: ok ? "Built" : "Did not build" });
      if (ok) {
        activityDone();
        cue("success");
      } else {
        activityFailed();
        cue("error");
      }
      break;
    }
  }, [allParts, screen, projectId, startActivity, activityDone, activityFailed]);

  const selectProject = useCallback((id: string) => {
    setProjectId(id);
    setPartName(null);
    setShowAll(false);
    setLibraryError(null);
  }, []);

  // A part card is the door into the workspace, wherever the card was shown.
  const openPart = useCallback((id: string, name: string | null) => {
    setProjectId(id);
    setPartName(name);
    setScreen("workspace");
  }, []);

  useEffect(() => {
    // A remembered id may name a project that is gone, and asking for its folder
    // would create one. Wait until the list says the project is really there.
    if (!projectId || dirs[projectId]) return;
    if (!projects.some((p) => p.id === projectId)) return;
    invoke<string>("project_dir", { projectId })
      .then((dir) => setDirs((map) => ({ ...map, [projectId]: dir })))
      .catch((e) => setError(String(e)));
  }, [projectId, dirs, projects]);

  // A folder keeps a conversation for each part in it, plus one about the folder
  // itself. A project holding a single part has one conversation, and the part
  // and the project are the same thing, so it is the project's.
  // A new part's own turns stay on its draft until the turn that wrote it ends.
  const drafting =
    draft !== null && draft.projectId === projectId && (partName === null || partName === draft.landed);
  const isFolder = project?.folder || promoted === projectId;
  const chatPart = drafting ? NEW_PART : isFolder ? partName ?? PROJECT_CHAT : PROJECT_CHAT;

  // One chat per conversation, mounted for as long as its turn runs.
  useEffect(() => {
    if (!migrationDone || !projectId || !dirs[projectId]) return;
    const dir = dirs[projectId];
    // The last conversation picks up where it left off, under the agent that
    // ran it; a part with no saved chat starts fresh with the default.
    invoke<{ sessionId: string; agent: string } | null>("saved_chat", {
      projectId,
      part: chatPart,
    })
      .catch(() => null)
      .then((saved) =>
        setColumns((list) =>
          list.some((col) => col.path === dir && col.part === chatPart)
            ? list
            : [
                ...list,
                {
                  id: crypto.randomUUID(),
                  path: dir,
                  part: chatPart,
                  agent: saved?.agent ?? defaultAgent,
                  resume: saved?.sessionId ?? null,
                  unseen: false,
                },
              ],
        ),
      );
  }, [projectId, dirs, chatPart, migrationDone, defaultAgent]);

  const activeDir = projectId ? dirs[projectId] ?? null : null;

  const visibleColumn = activeDir ? selectedChat(columns, selectedTabs, activeDir, chatPart) : undefined;
  const visibleColumnId = screen === "workspace" ? visibleColumn?.id : undefined;
  useEffect(() => {
    if (visibleColumnId) setColumns((list) => markChatSeen(list, visibleColumnId));
  }, [visibleColumnId]);

  useEffect(() => {
    if (ready === true) invoke<AboutInfo>("about_info").then(setAbout).catch(() => {});
  }, [ready]);
  const checkUpdatesNow = useCallback(async () => {
    await message("This is Nurb Fork. Updates are installed from the fork so your custom features remain available.", { title: "Nurb Fork" });
  }, []);
  useEffect(() => {
    const unlisten = listen("menu:check-updates", () => void checkUpdatesNow());
    return () => { unlisten.then((fn) => fn()).catch(() => {}); };
  }, [checkUpdatesNow]);

  const refreshAgents = useCallback(async () => {
    const isLatest = agentStatusRequests.current.begin();
    setAgentStatusState((state) => (state === "ready" ? state : "loading"));
    try {
      const statuses = await invoke<AgentStatus[]>("agent_statuses");
      if (!isLatest()) return;
      setAgentStatuses(statuses);
      setAgentStatusState("ready");
    } catch (e) {
      if (isLatest()) setAgentStatusState((state) => (state === "ready" ? state : "error"));
      throw e;
    }
  }, []);

  useEffect(() => {
    if (ready === true) refreshAgents().catch(() => {});
  }, [ready, refreshAgents]);

  // Signing in happens outside this window, so coming back is when to notice.
  useEffect(() => {
    if (ready !== true) return;
    const onFocus = () => refreshAgents().catch(() => {});
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [ready, refreshAgents]);

  const chooseAgent = (id: string) => {
    setColumns((list) => pinChatProviders(list, defaultAgent));
    setClosedTabs((list) => pinChatProviders(list, defaultAgent));
    setDefaultAgent(id);
    localStorage.setItem("nurb-default-agent", id);
  };

  const requestGeminiKey = () =>
    new Promise<string | null>((resolve) => {
      geminiKeyResolver.current = resolve;
      setShowGeminiKey(true);
    });

  const finishGeminiKey = (key: string | null) => {
    setShowGeminiKey(false);
    geminiKeyResolver.current?.(key);
    geminiKeyResolver.current = null;
  };

  const signInAgent = async (id: string): Promise<boolean> => {
    const apiKey = id === "gemini" ? await requestGeminiKey() : null;
    if (id === "gemini" && apiKey === null) return false;
    setSigningIn(id);
    setError(null);
    try {
      await invoke("agent_login", { agent: id, apiKey });
      await refreshAgents();
      return true;
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setSigningIn(null);
    }
  };

  // A new part is its own container until the person puts it in a project, so
  // the library never shows an empty shelf waiting to be filled.
  // Inside a folder the part is started there, so the agent works beside its
  // siblings and their shared sizes; the conversation becomes the part's once
  // the agent has written it.
  const newPart = useCallback(async (folderId?: string) => {
    setLibraryError(null);
    try {
      if (folderId) {
        const folder = await fetchProject(folderId);
        const dir = dirs[folderId];
        const running = dir ? columns.some((col) => col.path === dir && col.part === NEW_PART && busyRef.current[col.id]) : false;
        if (!running) {
          await invoke("select_part_chat", { projectId: folderId, part: NEW_PART, sessionId: null });
          setColumns((list) => list.filter((col) => !(col.path === dir && col.part === NEW_PART)));
          setDraft({
            projectId: folderId,
            had: folder.parts.map((part) => part.name),
            after: Math.max(0, ...folder.messages.map((message) => message.sequence_number ?? 0)),
            landed: null,
          });
        }
        setProjectId(folderId);
        setPartName(null);
        setShowAll(false);
        setScreen("workspace");
        return folderId;
      }
      const created = await createProject(undefined, false);
      await loadProjects();
      setProjectId(created.id);
      setPartName(null);
      setShowAll(true);
      setScreen("workspace");
      return created.id;
    } catch (e) {
      setLibraryError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, [loadProjects, dirs]);

  // The first part the folder did not have when the draft began is the one it made.
  useEffect(() => {
    if (!draft || draft.landed) return;
    const made = allParts.find((part) => part.project_id === draft.projectId && !draft.had.includes(part.name));
    if (!made) return;
    setDraft({ ...draft, landed: made.name });
    if (projectId === draft.projectId) setPartName((open) => open ?? made.name);
  }, [draft, allParts, projectId]);

  // The turn that wrote the part is still storing unnamed rows, so the
  // conversation is handed over once it finishes, or its last rows would be left out.
  useEffect(() => {
    if (!draft?.landed) return;
    const dir = dirs[draft.projectId];
    if (!dir || columns.some((col) => col.path === dir && col.part === NEW_PART && busyChats[col.id])) return;
    const { projectId: folderId, landed: name, after } = draft;
    setDraft(null);
    claimMessages(folderId, name, after).catch((e) => setError(String(e)));
    invoke("rename_part_chat", { projectId: folderId, was: NEW_PART, name }).catch((e) => setError(String(e)));
    moveChat(dir, NEW_PART, name);
  }, [draft, dirs, busyChats, moveChat]);

  // The part's own container becomes the folder when it has no project yet;
  // otherwise the folder is made and the part moves into it.
  const addToProject = useCallback(
    async (part: PickTarget, target: { id: string } | { name: string }) => {
      setMoving(true);
      setMoveError(null);
      try {
        let projectTarget = "id" in target ? target.id : null;
        if (!projectTarget && "name" in target) {
          if (!part.folder) {
            const folder = await promoteToFolder(part.project_id, target.name);
            projectTarget = folder.id;
            // The one conversation a loose part has is now that part's own.
            await invoke("rename_part_chat", { projectId: folder.id, was: PROJECT_CHAT, name: part.name });
            const dir = dirs[folder.id];
            if (dir) moveChat(dir, PROJECT_CHAT, part.name);
            setPromoted(folder.id);
          } else {
            const folder = await createProject(target.name, true);
            projectTarget = folder.id;
          }
        }
        if (part.id && projectTarget && projectTarget !== part.project_id) {
          await movePart(part.id, projectTarget);
        }
        await loadProjects();
        setPicking(null);
        setProjectId(projectTarget);
        setPartName(part.id ? part.name : null);
        setShowAll(false);
      } catch (e) {
        setMoveError(e instanceof Error ? e.message : String(e));
      } finally {
        setMoving(false);
      }
    },
    [loadProjects, dirs, moveChat],
  );

  const runImport = useCallback(
    async (path: string) => {
      setLibraryError(null);
      setImporting(true);
      try {
        const imported = await importFolder(path);
        await loadProjects();
        selectProject(imported.id);
      } catch (e) {
        setLibraryError(e instanceof Error ? e.message : String(e));
      } finally {
        setImporting(false);
      }
    },
    [loadProjects, selectProject],
  );

  const pickAndImport = useCallback(async () => {
    const picked = await pickFolder({ directory: true, title: "Choose a folder to import" });
    if (typeof picked === "string") await runImport(picked);
  }, [runImport]);

  // Patched once for the life of the page. Inside the listener effect below
  // these would stack: one more wrapper and one more listener per refetch.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const report = (text: string) => void invoke("debug_log", { text }).catch(() => {});
    const warn = console.warn;
    const error = console.error;
    console.warn = (...args: unknown[]) => { warn(...args); report(`warn: ${args.map(String).join(" ")}`); };
    console.error = (...args: unknown[]) => { error(...args); report(`error: ${args.map(String).join(" ")}`); };
    const onRejection = (e: PromiseRejectionEvent) => report(`unhandled: ${String(e.reason)}`);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      console.warn = warn;
      console.error = error;
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  // The list the test hook resolves a name against, read at event time so the
  // listeners below subscribe once instead of on every refetch.
  const projectsRef = useRef(projects);
  projectsRef.current = projects;
  const partsRef = useRef(allParts);
  partsRef.current = allParts;

  // The debug hook on 127.0.0.1:7399, so a test can drive the app without
  // touching the keyboard or the mouse.
  useEffect(() => {
    if (!served) return;
    const offs = [
      listen<string>("test-create", async (event) => {
        try {
          // A named project is a folder; a part's own container is never named.
          const created = await createProject(event.payload, true);
          await loadProjects();
          selectProject(created.id);
        } catch (e) {
          setLibraryError(String(e));
        }
      }),
      listen<string>("test-open", (event) => {
        const found = projectsRef.current.find((p) => p.name === event.payload);
        if (found) selectProject(found.id);
      }),
      listen<string>("test-import", (event) => void runImport(event.payload)),
      listen<string>("test-part", (event) => {
        const found = partsRef.current.find((p) => p.name === event.payload);
        if (found) openPart(found.project_id, found.name);
      }),
      listen<string>("test-param", (event) => {
        // The range input's own events, through React's native setter, so the
        // page sees exactly what a drag produces.
        const [name, value] = event.payload.split("=");
        const input = document.querySelector<HTMLInputElement>(
          `input[type="range"][aria-label="${name.replace(/_/g, " ")}"]`,
        );
        if (!input) return;
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        setter?.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }),
    ];
    return () => {
      // Unregistering a listener the webview already dropped throws, and the
      // page must not carry an unhandled rejection for a teardown that worked.
      offs.forEach((off) => off.then((fn) => fn()).catch(() => {}));
    };
  }, [served, loadProjects, selectProject, runImport, openPart]);

  const startFresh = (path: string, part: string, agent = defaultAgent, draft?: ChatColumn["draft"], config?: ChatColumn["config"]): Promise<boolean> => {
    const id = crypto.randomUUID();
    setColumns((list) => [...list, { id, path, part, agent, resume: null, draft, config, unseen: false }]);
    setSelectedTabs((map) => ({ ...map, [chatKey(path, part)]: id }));
    return Promise.resolve(true);
  };
  const updateTab = (id: string, patch: Partial<ChatColumn>) => setColumns((list) => list.map((col) => col.id === id && !Object.entries(patch).every(([key, value]) => JSON.stringify(col[key as keyof ChatColumn]) === JSON.stringify(value)) ? { ...col, ...patch } : col));
  const closeTab = (id: string) => {
    if (busyRef.current[id]) { setError("Stop the agent before closing this tab."); return; }
    const closing = columns.find((col) => col.id === id);
    if (!closing) return;
    const next = closeChatTab({ columns, selected: selectedTabs }, id, crypto.randomUUID());
    setClosedTabs((list) => [...list.filter((col) => col.id !== id), closing]);
    setColumns(next.columns);
    setSelectedTabs(next.selected);
  };
  const closeActiveTab = useRef(() => {});
  closeActiveTab.current = () => { if (visibleColumnId) closeTab(visibleColumnId); };
  useEffect(() => {
    const unlisten = listen("menu:close-tab", () => closeActiveTab.current());
    return () => { unlisten.then((fn) => fn()).catch(() => {}); };
  }, []);
  const reopenTab = (id: string) => {
    const tab = closedTabs.find((col) => col.id === id);
    if (!tab) return;
    setColumns((list) => [...list, tab]);
    setClosedTabs((list) => list.filter((col) => col.id !== id));
    setSelectedTabs((map) => ({ ...map, [chatKey(tab.path, tab.part)]: id }));
  };
  const chatStarted = (col: ChatColumn, id: string, agent: string) => {
    const owningProject = Object.entries(dirs).find(([, dir]) => dir === col.path)?.[0];
    if (owningProject) invoke("select_part_chat", { projectId: owningProject, part: col.part, sessionId: id }).catch((e) => setError(String(e)));
    updateTab(col.id, { resume: id, agent });
  };
  const chatBusy = (id: string, agent: string, busy: boolean, visible: boolean) => {
    const wasBusy = Boolean(busyRef.current[id]);
    const next = { ...busyRef.current };
    if (busy) next[id] = true; else delete next[id];
    busyRef.current = next;
    setBusyChats(next);
    setColumns((list) => updateChatActivity(list, id, agent, busy, visible, wasBusy));
  };
  const tabBar = (col: ChatColumn) => <ConversationTabs
    tabs={columns.filter((tab) => tab.path === col.path && tab.part === col.part)} selected={col.id}
    busy={busyChats} closed={closedTabs.filter((tab) => tab.path === col.path && tab.part === col.part)}
    onSelect={(id) => setSelectedTabs((map) => ({ ...map, [chatKey(col.path, col.part)]: id }))}
    onClose={closeTab} onNew={() => { void startFresh(col.path, col.part, col.agent ?? defaultAgent, undefined, col.config); }} onReopen={reopenTab}
  />;

  // Three screens stand in front of the app, and each one hands over rather than
  // cutting: the window dissolves from setup, to the engine starting, to the app.
  const gate = ready === false ? "setup" : !served ? "engine" : "app";

  const chatAgents = agentStatuses
    .filter((status) => status.installed)
    .map((status) => ({
      id: status.id,
      label: AGENT_LABEL[status.id] ?? status.label,
      loggedIn: status.loggedIn,
    }));

  // The one overlay in the app. It doubles as the Gemini key prompt, because
  // that key is the last step of adding Gemini.
  const addAgent =
    showAddAgent || showGeminiKey ? (
      <AddAgent
        missing={agentStatuses.filter((status) => !status.installed)}
        onSubmitGeminiKey={showGeminiKey ? finishGeminiKey : undefined}
        onClose={() => {
          setShowAddAgent(false);
          if (showGeminiKey) finishGeminiKey(null);
          refreshAgents().catch(() => {});
        }}
      />
    ) : null;

  // Every screen stays mounted. A conversation lives in its Chat component, and
  // unmounting one ends the turn it is running, so leaving the workspace hides
  // it rather than tearing it down.
  const app = (
    <>
      <div data-screen="workspace" hidden={screen !== "workspace"}>
        {error ? (
          <div
            role="alert"
            className="panel fixed top-[76px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 px-3 py-2"
          >
            <span className="mono-label text-fail">{error}</span>
            <button type="button" className="btn-label text-muted hover:text-ink" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        ) : null}
        <PartView
          project={project}
          opening={Boolean(projectId) && !project && !drafting}
          partName={partName}
          starting={drafting}
          onSelectPart={setPartName}
          onOpenProject={project && projectId ? () => setProjectPanel({ id: projectId, name: project.name }) : undefined}
          onNewPart={project?.folder ? () => void newPart(project.id) : undefined}
          onAddToProject={
            project && !project.folder && project.parts[0]
              ? () => {
                  setMoveError(null);
                  setPicking({ ...project.parts[0], project_id: project.id, folder: false });
                }
              : undefined
          }
          onPointAt={(text) => projectId && setComposerSeed({ projectId, part: chatPart, text })}
          onPartRenamed={(was, name) => projectId && partRenamed(projectId, was, name)}
          onManagePrinters={() => setSettingsSection("printers")}
          onSaveFile={saveToDownloads}
          onOpenInSlicer={openInSlicer}
          dragRegion
          header={{
            before: (
              <>
                {/* The window's own buttons are painted here by macOS. */}
                <div className="h-full w-[92px] shrink-0" data-tauri-drag-region />
                <div className="h-full w-px bg-line" />
              </>
            ),
            nav: (
              <button
                type="button"
                aria-label="Back to library"
                onClick={() => setScreen("library")}
                className="chrome flex h-full items-center gap-1.5 px-4 text-muted transition-colors hover:text-ink"
              >
                <Icon name="chevron-left" />
                <span className="mono-label">Library</span>
              </button>
            ),
            end: <div className="flex items-center gap-2"><span className="mono-caption text-muted">{FORK_LABEL}</span><IconButton icon="gear" label="Settings" onClick={() => setSettingsSection("agents")} /></div>,
          }}
          chat={
            <>
              {migrationDone && columns.filter((col) => Object.values(dirs).includes(col.path)).map((col) => {
                const agent = col.agent ?? defaultAgent;
                const visible =
                  col.id === visibleColumnId;
                if (col.legacySession && col.legacyPath) return <LegacyChat key={col.id} tab={col} hidden={!visible} tabBar={tabBar(col)} onContinue={(text) => { void startFresh(col.path, col.part, agent, { text, files: col.draft?.files ?? [] }, col.config); }} />;
                return (
                  <Chat
                    key={col.id}
                    tabId={col.id}
                    tabBar={tabBar(col)}
                    draft={col.draft}
                    initialConfig={col.config}
                    initialItems={col.transcript}
                    onItems={(transcript) => updateTab(col.id, { transcript })}
                    onDraft={(draft) => updateTab(col.id, { draft })}
                    onConfig={(config) => updateTab(col.id, { config })}
                    onModel={(model) => updateTab(col.id, { model })}
                    path={col.path}
                    part={col.part}
                    // A folder's own conversation speaks of the folder; every
                    // other column speaks of the part it belongs to.
                    wholeProject={Boolean(project?.folder) && col.part === PROJECT_CHAT}
                    subject={
                      col.part === NEW_PART
                        ? project?.name ?? "this project"
                        : col.part === PROJECT_CHAT
                        ? project?.folder
                          ? project.name
                          : project?.parts[0]?.name ?? "this part"
                        : col.part
                    }
                    // The selected project's transcript, whichever screen is up:
                    // an empty list resets the column's sequence floor, and a step
                    // recorded against zero is pruned the moment the list returns.
                    messages={
                      col.path === activeDir && col.part === NEW_PART
                        ? (project?.messages ?? []).filter(
                            (m) => (m.part ?? null) === null && (m.sequence_number ?? 0) > (draft?.after ?? 0),
                          )
                        : col.path === activeDir
                        ? messagesForPart(
                            project?.messages ?? [],
                            col.part === PROJECT_CHAT ? null : col.part,
                            project?.folder ?? false,
                          )
                        : []
                    }
                    landed={col.path === activeDir ? project?.messages ?? [] : []}
                    agent={agent}
                    agents={chatAgents}
                    resume={col.resume}
                    hidden={!visible}
                    // Addressed to the part's own column: the project's column can be the visible one
                    // for a render while the switch to the part lands.
                    seed={
                      visible && composerSeed?.projectId === projectId && composerSeed.part === col.part
                        ? composerSeed.text
                        : null
                    }
                    onSeed={() => setComposerSeed(null)}
                    onSession={(id) => chatStarted(col, id, agent)}
                    onFresh={() => { void startFresh(col.path, col.part, agent, undefined, col.config); }}
                    onAgent={(id, unstarted, draft, model) => { if (unstarted) chooseAgent(id); return startFresh(col.path, col.part, id, draft, { model }); }}
                    onBusy={(busy) => chatBusy(col.id, agent, busy, visible)}
                    onSignIn={signInAgent}
                  />
                );
              })}
            </>
          }
        />
      </div>

      <div data-screen="library" hidden={screen !== "library"}>
        <Library
          projects={projects}
          allParts={allParts}
          showAll={showAll}
          projectId={projectId}
          updateReady={false}
          updateCard={null}
          onShowUpdate={() => void checkUpdatesNow()}
          importing={importing}
          error={libraryError ?? error}
          onSelectProject={selectProject}
          onSelectAll={() => setShowAll(true)}
          onOpenPart={openPart}
          onNewPart={(folderId) => void newPart(folderId)}
          onAddToProject={(part) => {
            setMoveError(null);
            setPicking(part);
          }}
          onImportFolder={() => void pickAndImport()}
          onPartRenamed={partRenamed}
          onRemoved={(id) => {
            if (id === projectId) setProjectId(null);
            void loadProjects();
          }}
          onSettings={() => setSettingsSection("agents")}
          onOpenProject={(id, name) => setProjectPanel({ id, name })}
        />
      </div>

      {projectPanel ? (
        <div data-screen="project" className="fixed inset-0 z-30">
          <ProjectPanel
            projectId={projectPanel.id}
            name={projectPanel.name}
            onClose={() => setProjectPanel(null)}
            onAsk={(part, text) => {
              setComposerSeed({ projectId: projectPanel.id, part, text });
              setProjectPanel(null);
              openPart(projectPanel.id, part);
            }}
          />
        </div>
      ) : null}

      {settingsSection ? (
        <div data-screen="settings" className="fixed inset-0 z-30">
          <Settings
            agents={agentStatuses.filter((status) => status.installed)}
            agentStatusState={agentStatusState}
            signingIn={signingIn}
            serve={serveInfo}
            about={about}
            onCheckUpdates={import.meta.env.PROD ? () => void checkUpdatesNow() : undefined}
            initialSection={settingsSection}
            onSignIn={signInAgent}
            onMoreAgents={() => setShowAddAgent(true)}
            onClose={() => setSettingsSection(null)}
          />
        </div>
      ) : null}

      {picking ? (
        <ProjectPicker
          partName={picking.name}
          targets={moveTargets(projects, picking)}
          busy={moving}
          error={moveError}
          onPick={(id) => void addToProject(picking, { id })}
          onCreate={(name) => void addToProject(picking, { name })}
          onCancel={() => setPicking(null)}
        />
      ) : null}

      {addAgent}

      {/* Work the window should mention, over everything and out of the way. */}
      <LiveActivity
        activity={activity}
        onDismiss={dismissActivity}
        className="fixed inset-x-0 bottom-5 z-40"
      />
    </>
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={gate}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : duration.arrive, ease: OUT }}
      >
        {gate === "setup" ? (
          <Setup onDone={() => setReady(true)} />
        ) : gate === "engine" ? (
          <EngineStarting error={serveError} log={serveLog} onRetry={() => void startServe()} />
        ) : (
          app
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
