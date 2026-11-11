export type LegacyConversation = {
  id: string;
  path: string;
  agent: string;
  title: string;
  part?: string;
  sessionId?: string;
  draft?: { text: string; files: string[] };
};

/** Read old tab storage without modifying it or resuming obsolete sessions. */
export function previousConversations(
  rows: LegacyConversation[], paths: string[], saved: unknown[],
): LegacyConversation[] {
  const result = rows.map((row) => ({ ...row }));
  for (const source of saved) {
    if (!source || typeof source !== "object") continue;
    const state = source as Record<string, unknown>;
    for (const entries of [state.columns, state.history]) {
      if (!Array.isArray(entries)) continue;
      for (const item of entries) {
        if (!item || typeof item !== "object") continue;
        const path = typeof item.legacyPath === "string" ? item.legacyPath : item.path;
        if (!paths.includes(path)) continue;
        const sessionId = typeof item.legacySession === "string" ? item.legacySession : typeof item.resume === "string" ? item.resume : undefined;
        const agent = typeof item.legacyAgent === "string" ? item.legacyAgent : typeof item.agent === "string" ? item.agent : "claude";
        const draft = item.draft && typeof item.draft.text === "string" ? {
          text: item.draft.text,
          files: Array.isArray(item.draft.files) ? item.draft.files.filter((file: unknown): file is string => typeof file === "string") : [],
        } : undefined;
        const matching = result.filter((row) => row.path === path && row.agent === agent && (sessionId ? row.sessionId === sessionId : row.id === `draft:${path}:${item.id}`));
        const hasDraft = draft && (draft.text || draft.files.length);
        const found = matching.find((row) => !hasDraft || !row.draft || JSON.stringify(row.draft) === JSON.stringify(draft));
        if (found) {
          if (draft && (draft.text || draft.files.length)) found.draft = draft;
        } else if (sessionId || draft?.text || draft?.files.length) {
          result.push({
            id: sessionId ? `${path}:${agent}:${sessionId}${matching.length ? `:draft:${result.length}` : ""}` : `draft:${path}:${item.id}`,
            sessionId, path, agent,
            title: typeof item.model === "string" ? item.model : sessionId ? "Saved conversation" : "Unsent draft",
            part: typeof item.part === "string" ? item.part : undefined,
            draft,
          });
        }
      }
    }
  }
  return result;
}
