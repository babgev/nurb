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
};

// NUL cannot occur in a filesystem path, so these keys remain unambiguous.
export const chatKey = (path: string, part: string) => `${path}\u0000${part}`;
export const CHAT_TABS_KEY = "nurb-conversation-tabs-v1";
export type SavedChatTabs = { columns: ChatColumn[]; selected: Record<string, string> };

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
