//! App-owned MCP configuration and bounded availability checks. Checks never call tools.
use std::collections::{BTreeMap, HashMap, HashSet};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::Mutex;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use agent_client_protocol::schema::v1::{
    EnvVariable, HttpHeader, McpCapabilities, McpServer, McpServerHttp, McpServerStdio,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{Emitter, Manager, State};
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader};

const MAX_MESSAGE: usize = 2 * 1024 * 1024;
const CHECK_TIMEOUT: Duration = Duration::from_secs(30);
const PROTOCOL: &str = "2025-06-18";

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ServerConfig {
    pub id: String,
    pub name: String,
    pub enabled: bool,
    pub transport: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub preset: Option<String>,
    #[serde(default)]
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: BTreeMap<String, String>,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub headers: BTreeMap<String, String>,
}

#[derive(Clone, Default, Serialize, Deserialize)]
struct Saved {
    revision: u64,
    servers: Vec<ServerConfig>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckStatus {
    pub state: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_count: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub checked_at: Option<u64>,
}
impl CheckStatus {
    fn state(state: &str) -> Self {
        Self {
            state: state.into(),
            tool_count: None,
            error: None,
            checked_at: None,
        }
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerView {
    id: String,
    name: String,
    enabled: bool,
    transport: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    preset: Option<String>,
    env_keys: Vec<String>,
    header_keys: Vec<String>,
    status: CheckStatus,
}

#[derive(Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionStatus {
    revision: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    session_revision: Option<u64>,
    attached_ids: Vec<String>,
    unsupported_ids: Vec<String>,
}

struct Inner {
    saved: Saved,
    checks: HashMap<String, CheckStatus>,
    sessions: HashMap<String, SessionStatus>,
    load_error: bool,
    next_check: u64,
    check_tokens: HashMap<String, u64>,
}
pub struct McpStore {
    path: PathBuf,
    inner: Mutex<Inner>,
}

impl McpStore {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join("mcp.json");
        let loaded = std::fs::read(&path);
        let (saved, load_error) = match loaded {
            Ok(bytes) => match serde_json::from_slice::<Saved>(&bytes) {
                Ok(saved) if saved.servers.iter().all(|s| validate(s).is_ok()) => (saved, false),
                _ => (Saved::default(), true),
            },
            Err(error) => (
                Saved::default(),
                error.kind() != std::io::ErrorKind::NotFound,
            ),
        };
        Self {
            path,
            inner: Mutex::new(Inner {
                saved,
                checks: HashMap::new(),
                sessions: HashMap::new(),
                load_error,
                next_check: 0,
                check_tokens: HashMap::new(),
            }),
        }
    }
    fn view(inner: &Inner, server: &ServerConfig) -> ServerView {
        ServerView {
            id: server.id.clone(),
            name: server.name.clone(),
            enabled: server.enabled,
            transport: server.transport.clone(),
            preset: server.preset.clone(),
            env_keys: server.env.keys().cloned().collect(),
            header_keys: server.headers.keys().cloned().collect(),
            status: if !server.enabled {
                CheckStatus::state("disabled")
            } else {
                inner
                    .checks
                    .get(&server.id)
                    .cloned()
                    .unwrap_or_else(|| CheckStatus::state("unchecked"))
            },
        }
    }
    fn list(&self) -> Result<Vec<ServerView>, String> {
        let inner = self.inner.lock().unwrap();
        if inner.load_error {
            return Err("MCP configuration could not be read. Restore mcp.json in the app data folder before making changes.".into());
        }
        Ok(inner
            .saved
            .servers
            .iter()
            .map(|s| Self::view(&inner, s))
            .collect())
    }
    fn get(&self, id: &str) -> Result<ServerConfig, String> {
        self.inner
            .lock()
            .unwrap()
            .saved
            .servers
            .iter()
            .find(|s| s.id == id)
            .cloned()
            .ok_or_else(|| "MCP server no longer exists.".into())
    }
    fn persist(&self, saved: &Saved) -> Result<(), String> {
        let temp = self.path.with_extension("json.tmp");
        let mut options = std::fs::OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        // A failed previous write is recoverable; never follow a stale temp symlink.
        if temp.exists() {
            std::fs::remove_file(&temp)
                .map_err(|_| "Cannot replace temporary MCP settings.".to_string())?;
        }
        let mut file = options
            .open(&temp)
            .map_err(|_| "Cannot save MCP settings.".to_string())?;
        let result = (|| {
            let bytes = serde_json::to_vec_pretty(saved)
                .map_err(|_| "Cannot encode MCP settings.".to_string())?;
            file.write_all(&bytes)
                .and_then(|_| file.sync_all())
                .map_err(|_| "Cannot write MCP settings.".to_string())?;
            std::fs::rename(&temp, &self.path)
                .map_err(|_| "Cannot replace MCP settings.".to_string())
        })();
        if result.is_err() {
            let _ = std::fs::remove_file(temp);
        }
        result
    }
    pub fn save(&self, server: ServerConfig) -> Result<ServerView, String> {
        validate(&server)?;
        let mut inner = self.inner.lock().unwrap();
        if inner.load_error {
            return Err("Restore the unreadable MCP configuration before saving.".into());
        }
        if inner
            .saved
            .servers
            .iter()
            .any(|s| s.id != server.id && s.name.eq_ignore_ascii_case(&server.name))
        {
            return Err("Choose a unique MCP server name.".into());
        }
        let mut saved = inner.saved.clone();
        if let Some(old) = saved.servers.iter_mut().find(|s| s.id == server.id) {
            *old = server.clone();
        } else {
            if saved.servers.len() >= 64 {
                return Err("At most 64 MCP servers can be configured.".into());
            }
            saved.servers.push(server.clone());
        }
        saved.revision = saved.revision.saturating_add(1);
        self.persist(&saved)?;
        inner.saved = saved;
        inner.checks.remove(&server.id);
        inner.check_tokens.remove(&server.id);
        Ok(Self::view(&inner, &server))
    }
    fn remove(&self, id: &str) -> Result<(), String> {
        let mut inner = self.inner.lock().unwrap();
        if inner.load_error {
            return Err("Restore the unreadable MCP configuration before saving.".into());
        }
        let mut saved = inner.saved.clone();
        saved.servers.retain(|s| s.id != id);
        saved.revision = saved.revision.saturating_add(1);
        self.persist(&saved)?;
        inner.saved = saved;
        inner.checks.remove(id);
        inner.check_tokens.remove(id);
        Ok(())
    }
    pub fn snapshot(&self) -> Result<(u64, Vec<ServerConfig>), String> {
        let inner = self.inner.lock().unwrap();
        if inner.load_error {
            return Err(
                "MCP configuration could not be read. Open MCP settings to repair it.".into(),
            );
        }
        Ok((
            inner.saved.revision,
            inner
                .saved
                .servers
                .iter()
                .filter(|s| s.enabled)
                .cloned()
                .collect(),
        ))
    }
    pub fn record_session(
        &self,
        id: &str,
        revision: u64,
        attached_ids: Vec<String>,
        unsupported_ids: Vec<String>,
    ) {
        self.inner.lock().unwrap().sessions.insert(
            id.into(),
            SessionStatus {
                revision,
                session_revision: Some(revision),
                attached_ids,
                unsupported_ids,
            },
        );
    }
    pub fn forget_session(&self, id: &str) {
        self.inner.lock().unwrap().sessions.remove(id);
    }
}

fn validate(server: &ServerConfig) -> Result<(), String> {
    if server.id.is_empty()
        || server.id.len() > 80
        || !server
            .id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    {
        return Err("Use a server ID containing letters, numbers, hyphens or underscores.".into());
    }
    if server.name.trim().is_empty()
        || server.name.len() > 100
        || server.name.chars().any(char::is_control)
    {
        return Err("Enter a server name of 1 to 100 characters.".into());
    }
    if server.args.len() > 256
        || server.env.len() > 128
        || server.headers.len() > 64
        || serde_json::to_vec(server).map_or(true, |b| b.len() > 128 * 1024)
    {
        return Err("MCP configuration is too large.".into());
    }
    if server.command.contains('\0')
        || server.args.iter().any(|v| v.contains('\0'))
        || server
            .env
            .iter()
            .any(|(k, v)| k.is_empty() || k.contains(['=', '\0']) || v.contains('\0'))
    {
        return Err(
            "Command arguments or environment variables contain invalid characters.".into(),
        );
    }
    if server
        .preset
        .as_deref()
        .is_some_and(|p| p != "browser" || server.id != "browser" || server.transport != "stdio")
    {
        return Err("Unknown managed MCP preset.".into());
    }
    match server.transport.as_str() {
        "stdio" if server.command.trim().is_empty() => {
            return Err("Enter the MCP server executable.".into())
        }
        "stdio" => {}
        "http" => {
            let url = reqwest::Url::parse(&server.url)
                .map_err(|_| "Enter a valid HTTP MCP endpoint.".to_string())?;
            if !matches!(url.scheme(), "https" | "http")
                || url.host_str().is_none()
                || !url.username().is_empty()
                || url.password().is_some()
                || url.fragment().is_some()
            {
                return Err(
                    "Use an HTTP or HTTPS endpoint without embedded credentials or a fragment."
                        .into(),
                );
            }
            for (key, value) in &server.headers {
                reqwest::header::HeaderName::from_bytes(key.as_bytes())
                    .map_err(|_| "Invalid HTTP header name.".to_string())?;
                reqwest::header::HeaderValue::from_str(value)
                    .map_err(|_| "Invalid HTTP header value.".to_string())?;
                if [
                    "host",
                    "content-length",
                    "connection",
                    "mcp-session-id",
                    "mcp-protocol-version",
                    "accept",
                    "content-type",
                ]
                .contains(&key.to_ascii_lowercase().as_str())
                {
                    return Err("That header is managed by the MCP transport.".into());
                }
            }
        }
        _ => return Err("Choose stdio or Streamable HTTP transport.".into()),
    }
    Ok(())
}

fn resolve_command(command: &str, path: &str) -> Result<PathBuf, String> {
    let command = PathBuf::from(command);
    if command.is_absolute() {
        return Ok(command);
    }
    if command.components().count() != 1 {
        return Err("Use an absolute executable path or a command on PATH.".into());
    }
    std::env::split_paths(path)
        .map(|p| p.join(&command))
        .find(|p| p.is_file())
        .ok_or_else(|| {
            "MCP executable was not found. Check its command or use an absolute path.".into()
        })
}

pub fn agent_servers(
    configs: &[ServerConfig],
    capabilities: &McpCapabilities,
    path: &str,
) -> (Vec<McpServer>, Vec<String>, Vec<String>) {
    let mut servers = Vec::new();
    let mut attached = Vec::new();
    let mut unsupported = Vec::new();
    for server in configs {
        let wire = match server.transport.as_str() {
            "stdio" => resolve_command(&server.command, path).ok().map(|command| {
                McpServer::Stdio(
                    McpServerStdio::new(&server.name, command)
                        .args(server.args.clone())
                        .env(
                            server
                                .env
                                .iter()
                                .map(|(k, v)| EnvVariable::new(k, v))
                                .collect(),
                        ),
                )
            }),
            "http" if capabilities.http => Some(McpServer::Http(
                McpServerHttp::new(&server.name, &server.url).headers(
                    server
                        .headers
                        .iter()
                        .map(|(k, v)| HttpHeader::new(k, v))
                        .collect(),
                ),
            )),
            _ => None,
        };
        if let Some(wire) = wire {
            servers.push(wire);
            attached.push(server.id.clone());
        } else {
            unsupported.push(server.id.clone());
        }
    }
    (servers, attached, unsupported)
}

#[tauri::command]
pub fn list_mcp_servers(store: State<McpStore>) -> Result<Vec<ServerView>, String> {
    store.list()
}
#[tauri::command]
pub fn get_mcp_server(store: State<McpStore>, id: String) -> Result<ServerConfig, String> {
    store.get(&id)
}
#[tauri::command]
pub fn save_mcp_server(
    app: tauri::AppHandle,
    store: State<McpStore>,
    server: ServerConfig,
) -> Result<ServerView, String> {
    let view = store.save(server)?;
    let _ = app.emit("mcp-config", ());
    Ok(view)
}
#[tauri::command]
pub fn set_mcp_enabled(
    app: tauri::AppHandle,
    store: State<McpStore>,
    id: String,
    enabled: bool,
) -> Result<ServerView, String> {
    let mut server = store.get(&id)?;
    server.enabled = enabled;
    save_mcp_server(app, store, server)
}
#[tauri::command]
pub fn remove_mcp_server(
    app: tauri::AppHandle,
    store: State<McpStore>,
    id: String,
) -> Result<(), String> {
    store.remove(&id)?;
    let _ = app.emit("mcp-config", ());
    Ok(())
}
#[tauri::command]
pub fn mcp_session_status(store: State<McpStore>, session_id: Option<String>) -> SessionStatus {
    let inner = store.inner.lock().unwrap();
    let mut result = session_id
        .and_then(|id| inner.sessions.get(&id).cloned())
        .unwrap_or_default();
    result.revision = inner.saved.revision;
    result
}

#[tauri::command]
pub fn mcp_browser_preset(
    app: tauri::AppHandle,
    store: State<McpStore>,
    launcher: State<crate::env::Launcher>,
) -> Result<ServerView, String> {
    save_mcp_server(app, store, browser_config(&launcher)?)
}

fn browser_config(launcher: &crate::env::Launcher) -> Result<ServerConfig, String> {
    let output = launcher.engine_root().join("mcp/browser-output");
    std::fs::create_dir_all(&output)
        .map_err(|_| "Cannot create the browser output folder.".to_string())?;
    let (command, mut args) = if let Some(paths) = launcher.paths() {
        if !paths.node_bin().is_file()
            || !paths
                .adapters()
                .join("node_modules/@playwright/mcp/cli.js")
                .is_file()
        {
            return Err("The Browser MCP runtime is missing. Finish app setup or install the updated fork, then try again.".into());
        }
        (
            paths.node_bin().to_string_lossy().into_owned(),
            vec![paths
                .adapters()
                .join("node_modules/@playwright/mcp/cli.js")
                .to_string_lossy()
                .into_owned()],
        )
    } else {
        let manifest: Value =
            serde_json::from_str(include_str!("../../adapter-runtime/package.json"))
                .map_err(|_| "Cannot read the browser runtime version.".to_string())?;
        let version = manifest["dependencies"]["@playwright/mcp"]
            .as_str()
            .ok_or("Browser runtime is not bundled in this build.")?;
        (
            "npx".into(),
            vec!["-y".into(), format!("@playwright/mcp@{version}")],
        )
    };
    args.extend([
        "--headless".into(),
        "--isolated".into(),
        "--browser".into(),
        "chrome".into(),
        "--output-dir".into(),
        output.to_string_lossy().into_owned(),
    ]);
    Ok(ServerConfig {
        id: "browser".into(),
        name: "Browser".into(),
        enabled: true,
        transport: "stdio".into(),
        preset: Some("browser".into()),
        command,
        args,
        env: BTreeMap::new(),
        url: String::new(),
        headers: BTreeMap::new(),
    })
}

pub async fn prepare_presets(
    configs: &mut [ServerConfig],
    launcher: &crate::env::Launcher,
) -> Result<Vec<crate::mcp_browser::BrowserSession>, String> {
    let mut browsers = Vec::new();
    for config in configs
        .iter_mut()
        .filter(|s| s.enabled && s.preset.as_deref() == Some("browser"))
    {
        let mut managed = browser_config(launcher)?;
        let browser = crate::mcp_browser::launch(&launcher.engine_root()).await?;
        let output = browser.output_dir();
        std::fs::create_dir_all(&output)
            .map_err(|_| "Cannot create browser download folder.".to_string())?;
        if let Some(index) = managed.args.iter().position(|arg| arg == "--output-dir") {
            managed.args[index + 1] = output.to_string_lossy().into_owned();
        }
        managed
            .args
            .extend(["--cdp-endpoint".into(), browser.endpoint()]);
        *config = managed;
        browsers.push(browser);
    }
    Ok(browsers)
}

#[tauri::command]
pub async fn check_mcp_server(
    app: tauri::AppHandle,
    id: String,
    path: String,
) -> Result<ServerView, String> {
    let project = PathBuf::from(path)
        .canonicalize()
        .map_err(|_| "Open a project before checking MCP servers.".to_string())?;
    if !project.is_dir() {
        return Err("Open a project folder before checking MCP servers.".into());
    }
    let store = app.state::<McpStore>();
    let server = store.get(&id)?;
    if !server.enabled {
        return Ok(McpStore::view(&store.inner.lock().unwrap(), &server));
    }
    let token = {
        let mut inner = store.inner.lock().unwrap();
        if inner.checks.get(&id).is_some_and(|s| s.state == "checking") {
            return Ok(McpStore::view(&inner, &server));
        }
        inner
            .checks
            .insert(id.clone(), CheckStatus::state("checking"));
        inner.next_check += 1;
        let token = inner.next_check;
        inner.check_tokens.insert(id.clone(), token);
        token
    };
    let _ = app.emit("mcp-status", ());
    let launcher = app.state::<crate::env::Launcher>();
    let executable_path = launcher
        .adapter_path()
        .unwrap_or_else(|| std::env::var("PATH").unwrap_or_default());
    let result = tokio::time::timeout(CHECK_TIMEOUT, async {
        let mut prepared = vec![server.clone()];
        let _browsers = prepare_presets(&mut prepared, &launcher).await?;
        let server = &prepared[0];
        match server.transport.as_str() {
            "stdio" => {
                probe_stdio(&server, &project, &launcher.engine_root(), &executable_path).await
            }
            "http" => probe_http(&server).await,
            _ => Err("Unsupported MCP transport.".into()),
        }
    })
    .await
    .unwrap_or_else(|_| {
        Err("MCP check timed out after 30 seconds. Check the server and try again.".into())
    });
    let mut inner = store.inner.lock().unwrap();
    let current = inner
        .saved
        .servers
        .iter()
        .find(|s| s.id == id)
        .cloned()
        .ok_or("MCP server was removed during the check.")?;
    if current == server && inner.check_tokens.get(&id) == Some(&token) {
        let mut status = CheckStatus::state(if result.is_ok() { "ready" } else { "error" });
        status.checked_at = Some(now_ms());
        match result {
            Ok(count) => status.tool_count = Some(count),
            Err(error) => status.error = Some(error),
        }
        inner.checks.insert(id, status);
    }
    let view = McpStore::view(&inner, &current);
    drop(inner);
    let _ = app.emit("mcp-status", ());
    Ok(view)
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}
fn initialize() -> Value {
    json!({"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":PROTOCOL,"capabilities":{},"clientInfo":{"name":"nurb-fork-check","version":"1"}}})
}
fn initialized() -> Value {
    json!({"jsonrpc":"2.0","method":"notifications/initialized"})
}
fn tool_request(id: u64, cursor: Option<&str>) -> Value {
    let mut params = json!({});
    if let Some(cursor) = cursor {
        params["cursor"] = json!(cursor);
    }
    json!({"jsonrpc":"2.0","id":id,"method":"tools/list","params":params})
}
fn response(value: Value, id: u64) -> Result<Option<Value>, String> {
    if value.get("id") != Some(&json!(id)) {
        return Ok(None);
    }
    if value.get("error").is_some() {
        return Err(
            "The MCP server rejected the request. Check its authentication and configuration."
                .into(),
        );
    }
    value
        .get("result")
        .cloned()
        .map(Some)
        .ok_or_else(|| "MCP server returned an invalid response.".into())
}
fn protocol(init: &Value) -> Result<&str, String> {
    let version = init["protocolVersion"]
        .as_str()
        .ok_or("MCP server omitted its protocol version.")?;
    if !["2024-11-05", "2025-03-26", PROTOCOL].contains(&version) {
        return Err("This server uses an unsupported MCP protocol version.".into());
    }
    Ok(version)
}
fn tool_page(value: &Value, names: &mut HashSet<String>) -> Result<Option<String>, String> {
    for tool in value["tools"]
        .as_array()
        .ok_or("MCP tools/list did not return a tool list.")?
    {
        let name = tool["name"]
            .as_str()
            .ok_or("MCP server returned a tool without a name.")?;
        names.insert(name.to_string());
    }
    if names.len() > 10000 {
        return Err("MCP server returned too many tools.".into());
    }
    Ok(value
        .get("nextCursor")
        .and_then(Value::as_str)
        .filter(|s| !s.is_empty())
        .map(str::to_owned))
}

