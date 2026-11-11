export type ArchiveMessage = { role: string; content: string };

/** Bound only the new draft; the full original remains readable and exportable. */
export function legacyContext(messages: ArchiveMessage[], draft = "", limit = 60_000): string {
  const turns = messages.filter((row) => row.role === "user" || row.role === "assistant");
  const selected: string[] = [];
  let remaining = Math.max(0, limit);
  let omitted = false;
  for (let index = turns.length - 1; index >= 0; index--) {
    const text = `${turns[index].role}: ${turns[index].content}`;
    const separator = selected.length ? 2 : 0;
    if (text.length + separator > remaining) {
      if (!selected.length && remaining > 0) selected.unshift(text.slice(0, remaining));
      omitted = true;
      break;
    }
    selected.unshift(text);
    remaining -= text.length + separator;
  }
  return [
    "Continue work on this part using the current CAD tools. This is the conversation from before the upgrade:",
    omitted ? "Recent excerpt only; older messages or part of an oversized message were omitted. The complete original remains in History and can be exported." : "",
    selected.join("\n\n"),
    draft ? `Unsent draft preserved from the original conversation:\n${draft}` : "",
  ].filter(Boolean).join("\n\n");
}
