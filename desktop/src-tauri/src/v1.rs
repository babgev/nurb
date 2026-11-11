//! Import receipts and read-only access to the fork's pre-1.0 conversations.
//! The original registry and provider transcripts are never moved or rewritten.

use std::collections::HashSet;
use std::fs;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use tauri::State;

static MIGRATION_WRITE: Mutex<()> = Mutex::new(());
const RECEIPTS: &str = "legacy-project-mappings.json";
const MAX_TRANSCRIPT: u64 = 64 * 1024 * 1024;

#[derive(Deserialize)]
struct OldProject {
    path: PathBuf,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectMapping {
    pub path: String,
    pub project_id: String,
}

fn registered_paths(dir: &Path) -> Result<Vec<String>, String> {
    let primary = dir.join("projects.json");
    let file = if primary.exists() {
        primary
    } else {
        dir.join("projects.v1-imported.json")
    };
    if !file.exists() {
        return Ok(Vec::new());
    }
    let raw = fs::read_to_string(&file)
        .map_err(|e| format!("Could not read the old project list: {e}"))?;
    let projects: Vec<OldProject> = serde_json::from_str(&raw).map_err(|e| {
        format!("The old project list could not be read; it has been kept unchanged: {e}")
    })?;
    let mut seen = HashSet::new();
    Ok(projects
        .into_iter()
        .map(|p| p.path.to_string_lossy().into_owned())
        .filter(|p| seen.insert(p.clone()))
        .collect())
}

pub fn mappings(dir: &Path) -> Result<Vec<ProjectMapping>, String> {
    let file = dir.join(RECEIPTS);
    if !file.exists() {
        return Ok(Vec::new());
    }
    serde_json::from_slice(&fs::read(file).map_err(|e| e.to_string())?)
        .map_err(|e| format!("Could not read completed project imports: {e}"))
}

/// Failed or interrupted imports remain pending. The engine's transactional
/// source-path receipt makes retrying an import safe even before this receipt lands.
pub fn take_folders(dir: &Path) -> Result<Vec<String>, String> {
    let complete: HashSet<String> = mappings(dir)?.into_iter().map(|m| m.path).collect();
    Ok(registered_paths(dir)?
        .into_iter()
        .filter(|p| !complete.contains(p))
        .collect())
}

pub(crate) fn private_json(file: &Path, value: &impl Serialize) -> Result<(), String> {
    use std::io::Write;
    fs::create_dir_all(file.parent().ok_or("No data directory")?).map_err(|e| e.to_string())?;
    let temp = file.with_extension("json.tmp");
    let mut options = fs::OpenOptions::new();
    options.write(true).create(true).truncate(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut out = options.open(&temp).map_err(|e| e.to_string())?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        out.set_permissions(fs::Permissions::from_mode(0o600))
            .map_err(|e| e.to_string())?;
    }
    out.write_all(&serde_json::to_vec(value).map_err(|e| e.to_string())?)
        .and_then(|_| out.sync_all())
        .map_err(|e| e.to_string())?;
    fs::rename(temp, file).map_err(|e| e.to_string())
}

pub fn finish_import(dir: &Path, path: String, project_id: String) -> Result<(), String> {
    let _guard = MIGRATION_WRITE.lock().map_err(|e| e.to_string())?;
    if !registered_paths(dir)?.contains(&path) {
        return Err("That folder is not in the old project list".into());
    }
    if project_id.is_empty()
        || !project_id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    {
        return Err("Invalid imported project id".into());
    }
    let mut entries = mappings(dir)?;
    if let Some(existing) = entries.iter().find(|m| m.path == path) {
        return if existing.project_id == project_id {
            Ok(())
        } else {
            Err("This folder was already imported into another project".into())
        };
    }
    entries.push(ProjectMapping { path, project_id });
    private_json(&dir.join(RECEIPTS), &entries)
}

#[tauri::command]
pub fn take_v1_folders(data: State<crate::AppData>) -> Result<Vec<String>, String> {
    take_folders(&data.0)
}

#[tauri::command]
pub fn finish_v1_import(
    data: State<crate::AppData>,
    path: String,
    project_id: String,
) -> Result<(), String> {
    finish_import(&data.0, path, project_id)
}
#[tauri::command]
pub fn v1_project_mappings(data: State<crate::AppData>) -> Result<Vec<ProjectMapping>, String> {
    mappings(&data.0)
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyChat {
    pub id: String,
    pub agent: String,
    pub title: Option<String>,
    pub updated_at: Option<String>,
    pub part: Option<String>,
    #[serde(skip)]
    file: PathBuf,
}
#[derive(Serialize)]
pub struct LegacyMessage {
    role: String,
    content: String,
}
#[derive(Serialize)]
pub struct LegacyTranscript {
    messages: Vec<LegacyMessage>,
    raw: String,
    note: String,
}

fn project_allowed(data: &Path, path: &str) -> Result<(), String> {
    if registered_paths(data)?.iter().any(|p| p == path)
        || mappings(data)?.iter().any(|m| m.path == path)
    {
        Ok(())
    } else {
        Err("This is not a saved pre-upgrade project".into())
    }
}
fn files_below(dir: &Path, depth: usize, suffix: &str, out: &mut Vec<PathBuf>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let Ok(kind) = entry.file_type() else {
            continue;
        };
        if kind.is_symlink() {
            continue;
        }
        let path = entry.path();
        if kind.is_file() && path.extension().and_then(|s| s.to_str()) == Some(suffix) {
            out.push(path);
        } else if kind.is_dir() && depth > 0 {
            files_below(&path, depth - 1, suffix, out);
        }
    }
}
fn json_lines(file: &Path) -> Vec<Value> {
    let Ok(handle) = fs::File::open(file) else {
        return Vec::new();
    };
    // Listing needs only metadata. Reading the selected archive returns every byte.
    use std::io::Read;
    BufReader::new(handle.take(MAX_TRANSCRIPT))
        .lines()
        .map_while(Result::ok)
        .filter_map(|line| serde_json::from_str(&line).ok())
        .collect()
}
fn json_header(file: &Path) -> Vec<Value> {
    use std::io::Read;
    let Ok(handle) = fs::File::open(file) else {
        return Vec::new();
    };
    BufReader::new(handle.take(64 * 1024))
        .lines()
        .take(8)
        .map_while(Result::ok)
        .filter_map(|line| serde_json::from_str(&line).ok())
        .collect()
}

fn same_path(a: &str, b: &str) -> bool {
    a == b
        || fs::canonicalize(a)
            .ok()
            .zip(fs::canonicalize(b).ok())
            .is_some_and(|(a, b)| a == b)
}
fn text_content(value: &Value) -> String {
    match value {
        Value::String(text) => text.clone(),
        Value::Array(items) => items
            .iter()
            .map(text_content)
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>()
            .join("\n\n"),
        Value::Object(map) => {
            let kind = map.get("type").and_then(Value::as_str).unwrap_or("");
            match kind {
                // Provider-only reasoning/signatures are not conversation prose.
                // They remain byte-for-byte in the original transcript download.
                "thinking" | "redacted_thinking" | "reasoning" => return String::new(),
                "image" | "input_image" | "output_image" => return "[Image attachment]".into(),
                "document" | "input_file" => {
                    return map
                        .get("title")
                        .or_else(|| map.get("filename"))
                        .and_then(Value::as_str)
                        .map(|name| format!("[Attachment: {name}]"))
                        .unwrap_or_else(|| "[Document attachment]".into())
                }
                "tool_use" | "function_call" => {
                    let name = map.get("name").and_then(Value::as_str).unwrap_or("Tool");
                    let arguments = map
                        .get("input")
                        .or_else(|| map.get("arguments"))
                        .map(|input| match input {
                            Value::String(text) => text.clone(),
                            _ => serde_json::to_string_pretty(input).unwrap_or_default(),
                        })
                        .unwrap_or_default();
                    return if arguments.is_empty() {
                        format!("Tool: {name}")
                    } else {
                        format!("Tool: {name}\n{arguments}")
                    };
                }
                "tool_result" | "function_call_output" => {
                    let content = map
                        .get("content")
                        .or_else(|| map.get("output"))
                        .map(text_content)
                        .unwrap_or_default();
                    let label = if map
                        .get("is_error")
                        .and_then(Value::as_bool)
                        .unwrap_or(false)
                    {
                        "Tool error"
                    } else {
                        "Tool result"
                    };
                    return format!("{label}\n{content}");
                }
                _ => {}
            }
            if let Some(text) = map.get("text").and_then(Value::as_str) {
                return text.to_string();
            }
            if let Some(content) = map.get("content") {
                return text_content(content);
            }
            if let Some(output) = map.get("output") {
                return text_content(output);
            }
            // Unknown protocol blocks must not dump signatures or binary payloads
            // into the chat. The complete raw archive remains available separately.
            if map.contains_key("signature") || kind.is_empty() {
                String::new()
            } else {
                format!("[Saved {kind} content; available in the original transcript]")
            }
        }
        _ => String::new(),
    }
}
fn messages(records: &[Value], agent: &str) -> Vec<LegacyMessage> {
    let mut out = Vec::new();
    for record in records {
        // Claude marks injected adapter/CLI context with isMeta. It was never a
        // person's chat message and need not drown out the restored conversation.
        if record.get("isMeta").and_then(Value::as_bool) == Some(true) {
            continue;
        }
        let payload = if agent == "codex" {
            record.get("payload").unwrap_or(record)
        } else {
            record
        };
        let message = payload
            .get("message")
            .filter(|m| m.is_object())
            .unwrap_or(payload);
        let role = message
            .get("role")
            .or_else(|| message.get("type"))
            .and_then(Value::as_str)
            .unwrap_or("");
        let role = match role {
            "user" | "user_message" => "user",
            "assistant" | "gemini" | "agent_message" => "assistant",
            "function_call" | "function_call_output" | "tool_result" => "tool",
            _ => continue,
        };
        let content = message
            .get("content")
            .or_else(|| message.get("message"))
            .or_else(|| message.get("output"))
            .unwrap_or(message);
        let blocks: Vec<&Value> = match content {
            Value::Array(items) => items.iter().collect(),
            _ => vec![content],
        };
        for block in blocks {
            let block_kind = block.get("type").and_then(Value::as_str).unwrap_or("");
            let block_role = if matches!(
                block_kind,
                "tool_use" | "tool_result" | "function_call" | "function_call_output"
            ) {
                "tool"
            } else {
                role
            };
            let text = text_content(block);
            if !text.trim().is_empty() {
                out.push(LegacyMessage {
                    role: block_role.into(),
                    content: text,
                });
            }
        }
    }
    out
}
fn provider_root(home: &Path, variable: &str, default: &str) -> PathBuf {
    // Copied-data tests use a fake home and must never consult real provider stores.
    if std::env::var_os("HOME").is_some_and(|actual| Path::new(&actual) == home) {
        if let Some(root) = std::env::var_os(variable) {
            return PathBuf::from(root);
        }
    }
    home.join(default)
}

fn legacy_chats(data: &Path, home: &Path, project: &str) -> Result<Vec<LegacyChat>, String> {
    project_allowed(data, project)?;
    let mut found = Vec::new();
    let meta: Value = fs::read(data.join("sessions.json"))
        .ok()
        .and_then(|v| serde_json::from_slice(&v).ok())
        .unwrap_or(Value::Null);
    let encoded: String = project
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() { c } else { '-' })
        .collect();
    let claude_root = provider_root(home, "CLAUDE_CONFIG_DIR", ".claude");
    let mut claude = Vec::new();
    if let Ok(dirs) = fs::read_dir(claude_root.join("projects")) {
        for dir in dirs.flatten() {
            let name = dir.file_name().to_string_lossy().into_owned();
            if name == encoded || (encoded.len() > 200 && name.starts_with(&encoded[..200])) {
                files_below(&dir.path(), 0, "jsonl", &mut claude);
            }
        }
    }
    for file in claude {
        let records = json_lines(&file);
        let cwd = records
            .iter()
            .find_map(|r| r.get("cwd").and_then(Value::as_str));
        if cwd.is_some_and(|cwd| !same_path(cwd, project)) {
            continue;
        }
        if let Some(id) = file.file_stem().and_then(|s| s.to_str()) {
            if id.starts_with("agent-") {
                continue;
            }
            add_chat(&mut found, &meta, id.to_string(), "claude", file, &records);
        }
    }
    let codex_root = provider_root(home, "CODEX_HOME", ".codex");
    let mut codex = Vec::new();
    files_below(&codex_root.join("sessions"), 4, "jsonl", &mut codex);
    files_below(
        &codex_root.join("archived_sessions"),
        1,
        "jsonl",
        &mut codex,
    );
    for file in codex {
        let header = json_header(&file);
        let details = header
            .iter()
            .map(|r| r.get("payload").unwrap_or(r))
            .find(|r| {
                r.get("cwd")
                    .and_then(Value::as_str)
                    .is_some_and(|cwd| same_path(cwd, project))
            });
        if let Some(id) = details.and_then(|r| r.get("id")).and_then(Value::as_str) {
            let records = json_lines(&file);
            add_chat(&mut found, &meta, id.to_string(), "codex", file, &records);
        }
    }
    let hash = format!("{:x}", Sha256::digest(project.as_bytes()));
    let mut gemini = Vec::new();
    files_below(
        &home.join(".gemini/tmp").join(&hash).join("chats"),
        0,
        "json",
        &mut gemini,
    );
    for file in gemini {
        let Ok(raw) = fs::read(&file) else {
            continue;
        };
        let Ok(value) = serde_json::from_slice::<Value>(&raw) else {
            continue;
        };
        if let Some(id) = value.get("sessionId").and_then(Value::as_str) {
            let records = value
                .get("messages")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            add_chat(&mut found, &meta, id.to_string(), "gemini", file, &records);
        }
    }
    // A provider may have removed a transcript, or a never-prompted session may
    // never have written one. Keep the app's saved pointer visible in either case.
    let pointers: Value = fs::read(data.join("part-chats.json"))
        .ok()
        .and_then(|raw| serde_json::from_slice(&raw).ok())
        .unwrap_or(Value::Null);
    for pointer in pointers.as_array().into_iter().flatten() {
        if pointer.get("project").and_then(Value::as_str) != Some(project) {
            continue;
        }
        let Some(id) = pointer.get("sessionId").and_then(Value::as_str) else {
            continue;
        };
        let Some(agent) = meta
            .get(id)
            .and_then(|entry| entry.get("agent"))
            .and_then(Value::as_str)
        else {
            continue;
        };
        if found
            .iter()
            .any(|chat| chat.id == id && chat.agent == agent)
        {
            continue;
        }
        found.push(LegacyChat {
            id: id.into(),
            agent: agent.into(),
            title: Some("Saved conversation (transcript unavailable)".into()),
            updated_at: None,
            part: pointer
                .get("part")
                .and_then(Value::as_str)
                .map(str::to_string),
            file: PathBuf::new(),
        });
    }
    found.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    let mut seen = HashSet::new();
    found.retain(|chat| seen.insert((chat.agent.clone(), chat.id.clone())));
    Ok(found)
}
fn add_chat(
    found: &mut Vec<LegacyChat>,
    meta: &Value,
    id: String,
    agent: &str,
    file: PathBuf,
    records: &[Value],
) {
    let title = messages(records, agent)
        .into_iter()
        .find(|m| m.role == "user")
        .map(|m| m.content.chars().take(100).collect());
    let updated_at = records
        .iter()
        .rev()
        .find_map(|r| r.get("timestamp").and_then(Value::as_str))
        .map(str::to_string);
    let part = meta
        .get(&id)
        .and_then(|m| m.get("part"))
        .and_then(Value::as_str)
        .map(str::to_string);
    found.push(LegacyChat {
        id,
        agent: agent.into(),
        title,
        updated_at,
        part,
        file,
    });
}

