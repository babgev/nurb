export type ToolItem = {
  kind: "tool"; id: string; title: string; toolKind?: string; status: string;
  input?: string; output?: string; startedAt?: number; finishedAt?: number;
};
export type ToolUpdate = {
  id: string; title?: string; kind?: string; status?: string; input?: string; output?: string;
};

export function mergeTool(previous: ToolItem | undefined, update: ToolUpdate, now: number, replaying = false): ToolItem {
  const status = update.status ?? previous?.status ?? "pending";
  const finished = ["completed", "failed", "interrupted"].includes(status);
  return {
    kind: "tool", id: update.id, title: update.title ?? previous?.title ?? "Tool activity",
    toolKind: update.kind ?? previous?.toolKind, status,
    input: update.input ?? previous?.input, output: update.output ?? previous?.output,
    startedAt: previous?.startedAt ?? (replaying ? undefined : now),
    finishedAt: finished ? previous?.finishedAt ?? (replaying ? undefined : now) : undefined,
  };
}

export function elapsedLabel(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export function activityStatus(options: {
  label: string; starting: boolean; restoring: boolean; cancelling: boolean;
  permission: boolean; phase: string; lastEventAt: number; now: number;
  tools: ToolItem[];
}): { title: string; quiet: boolean; detail: string } {
  const { label, starting, restoring, cancelling, permission, phase, lastEventAt, now, tools } = options;
  const active = tools.filter((tool) => ["pending", "in_progress"].includes(tool.status));
  const quietFor = Math.max(0, now - lastEventAt);
  const quiet = quietFor >= 20_000;
  let title = phase || `Waiting for ${label}'s response`;
  if (starting && !phase) title = restoring ? "Restoring conversation" : `Starting ${label}`;
  if (!starting && active.length) title = active.length > 1 ? `${active.length} tools in progress: ${active[active.length - 1].title}` : active[0].title;
  if (permission) title = "Waiting for your permission";
  if (cancelling) title = starting ? "Stopping connection" : "Stop requested";
  return {
    title,
    quiet: quiet && !permission,
    detail: permission ? "Choose an option below to continue."
      : quiet ? `No new activity reported for ${elapsedLabel(quietFor)}. ${cancelling ? "You can disconnect this conversation." : `${label} may still be processing; you can stop this turn.`}`
        : `Last update ${elapsedLabel(quietFor)} ago`,
  };
}
