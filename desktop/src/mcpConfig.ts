export type McpConfig = {
  id: string;
  name: string;
  enabled: boolean;
  transport: "stdio" | "http";
  preset?: "browser";
  command?: string;
  args: string[];
  env: Record<string, string>;
  url?: string;
  headers: Record<string, string>;
};

export type McpStatus = {
  state: "unchecked" | "checking" | "ready" | "error" | "disabled";
  toolCount?: number;
  error?: string;
  checkedAt?: number;
};

export type McpServer = Pick<McpConfig, "id" | "name" | "enabled" | "transport" | "preset"> & {
  envKeys: string[];
  headerKeys: string[];
  status: McpStatus;
};

export function parseMcpArgs(value: string): string[] {
  let parsed: unknown;
  try { parsed = JSON.parse(value || "[]"); } catch { throw new Error("Arguments must be a JSON array of strings, for example [\"--port\", \"3000\"]."); }
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) throw new Error("Arguments must be a JSON array of strings.");
  return parsed;
}

export function parseMcpValues(value: string, label: string): Record<string, string> {
  let parsed: unknown;
  try { parsed = JSON.parse(value || "{}"); } catch { throw new Error(`${label} must be a JSON object with string values.`); }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed) || Object.values(parsed).some((item) => typeof item !== "string")) throw new Error(`${label} must be a JSON object with string values.`);
  if (Object.keys(parsed).some((key) => !key.trim())) throw new Error(`${label} names cannot be empty.`);
  return parsed as Record<string, string>;
}

export function mcpStatusLabel(status: McpStatus): string {
  switch (status.state) {
    case "ready": return typeof status.toolCount === "number" ? `${status.toolCount} ${status.toolCount === 1 ? "tool" : "tools"}` : "Available";
    case "checking": return "Checking…";
    case "error": return "Error";
    case "disabled": return "Disabled";
    default: return "Not checked";
  }
}