struct ChildGroup {
    child: tokio::process::Child,
    pgid: i32,
}
impl Drop for ChildGroup {
    fn drop(&mut self) {
        #[cfg(unix)]
        unsafe {
            libc::killpg(self.pgid, libc::SIGKILL);
        }
        let _ = self.child.start_kill();
    }
}
async fn write_line(writer: &mut tokio::process::ChildStdin, value: &Value) -> Result<(), String> {
    let mut bytes =
        serde_json::to_vec(value).map_err(|_| "Cannot encode MCP request.".to_string())?;
    bytes.push(b'\n');
    writer
        .write_all(&bytes)
        .await
        .map_err(|_| "MCP server closed its input.".to_string())
}
async fn read_response(
    reader: &mut BufReader<tokio::process::ChildStdout>,
    writer: &mut tokio::process::ChildStdin,
    id: u64,
) -> Result<Value, String> {
    for _ in 0..1000 {
        let mut bytes = Vec::new();
        let count = reader
            .take((MAX_MESSAGE + 1) as u64)
            .read_until(b'\n', &mut bytes)
            .await
            .map_err(|_| "Cannot read MCP server output.".to_string())?;
        if count == 0 {
            return Err("MCP server exited before replying. Check the command, installed runtime and credentials.".into());
        }
        if bytes.len() > MAX_MESSAGE {
            return Err("MCP server response exceeded the size limit.".into());
        }
        let value: Value = serde_json::from_slice(&bytes)
            .map_err(|_| "MCP server wrote invalid JSON to stdout.".to_string())?;
        if value.get("method").is_some() {
            if let Some(request_id) = value.get("id") {
                let reply = if value["method"] == "ping" {
                    json!({"jsonrpc":"2.0","id":request_id,"result":{}})
                } else {
                    json!({"jsonrpc":"2.0","id":request_id,"error":{"code":-32601,"message":"Method not supported by availability checks"}})
                };
                write_line(writer, &reply).await?;
            }
            continue;
        }
        if let Some(result) = response(value, id)? {
            return Ok(result);
        }
    }
    Err("MCP server sent too many unrelated messages.".into())
}
async fn probe_stdio(
    server: &ServerConfig,
    project: &Path,
    root: &Path,
    path: &str,
) -> Result<usize, String> {
    let executable = resolve_command(&server.command, path)?;
    let (program, args) = crate::acp::sandbox::wrap(
        executable.to_string_lossy().into_owned(),
        server.args.clone(),
        project,
        root,
    );
    let mut command = tokio::process::Command::new(program);
    command
        .args(args)
        .current_dir(project)
        .env("PATH", path)
        .envs(&server.env)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .kill_on_drop(true);
    #[cfg(unix)]
    command.process_group(0);
    let child = command.spawn().map_err(|_| {
        "Could not launch the MCP server. Check its executable and runtime.".to_string()
    })?;
    let mut child = ChildGroup {
        pgid: child.id().unwrap_or_default() as i32,
        child,
    };
    let mut writer = child.child.stdin.take().ok_or("MCP stdin unavailable.")?;
    let mut reader = BufReader::new(child.child.stdout.take().ok_or("MCP stdout unavailable.")?);
    write_line(&mut writer, &initialize()).await?;
    let init = read_response(&mut reader, &mut writer, 1).await?;
    protocol(&init)?;
    write_line(&mut writer, &initialized()).await?;
    let mut names = HashSet::new();
    let mut cursor = None;
    let mut cursors = HashSet::new();
    if init["capabilities"].get("tools").is_some() {
        for id in 2..102 {
            write_line(&mut writer, &tool_request(id, cursor.as_deref())).await?;
            cursor = tool_page(
                &read_response(&mut reader, &mut writer, id).await?,
                &mut names,
            )?;
            match &cursor {
                None => break,
                Some(c) if !cursors.insert(c.clone()) || id == 101 => {
                    return Err("MCP tool pagination did not finish.".into())
                }
                _ => {}
            }
        }
    }
    drop(writer);
    if tokio::time::timeout(Duration::from_millis(500), child.child.wait())
        .await
        .is_err()
    {
        let _ = child.child.start_kill();
    }
    Ok(names.len())
}

