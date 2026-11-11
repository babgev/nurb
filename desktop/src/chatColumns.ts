import type { Item } from "./chatItems";
export type ChatColumn = {
  id: string;
  path: string;
  part: string;
  agent: string | null;
  resume: string | null;
  draft?: { text: string; files: string[] };
  config?: Record<string, string>;
  model?: string;
  unseen: boolean;
  transcript?: Item[];
  legacyPath?: string;
  legacySession?: string;
  legacyAgent?: string;
};

// NUL cannot occur in a filesystem path, so these keys remain unambiguous.
export const chatKey = (path: string, part: string) => `${path}\u0000${part}`;
export const CHAT_TABS_KEY = "nurb-conversation-tabs-v1";
export type SavedChatTabs = { columns: ChatColumn[]; selected: Record<string, string> };

/** A preference change affects future tabs, never an existing blank conversation. */
export function pinChatProviders(columns: ChatColumn[], fallback: string): ChatColumn[] {
  return columns.map((column) => column.agent === null ? { ...column, agent: column.legacyAgent ?? fallback } : column);
}

export function readChatTabs(raw: string | null): SavedChatTabs {
  const empty = { columns: [], selected: {} };
  if (!raw) return empty;
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value.columns)) return empty;
    const ids = new Set<string>();
    const columns: ChatColumn[] = value.columns.filter((col: ChatColumn) => {
      if (!col || typeof col.id !== "string" || ids.has(col.id) || typeof col.path !== "string" || typeof col.part !== "string" || !(col.agent === null || typeof col.agent === "string") || !(col.resume === null || typeof col.resume === "string")) return false;
      ids.add(col.id);
      return true;
    }).map((col: ChatColumn) => ({
      id: col.id, path: col.path, part: col.part, agent: col.agent, resume: col.resume,
      unseen: Boolean(col.unseen),
      transcript: Array.isArray(col.transcript) ? col.transcript : undefined,
      legacyPath: typeof col.legacyPath === "string" ? col.legacyPath : undefined,
      legacySession: typeof col.legacySession === "string" ? col.legacySession : undefined,
      legacyAgent: typeof col.legacyAgent === "string" ? col.legacyAgent : undefined,
      model: typeof col.model === "string" ? col.model : undefined,
      config: col.config && typeof col.config === "object" ? Object.fromEntries(Object.entries(col.config).filter(([, v]) => typeof v === "string")) : undefined,
      draft: col.draft && typeof col.draft.text === "string" && Array.isArray(col.draft.files) ? { text: col.draft.text, files: col.draft.files.filter((file) => typeof file === "string") } : undefined,
    }));
    const selected = Object.fromEntries(Object.entries(value.selected ?? {}).filter(([key, id]) => columns.some((col) => col.id === id && chatKey(col.path, col.part) === key)));
    return { columns, selected: selected as Record<string, string> };
  } catch {
    return empty;
  }
}

export function selectedChat(columns: ChatColumn[], selected: Record<string, string>, path: string, part: string) {
  const group = columns.filter((col) => col.path === path && col.part === part);
  return group.find((col) => col.id === selected[chatKey(path, part)]) ?? group[0];
}

export function closeChatTab(state: SavedChatTabs, id: string, replacementId: string): SavedChatTabs {
  const closing = state.columns.find((col) => col.id === id);
  if (!closing) return state;
  const siblings = state.columns.filter((col) => col.path === closing.path && col.part === closing.part);
  const key = chatKey(closing.path, closing.part);
  if (siblings.length === 1) return {
    columns: state.columns.map((col) => col.id === id ? {
      id: replacementId, path: col.path, part: col.part, agent: col.agent,
      resume: null, unseen: false, config: col.config, model: col.model,
    } : col),
    selected: { ...state.selected, [key]: replacementId },
  };
  const index = siblings.findIndex((col) => col.id === id);
  const next = siblings[index + 1] ?? siblings[index - 1];
  return {
    columns: state.columns.filter((col) => col.id !== id),
    selected: state.selected[key] === id ? { ...state.selected, [key]: next.id } : state.selected,
  };
}