fn legacy_home() -> Result<PathBuf, String> {
    #[cfg(debug_assertions)]
    if let Some(home) = std::env::var_os("NURB_LEGACY_HOME") {
        return Ok(PathBuf::from(home));
    }
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .ok_or_else(|| "Could not locate the home folder".into())
}

#[tauri::command]
pub async fn list_legacy_chats(
    data: State<'_, crate::AppData>,
    path: String,
) -> Result<Vec<LegacyChat>, String> {
    let root = data.0.clone();
    let home = legacy_home()?;
    tauri::async_runtime::spawn_blocking(move || legacy_chats(&root, &home, &path))
        .await
        .map_err(|e| e.to_string())?
}
#[tauri::command]
pub async fn read_legacy_chat(
    data: State<'_, crate::AppData>,
    path: String,
    session_id: String,
    agent: String,
) -> Result<LegacyTranscript, String> {
    let root = data.0.clone();
    let home = legacy_home()?;
    tauri::async_runtime::spawn_blocking(move || {
        let chat = legacy_chats(&root, &home, &path)?.into_iter().find(|c| c.id == session_id && c.agent == agent).ok_or("The original transcript was not found. Its saved tab and session id are retained; no new conversation has replaced it.")?;
        if !chat.file.is_file() { return Err("The provider's transcript is not available locally. The original session id and saved tab remain preserved; no new conversation has replaced them.".into()); }
        if fs::metadata(&chat.file).map_err(|e| e.to_string())?.len() > MAX_TRANSCRIPT { return Err("This transcript is too large to display. The original file is still retained in the provider's session store.".into()); }
        let raw = fs::read_to_string(&chat.file).map_err(|e| e.to_string())?;
        let records = if agent == "gemini" { serde_json::from_str::<Value>(&raw).ok().and_then(|v| v.get("messages").and_then(Value::as_array).cloned()).unwrap_or_default() } else { raw.lines().filter_map(|l| serde_json::from_str(l).ok()).collect() };
        Ok(LegacyTranscript { messages: messages(&records, &agent), raw, note: "Archived from Nurb Fork 0.x. The original conversation is preserved read-only. Continue in a new tab to work with the upgraded project tools.".into() })
    }).await.map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;
    fn fixture(name: &str) -> PathBuf {
        let root =
            std::env::temp_dir().join(format!("nurb-migration-{name}-{}", std::process::id()));
        fs::create_dir_all(&root).unwrap();
        root
    }
    #[test]
    fn receipts_are_retryable_and_original_registry_is_unchanged() {
        let root = fixture("retry");
        let raw = r#"[{"path":"/old/alpha"},{"path":"/old/beta"}]"#;
        fs::write(root.join("projects.json"), raw).unwrap();
        assert_eq!(take_folders(&root).unwrap().len(), 2);
        assert_eq!(take_folders(&root).unwrap().len(), 2);
        finish_import(&root, "/old/alpha".into(), "p1".into()).unwrap();
        finish_import(&root, "/old/alpha".into(), "p1".into()).unwrap();
        assert_eq!(take_folders(&root).unwrap(), ["/old/beta"]);
        assert_eq!(fs::read_to_string(root.join("projects.json")).unwrap(), raw);
        assert!(finish_import(&root, "/unknown".into(), "p2".into()).is_err());
        fs::remove_dir_all(root).unwrap();
    }
    #[test]
    fn malformed_registry_is_reported_without_moving_it() {
        let root = fixture("broken");
        fs::write(root.join("projects.json"), "broken").unwrap();
        assert!(take_folders(&root).is_err());
        assert!(root.join("projects.json").exists());
        fs::remove_dir_all(root).unwrap();
    }
    #[test]
    fn claude_archive_keeps_tool_details_and_original_bytes() {
        let root = fixture("archive");
        let home = root.join("home");
        fs::write(root.join("projects.json"), r#"[{"path":"/old/project"}]"#).unwrap();
        let dir = home.join(".claude/projects/-old-project");
        fs::create_dir_all(&dir).unwrap();
        let raw = "{\"type\":\"user\",\"cwd\":\"/old/project\",\"message\":{\"role\":\"user\",\"content\":\"Make a box\"}}\n{\"type\":\"assistant\",\"message\":{\"role\":\"assistant\",\"content\":[{\"type\":\"text\",\"text\":\"Built it\"},{\"type\":\"tool_use\",\"name\":\"Read\",\"input\":{\"file\":\"box.py\"}}]}}\n";
        fs::write(dir.join("session-one.jsonl"), raw).unwrap();
        let chats = legacy_chats(&root, &home, "/old/project").unwrap();
        assert_eq!(chats.len(), 1);
        assert_eq!(chats[0].title.as_deref(), Some("Make a box"));
        let parsed = messages(&json_lines(&chats[0].file), "claude");
        assert_eq!(parsed.len(), 3);
        assert_eq!(parsed[2].role, "tool");
        assert!(parsed[2].content.contains("box.py"));
        assert_eq!(fs::read_to_string(&chats[0].file).unwrap(), raw);
        assert!(legacy_chats(&root, &home, "/unregistered").is_err());
        fs::remove_dir_all(root).unwrap();
    }
    #[test]
    fn archive_display_omits_opaque_reasoning_and_injected_context() {
        let rows = vec![
            serde_json::json!({"isMeta":true,"message":{"role":"user","content":"Injected adapter context"}}),
            serde_json::json!({"message":{"role":"assistant","content":[
                {"type":"thinking","thinking":"","signature":"opaque-signature"},
                {"type":"redacted_thinking","data":"opaque-data"},
                {"type":"text","text":"The part is ready."},
                {"type":"tool_use","name":"Read","id":"protocol-id","input":{"path":"parts/box.py"}}
            ]}}),
            serde_json::json!({"message":{"role":"user","content":[
                {"type":"tool_result","tool_use_id":"protocol-id","content":"File contents"},
                {"type":"image","source":{"data":"base64-image-payload"}}
            ]}}),
        ];
        let parsed = messages(&rows, "claude");
        assert_eq!(parsed.len(), 4);
        assert_eq!(parsed[0].content, "The part is ready.");
        assert_eq!(parsed[1].role, "tool");
        assert!(parsed[1].content.starts_with("Tool: Read"));
        assert_eq!(parsed[2].content, "Tool result\nFile contents");
        assert_eq!(parsed[3].content, "[Image attachment]");
        let shown = parsed
            .iter()
            .map(|m| m.content.as_str())
            .collect::<Vec<_>>()
            .join(" ");
        for hidden in [
            "opaque-signature",
            "opaque-data",
            "protocol-id",
            "base64-image-payload",
            "Injected adapter context",
        ] {
            assert!(!shown.contains(hidden));
        }
        assert_eq!(
            rows[1]["message"]["content"][0]["signature"],
            "opaque-signature"
        );
    }

    #[test]
    #[ignore = "requires an explicitly copied private migration fixture"]
    fn copied_legacy_archives_remain_readable() {
        let root = PathBuf::from(
            std::env::var_os("NURB_LEGACY_FIXTURE_ROOT").expect("copied fixture path"),
        );
        let data = root.join("app-data");
        let home = root.join("home");
        let paths = registered_paths(&data).unwrap();
        let mut readable = 0;
        let mut unavailable = 0;
        let mut messages_count = 0;
        for path in &paths {
            for chat in legacy_chats(&data, &home, path).unwrap() {
                if chat.file.is_file() {
                    let rows = json_lines(&chat.file);
                    messages_count += messages(&rows, &chat.agent).len();
                    readable += 1;
                } else {
                    unavailable += 1;
                }
            }
        }
        assert_eq!(paths.len(), 7);
        assert_eq!(readable, 6);
        assert!(messages_count > 0);
        println!("Copied archive check: {readable} readable, {unavailable} unavailable pointers, {messages_count} messages");
    }
}