struct HttpProbe {
    client: reqwest::Client,
    url: String,
    headers: reqwest::header::HeaderMap,
    session: Option<String>,
    version: String,
}
impl HttpProbe {
    fn new(server: &ServerConfig) -> Result<Self, String> {
        let _ = rustls::crypto::ring::default_provider().install_default();
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .timeout(Duration::from_secs(15))
            .build()
            .map_err(|_| "Cannot create MCP HTTP client.")?;
        let mut headers = reqwest::header::HeaderMap::new();
        for (key, value) in &server.headers {
            headers.insert(
                reqwest::header::HeaderName::from_bytes(key.as_bytes())
                    .map_err(|_| "Invalid header.")?,
                reqwest::header::HeaderValue::from_str(value).map_err(|_| "Invalid header.")?,
            );
        }
        Ok(Self {
            client,
            url: server.url.clone(),
            headers,
            session: None,
            version: PROTOCOL.into(),
        })
    }
    fn request(&self, method: reqwest::Method) -> reqwest::RequestBuilder {
        let mut request = self
            .client
            .request(method, &self.url)
            .headers(self.headers.clone())
            .header("Accept", "application/json, text/event-stream")
            .header("MCP-Protocol-Version", &self.version);
        if let Some(session) = &self.session {
            request = request.header("Mcp-Session-Id", session);
        }
        request
    }
    async fn send(&mut self, value: Value) -> Result<Option<Value>, String> {
        let id = value.get("id").and_then(Value::as_u64);
        let mut res = self
            .request(reqwest::Method::POST)
            .json(&value)
            .send()
            .await
            .map_err(|_| {
                "Could not reach the MCP endpoint. Check the URL and connection.".to_string()
            })?;
        if matches!(res.status().as_u16(), 401 | 403) {
            return Err(
                "MCP server requires authentication. Configure its authorization header.".into(),
            );
        }
        if !res.status().is_success() {
            return Err(format!(
                "MCP endpoint returned HTTP {}. Check its endpoint and configuration.",
                res.status().as_u16()
            ));
        }
        if let Some(session) = res
            .headers()
            .get("mcp-session-id")
            .and_then(|v| v.to_str().ok())
        {
            self.session = Some(session.into());
        }
        let Some(id) = id else {
            return Ok(None);
        };
        let sse = res
            .headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .is_some_and(|v| v.starts_with("text/event-stream"));
        let mut bytes = Vec::new();
        let mut processed_events = 0;
        while let Some(chunk) = res
            .chunk()
            .await
            .map_err(|_| "Could not read MCP HTTP response.")?
        {
            bytes.extend_from_slice(&chunk);
            if bytes.len() > MAX_MESSAGE {
                return Err("MCP HTTP response exceeded the size limit.".into());
            }
            if sse {
                // Parse complete events only; a server can keep its SSE response open.
                let text = String::from_utf8_lossy(&bytes).replace("\r\n", "\n");
                for event in text
                    .split("\n\n")
                    .take(text.split("\n\n").count().saturating_sub(1))
                    .skip(processed_events)
                {
                    processed_events += 1;
                    let data = event
                        .lines()
                        .filter_map(|l| l.strip_prefix("data:").map(str::trim_start))
                        .collect::<Vec<_>>()
                        .join("\n");
                    if data.is_empty() {
                        continue;
                    }
                    let message: Value = serde_json::from_str(&data)
                        .map_err(|_| "MCP SSE response contained invalid JSON.")?;
                    if message.get("method").is_some() {
                        if let Some(request_id) = message.get("id") {
                            let reply = if message["method"] == "ping" {
                                json!({"jsonrpc":"2.0","id":request_id,"result":{}})
                            } else {
                                json!({"jsonrpc":"2.0","id":request_id,"error":{"code":-32601,"message":"Method not supported by availability checks"}})
                            };
                            let reply_response = self
                                .request(reqwest::Method::POST)
                                .json(&reply)
                                .send()
                                .await
                                .map_err(|_| "Could not reply to MCP server request.")?;
                            if !reply_response.status().is_success() {
                                return Err("MCP endpoint rejected the client response.".into());
                            }
                        }
                        continue;
                    }
                    if let Some(result) = response(message, id)? {
                        return Ok(Some(result));
                    }
                }
            }
        }
        if sse {
            return Err("MCP stream ended before replying.".into());
        }
        let message = serde_json::from_slice(&bytes)
            .map_err(|_| "MCP endpoint did not return JSON or an MCP event stream.")?;
        response(message, id)?
            .map(Some)
            .ok_or_else(|| "MCP HTTP response has an unexpected request ID.".into())
    }
}
impl Drop for HttpProbe {
    fn drop(&mut self) {
        if self.session.is_some() {
            let request = self.request(reqwest::Method::DELETE);
            if let Ok(runtime) = tokio::runtime::Handle::try_current() {
                runtime.spawn(async move {
                    let _ = tokio::time::timeout(Duration::from_secs(2), request.send()).await;
                });
            }
        }
    }
}
async fn probe_http(server: &ServerConfig) -> Result<usize, String> {
    let mut http = HttpProbe::new(server)?;
    let result = async {
        let init = http
            .send(initialize())
            .await?
            .ok_or("MCP initialize response was empty.")?;
        http.version = protocol(&init)?.to_owned();
        http.send(initialized()).await?;
        let mut names = HashSet::new();
        let mut cursor = None;
        let mut cursors = HashSet::new();
        if init["capabilities"].get("tools").is_some() {
            for id in 2..102 {
                let page = http
                    .send(tool_request(id, cursor.as_deref()))
                    .await?
                    .ok_or("MCP tools response was empty.")?;
                cursor = tool_page(&page, &mut names)?;
                match &cursor {
                    None => break,
                    Some(c) if !cursors.insert(c.clone()) || id == 101 => {
                        return Err("MCP tool pagination did not finish.".into())
                    }
                    _ => {}
                }
            }
        }
        Ok(names.len())
    }
    .await;
    if http.session.is_some() {
        let request = http.request(reqwest::Method::DELETE);
        http.session = None;
        let _ = tokio::time::timeout(Duration::from_secs(2), request.send()).await;
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{BufRead, Read};

    struct Scratch(PathBuf);
    impl Scratch {
        fn new() -> Self {
            let path = std::env::temp_dir().join(format!(
                "nurb-mcp-{}-{}",
                std::process::id(),
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ));
            std::fs::create_dir_all(&path).unwrap();
            Self(path)
        }
    }
    impl Drop for Scratch {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }
    fn server() -> ServerConfig {
        ServerConfig {
            id: "test".into(),
            name: "Test".into(),
            enabled: true,
            transport: "stdio".into(),
            preset: None,
            command: "/usr/bin/python3".into(),
            args: vec![],
            env: BTreeMap::new(),
            url: String::new(),
            headers: BTreeMap::new(),
        }
    }

    #[test]
    fn config_is_private_atomic_and_preserves_secrets_without_listing_them() {
        let root = Scratch::new();
        let store = McpStore::load(&root.0);
        let mut config = server();
        config.env.insert("TOKEN".into(), "sensitive-token".into());
        let view = store.save(config.clone()).unwrap();
        assert!(!serde_json::to_string(&view)
            .unwrap()
            .contains("sensitive-token"));
        assert_eq!(McpStore::load(&root.0).get("test").unwrap(), config);
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            assert_eq!(
                std::fs::metadata(root.0.join("mcp.json"))
                    .unwrap()
                    .permissions()
                    .mode()
                    & 0o777,
                0o600
            );
        }
        let mut bad = config;
        bad.name = String::new();
        assert!(store.save(bad).is_err());
        assert_eq!(store.snapshot().unwrap().0, 1);
        assert!(!root.0.join("mcp.json.tmp").exists());
    }

    #[test]
    fn corrupt_config_is_reported_and_never_silently_overwritten() {
        let root = Scratch::new();
        std::fs::write(root.0.join("mcp.json"), "broken").unwrap();
        let store = McpStore::load(&root.0);
        assert!(store.list().is_err());
        assert!(store.save(server()).is_err());
        assert_eq!(
            std::fs::read_to_string(root.0.join("mcp.json")).unwrap(),
            "broken"
        );
    }

    #[test]
    fn session_snapshot_does_not_change_with_later_configuration() {
        let root = Scratch::new();
        let store = McpStore::load(&root.0);
        store.save(server()).unwrap();
        let (revision, configs) = store.snapshot().unwrap();
        let (wire, attached, unsupported) =
            agent_servers(&configs, &McpCapabilities::default(), "/usr/bin");
        store.record_session("conversation", revision, attached, unsupported);
        let mut disabled = server();
        disabled.enabled = false;
        store.save(disabled).unwrap();
        assert_eq!(
            store.inner.lock().unwrap().sessions["conversation"].session_revision,
            Some(1)
        );
        assert!(store.snapshot().unwrap().1.is_empty());
        assert_eq!(wire.len(), 1);
        store.forget_session("conversation");
        assert!(store.inner.lock().unwrap().sessions.is_empty());
    }

    #[test]
    fn http_servers_require_advertised_capability_and_both_open_requests_carry_servers() {
        let mut config = server();
        config.transport = "http".into();
        config.url = "http://127.0.0.1:1234/mcp".into();
        config
            .headers
            .insert("Authorization".into(), "Bearer example".into());
        let (wire, _, unsupported) =
            agent_servers(&[config.clone()], &McpCapabilities::default(), "");
        assert!(wire.is_empty());
        assert_eq!(unsupported, ["test"]);
        let (wire, attached, unsupported) =
            agent_servers(&[config], &McpCapabilities::new().http(true), "");
        assert_eq!(attached, ["test"]);
        assert!(unsupported.is_empty());
        use agent_client_protocol::schema::v1::{LoadSessionRequest, NewSessionRequest};
        let new = NewSessionRequest::new("/project").mcp_servers(wire.clone());
        let resumed = LoadSessionRequest::new("old", "/project").mcp_servers(wire);
        assert_eq!(
            serde_json::to_value(new).unwrap()["mcpServers"],
            serde_json::to_value(resumed).unwrap()["mcpServers"]
        );
    }

    #[test]
    fn rejects_credential_urls_and_transport_owned_headers() {
        let mut config = server();
        config.transport = "http".into();
        config.url = "https://secret@example.test/mcp".into();
        assert!(validate(&config).is_err());
        config.url = "https://example.test/mcp".into();
        config
            .headers
            .insert("MCP-Session-Id".into(), "token".into());
        assert!(validate(&config).is_err());
        config.headers.clear();
        config.headers.insert(
            "Authorization".into(),
            "Bearer token\r\nInjected: true".into(),
        );
        assert!(validate(&config).is_err());
    }

    #[cfg(target_os = "macos")]
    #[tokio::test]
    async fn stdio_initializes_answers_ping_and_counts_all_tool_pages() {
        let root = Scratch::new();
        let mut config = server();
        config.args = vec!["-u".into(), "-c".into(), r#"
import json,sys
send=lambda x: print(json.dumps(x),flush=True)
for line in sys.stdin:
 r=json.loads(line)
 if r.get('method')=='initialize':
  send({'jsonrpc':'2.0','id':r['id'],'result':{'protocolVersion':'2025-06-18','capabilities':{'tools':{}}}})
 elif r.get('method')=='tools/list':
  send({'jsonrpc':'2.0','id':'ping','method':'ping'})
  assert json.loads(sys.stdin.readline())['result']=={}
  result={'tools':[{'name':'first'},{'name':'second'}]}
  if not r['params'].get('cursor'): result={'tools':[{'name':'first'}],'nextCursor':'next'}
  send({'jsonrpc':'2.0','id':r['id'],'result':result})
"#.into()];
        assert_eq!(
            tokio::time::timeout(
                Duration::from_secs(10),
                probe_stdio(&config, &root.0, &root.0, "/usr/bin:/bin")
            )
            .await
            .unwrap()
            .unwrap(),
            2
        );
    }

    #[cfg(target_os = "macos")]
    #[tokio::test]
    async fn cancelled_stdio_check_kills_child_and_descendants() {
        let root = Scratch::new();
        let mut config = server();
        let pidfile = root.0.join("child.pid");
        config.args = vec!["-u".into(), "-c".into(), "import os,subprocess,time,sys; p=subprocess.Popen(['/bin/sleep','60']); open(sys.argv[1],'w').write(str(p.pid)); time.sleep(60)".into(), pidfile.to_string_lossy().into_owned()];
        assert!(tokio::time::timeout(
            Duration::from_secs(2),
            probe_stdio(&config, &root.0, &root.0, "/usr/bin:/bin")
        )
        .await
        .is_err());
        let pid: i32 = std::fs::read_to_string(pidfile).unwrap().parse().unwrap();
        tokio::time::sleep(Duration::from_millis(100)).await;
        assert_eq!(unsafe { libc::kill(pid, 0) }, -1);
    }

    fn read_http(stream: &mut std::net::TcpStream) -> (String, String, Value) {
        stream
            .set_read_timeout(Some(Duration::from_secs(5)))
            .unwrap();
        let mut reader = std::io::BufReader::new(stream);
        let mut first = String::new();
        reader.read_line(&mut first).unwrap();
        let mut headers = String::new();
        let mut length = 0;
        loop {
            let mut line = String::new();
            reader.read_line(&mut line).unwrap();
            if line == "\r\n" {
                break;
            }
            if line.to_lowercase().starts_with("content-length:") {
                length = line.split(':').nth(1).unwrap().trim().parse().unwrap();
            }
            headers.push_str(&line);
        }
        let mut body = vec![0; length];
        reader.read_exact(&mut body).unwrap();
        (
            first,
            headers,
            serde_json::from_slice(&body).unwrap_or(Value::Null),
        )
    }
    fn http_reply(stream: &mut std::net::TcpStream, status: &str, headers: &str, body: &str) {
        write!(
            stream,
            "HTTP/1.1 {status}\r\nConnection: close\r\nContent-Length: {}\r\n{headers}\r\n{body}",
            body.len()
        )
        .unwrap();
    }

    #[tokio::test]
    async fn http_handles_sse_pages_auth_session_headers_and_cleanup() {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let worker = std::thread::spawn(move || {
            let mut requests = Vec::new();
            for _ in 0..5 {
                let (mut stream, _) = listener.accept().unwrap();
                let (first, headers, body) = read_http(&mut stream);
                assert!(headers
                    .to_lowercase()
                    .contains("authorization: bearer sample"));
                if first.starts_with("DELETE") {
                    assert!(headers.contains("test-session"));
                    http_reply(&mut stream, "200 OK", "", "");
                    requests.push("DELETE".to_string());
                    break;
                }
                let method = body["method"].as_str().unwrap();
                requests.push(method.to_string());
                match method {
                    "initialize" => http_reply(&mut stream,"200 OK","Content-Type: application/json\r\nMcp-Session-Id: test-session\r\n",&json!({"jsonrpc":"2.0","id":1,"result":{"protocolVersion":PROTOCOL,"capabilities":{"tools":{}}}}).to_string()),
                    "notifications/initialized" => http_reply(&mut stream,"202 Accepted","",""),
                    "tools/list" => {
                        assert!(headers.contains("test-session")); assert!(headers.contains(PROTOCOL));
                        let result = if body["params"].get("cursor").is_none() { json!({"tools":[{"name":"a"}],"nextCursor":"second"}) } else { json!({"tools":[{"name":"b"}]}) };
                        http_reply(&mut stream,"200 OK","Content-Type: text/event-stream\r\n",&format!("data: {}\n\n",json!({"jsonrpc":"2.0","id":body["id"],"result":result})));
                    }, _ => panic!("Unexpected request"),
                }
            }
            requests
        });
        let mut config = server();
        config.transport = "http".into();
        config.url = format!("http://{address}/mcp");
        config
            .headers
            .insert("Authorization".into(), "Bearer sample".into());
        assert_eq!(probe_http(&config).await.unwrap(), 2);
        assert_eq!(
            worker.join().unwrap(),
            [
                "initialize",
                "notifications/initialized",
                "tools/list",
                "tools/list",
                "DELETE"
            ]
        );
    }

    #[tokio::test]
    async fn cancelled_http_probe_still_deletes_remote_session() {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let (deleted_tx, deleted_rx) = tokio::sync::oneshot::channel();
        std::thread::spawn(move || {
            let mut slow = None;
            for _ in 0..4 {
                let (mut stream, _) = listener.accept().unwrap();
                let (first, _, body) = read_http(&mut stream);
                if first.starts_with("DELETE") {
                    http_reply(&mut stream, "200 OK", "", "");
                    let _ = deleted_tx.send(());
                    break;
                }
                match body["method"].as_str().unwrap() {
                    "initialize" => http_reply(&mut stream,"200 OK","Content-Type: application/json\r\nMcp-Session-Id: cleanup\r\n",&json!({"jsonrpc":"2.0","id":1,"result":{"protocolVersion":PROTOCOL,"capabilities":{"tools":{}}}}).to_string()),
                    "notifications/initialized" => http_reply(&mut stream,"202 Accepted","",""),
                    "tools/list" => slow = Some(stream), _ => panic!(),
                }
            }
            drop(slow);
        });
        let mut config = server();
        config.transport = "http".into();
        config.url = format!("http://{address}/mcp");
        assert!(
            tokio::time::timeout(Duration::from_millis(300), probe_http(&config))
                .await
                .is_err()
        );
        tokio::time::timeout(Duration::from_secs(3), deleted_rx)
            .await
            .unwrap()
            .unwrap();
    }

    #[tokio::test]
    async fn http_replies_to_server_requests_without_replaying_sse_events() {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let worker = std::thread::spawn(move || {
            for _ in 0..4 {
                let (mut stream, _) = listener.accept().unwrap();
                let (first, _, body) = read_http(&mut stream);
                if first.starts_with("DELETE") {
                    http_reply(&mut stream, "200 OK", "", "");
                    break;
                }
                match body["method"].as_str().unwrap() {
                    "initialize" => http_reply(&mut stream,"200 OK","Content-Type: application/json\r\nMcp-Session-Id: ping-session\r\n",&json!({"jsonrpc":"2.0","id":1,"result":{"protocolVersion":PROTOCOL,"capabilities":{"tools":{}}}}).to_string()),
                    "notifications/initialized" => http_reply(&mut stream,"202 Accepted","",""),
                    "tools/list" => {
                        let ping = format!("data: {}\n\n", json!({"jsonrpc":"2.0","id":"server-ping","method":"ping"}));
                        let unsupported = format!("data: {}\n\n", json!({"jsonrpc":"2.0","id":"server-other","method":"sampling/createMessage"}));
                        let result = format!("data: {}\n\n",json!({"jsonrpc":"2.0","id":body["id"],"result":{"tools":[{"name":"test"}]}}));
                        write!(stream,"HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\nConnection: close\r\nContent-Length: {}\r\n\r\n{}", ping.len()+unsupported.len()+result.len(), ping).unwrap();
                        let (mut reply, _) = listener.accept().unwrap(); let (_, _, response) = read_http(&mut reply);
                        assert_eq!(response["id"], "server-ping"); assert_eq!(response["result"], json!({})); http_reply(&mut reply,"202 Accepted","","");
                        stream.write_all(unsupported.as_bytes()).unwrap();
                        let (mut reply, _) = listener.accept().unwrap(); let (_, _, response) = read_http(&mut reply);
                        assert_eq!(response["id"], "server-other"); assert_eq!(response["error"]["code"], -32601); http_reply(&mut reply,"202 Accepted","","");
                        stream.write_all(result.as_bytes()).unwrap();
                    }, _ => panic!(),
                }
            }
        });
        let mut config = server();
        config.transport = "http".into();
        config.url = format!("http://{address}/mcp");
        assert_eq!(
            tokio::time::timeout(Duration::from_secs(5), probe_http(&config))
                .await
                .unwrap()
                .unwrap(),
            1
        );
        worker.join().unwrap();
    }

    #[tokio::test]
    async fn http_errors_do_not_expose_headers_query_tokens_or_response_body() {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let worker = std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let _ = read_http(&mut stream);
            http_reply(
                &mut stream,
                "401 Unauthorized",
                "Content-Type: application/json\r\n",
                "{\"message\":\"secret-header-value secret-url-value\"}",
            );
        });
        let mut config = server();
        config.transport = "http".into();
        config.url = format!("http://{address}/mcp?key=secret-url-value");
        config
            .headers
            .insert("Authorization".into(), "Bearer secret-header-value".into());
        let error = probe_http(&config).await.unwrap_err();
        assert!(error.contains("authentication"));
        assert!(!error.contains("secret"));
        worker.join().unwrap();
    }
}