export function updateChatActivity(columns: ChatColumn[], id: string, agent: string, busy: boolean, visible: boolean, wasBusy: boolean) {
  let changed = false;
  const next = columns.map((column) => {
    if (column.id !== id) return column;
    if (busy && (column.agent === null || column.unseen)) {
      changed = true;
      return { ...column, agent: column.agent ?? agent, unseen: false };
    }
    if (!busy && wasBusy && !visible && !column.unseen) {
      changed = true;
      return { ...column, unseen: true };
    }
    return column;
  });
  return changed ? next : columns;
}

export function markChatSeen(columns: ChatColumn[], id: string) {
  const column = columns.find((col) => col.id === id);
  if (!column?.unseen) return columns;
  return columns.map((col) => col.id === id ? { ...col, unseen: false } : col);
}

/** Renaming or promoting a part keeps every tab and its pending draft. */
export function renameChatColumn(columns: ChatColumn[], path: string, was: string, name: string) {
  return columns.map((column) => column.path === path && column.part === was ? { ...column, part: name } : column);
}

export function renameChatSelection(selected: Record<string, string>, path: string, was: string, name: string) {
  const previous = chatKey(path, was);
  if (!(previous in selected)) return selected;
  const { [previous]: id, ...rest } = selected;
  return { ...rest, [chatKey(path, name)]: id };
}

export function migrateChatTabs(state: SavedChatTabs, paths: Record<string, string>): SavedChatTabs {
  const columns = state.columns.map((col) => paths[col.path] ? {
    ...col, path: paths[col.path], legacyPath: col.legacyPath ?? col.path,
    legacySession: col.legacySession ?? col.resume ?? undefined,
    legacyAgent: col.legacyAgent ?? col.agent ?? undefined,
    resume: null,
  } : col);
  const selected: Record<string, string> = {};
  for (const id of Object.values(state.selected)) {
    const column = columns.find((col) => col.id === id);
    if (column) selected[chatKey(column.path, column.part)] = id;
  }
  return { columns, selected };
}


/** A damaged durable file must be reported, never replaced by an empty history. */
export function readDurableChatTabs(value: unknown): SavedChatTabs & { history: ChatColumn[] } {
  if (!value || typeof value !== "object") throw new Error("Saved conversation data is invalid; the original file has been preserved.");
  const saved = value as Record<string, unknown>;
  const parse = (rows: unknown): ChatColumn[] => {
    if (!Array.isArray(rows)) throw new Error("Saved conversation list is invalid; the original file has been preserved.");
    if (rows.some((row) => row && typeof row === "object" && "transcript" in row && row.transcript !== undefined && !Array.isArray(row.transcript))) {
      throw new Error("A saved transcript is invalid; the original file has been preserved.");
    }
    const parsed = readChatTabs(JSON.stringify({ columns: rows, selected: {} })).columns;
    if (parsed.length !== rows.length) throw new Error("Saved conversation entries are invalid; the original file has been preserved.");
    for (const column of parsed) {
      if (!column.transcript) continue;
      for (const item of column.transcript) {
        const valid = item && (
          (["user", "agent", "thought", "note"].includes(item.kind) && "text" in item && typeof item.text === "string") ||
          (item.kind === "plan" && Array.isArray(item.entries) && item.entries.every((entry) => typeof entry.content === "string" && typeof entry.status === "string")) ||
          (item.kind === "step" && item.step && typeof item.step.id === "string" && typeof item.step.status === "string" && typeof item.step.started_at === "string")
        );
        if (!valid) throw new Error("A saved transcript is invalid; the original file has been preserved.");
      }
    }
    return parsed;
  };
  const columns = parse(saved.columns);
  const history = parse(saved.history ?? []);
  return { ...readChatTabs(JSON.stringify({ columns, selected: saved.selected ?? {} })), history };
}
