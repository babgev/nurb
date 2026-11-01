//! Chrome must start outside the agent's Seatbelt process: macOS does not
//! allow Chrome's renderer sandbox to initialize inside that sandbox.
//! The MCP process stays inside Seatbelt and connects to this private,
//! temporary browser. Neither sandbox is disabled.

use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::process::{Child, Command};

static NEXT_PROFILE: AtomicU64 = AtomicU64::new(0);
const START_TIMEOUT: Duration = Duration::from_secs(15);

pub struct BrowserSession {
    child: Option<Child>,
    group: Option<i32>,
    profile: PathBuf,
    endpoint: String,
}

impl BrowserSession {
    pub fn endpoint(&self) -> String {
        self.endpoint.clone()
    }

    pub fn output_dir(&self) -> PathBuf {
        self.profile
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .join("browser-output")
            .join(self.profile.file_name().unwrap())
    }
}

impl Drop for BrowserSession {
    fn drop(&mut self) {
        let Some(mut child) = self.child.take() else {
            return;
        };
        // A canceled ACP startup also drops this guard. Stop the entire
        // private browser group immediately, not the user's normal Chrome.
        kill_group(&mut child, self.group);
        let profile = self.profile.clone();
        if let Ok(runtime) = tokio::runtime::Handle::try_current() {
            runtime.spawn(async move {
                let _ = child.wait().await;
                let _ = std::fs::remove_dir_all(profile);
            });
        } else {
            // kill_on_drop reaps the child through Tokio's orphan queue.
            drop(child);
            let _ = std::fs::remove_dir_all(profile);
        }
    }
}

fn kill_group(child: &mut Child, group: Option<i32>) {
    #[cfg(unix)]
    if let Some(group) = group {
        unsafe { libc::kill(-group, libc::SIGKILL) };
    }
    let _ = child.start_kill();
}

fn chrome() -> Result<PathBuf, String> {
    #[cfg(target_os = "macos")]
    {
        let relative = "Google Chrome.app/Contents/MacOS/Google Chrome";
        let mut candidates = vec![PathBuf::from("/Applications").join(relative)];
        if let Some(home) = std::env::var_os("HOME") {
            candidates.push(PathBuf::from(home).join("Applications").join(relative));
        }
        return candidates.into_iter().find(|path| path.is_file()).ok_or_else(|| {
            "Google Chrome is required for the Browser MCP. Install Chrome, then check the connection again.".into()
        });
    }
    #[cfg(not(target_os = "macos"))]
    Err("The built-in Browser MCP currently requires macOS. Add a custom browser MCP server on this platform.".into())
}

fn create_profile(root: &Path) -> Result<PathBuf, String> {
    let directory = root.join("mcp/browser-profiles");
    std::fs::create_dir_all(&directory)
        .map_err(|error| format!("Could not prepare the isolated browser: {error}"))?;
    for _ in 0..16 {
        let stamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        let sequence = NEXT_PROFILE.fetch_add(1, Ordering::Relaxed);
        let profile = directory.join(format!("{}-{stamp}-{sequence}", std::process::id()));
        let mut builder = std::fs::DirBuilder::new();
        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;
            builder.mode(0o700);
        }
        match builder.create(&profile) {
            Ok(()) => return Ok(profile),
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => continue,
            Err(error) => {
                return Err(format!(
                    "Could not create an isolated browser profile: {error}"
                ))
            }
        }
    }
    Err("Could not allocate an isolated browser profile. Try again.".into())
}

fn endpoint(contents: &str) -> Option<String> {
    let mut lines = contents.lines();
    let port = lines.next()?.parse::<u16>().ok().filter(|port| *port > 0)?;
    let path = lines.next()?;
    let id = path.strip_prefix("/devtools/browser/")?;
    if id.is_empty()
        || id.len() > 128
        || !id
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-')
    {
        return None;
    }
    Some(format!("ws://127.0.0.1:{port}{path}"))
}

pub async fn launch(root: &Path) -> Result<BrowserSession, String> {
    let executable = chrome()?;
    let profile = create_profile(root)?;
    let mut command = Command::new(executable);
    command.args([
        "--headless=new",
        "--remote-debugging-address=127.0.0.1",
        "--remote-debugging-port=0",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-sync",
        "--disable-breakpad",
        "--password-store=basic",
        "--use-mock-keychain",
        "--no-startup-window",
    ]);
    command.arg(format!("--user-data-dir={}", profile.display()));
    command.arg(format!(
        "--crash-dumps-dir={}",
        profile.join("crashes").display()
    ));
    command
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .kill_on_drop(true);
    #[cfg(unix)]
    {
        use std::os::unix::process::CommandExt;
        command.as_std_mut().process_group(0);
    }
    let child = match command.spawn() {
        Ok(child) => child,
        Err(error) => {
            let _ = std::fs::remove_dir_all(&profile);
            return Err(format!(
                "Could not start the isolated Chrome browser: {error}"
            ));
        }
    };
    let mut browser = BrowserSession {
        group: child.id().map(|pid| pid as i32),
        child: Some(child),
        profile,
        endpoint: String::new(),
    };
    let started = tokio::time::Instant::now();
    loop {
        if let Some(status) = browser
            .child
            .as_mut()
            .unwrap()
            .try_wait()
            .map_err(|error| format!("Could not check Chrome startup: {error}"))?
        {
            return Err(format!("The isolated Chrome browser exited during startup ({status}). Close the connection and try again."));
        }
        let ready = browser.profile.join("DevToolsActivePort");
        if std::fs::metadata(&ready).is_ok_and(|metadata| metadata.len() <= 4096) {
            if let Ok(contents) = std::fs::read_to_string(ready) {
                if let Some(address) = endpoint(&contents) {
                    browser.endpoint = address;
                    return Ok(browser);
                }
            }
        }
        if started.elapsed() > START_TIMEOUT {
            return Err("Chrome did not become ready within 15 seconds. Check that Chrome can run on this Mac, then retry the Browser MCP.".into());
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn readiness_accepts_only_a_local_browser_endpoint() {
        assert_eq!(
            endpoint("1234\n/devtools/browser/a-b-123\n"),
            Some("ws://127.0.0.1:1234/devtools/browser/a-b-123".into())
        );
        for malformed in [
            "0\n/devtools/browser/id",
            "99999\n/devtools/browser/id",
            "1234\nhttps://elsewhere/id",
            "1234\n/devtools/browser/../x",
            "1234\n/devtools/browser/",
        ] {
            assert!(endpoint(malformed).is_none());
        }
    }

    #[test]
    fn each_profile_is_private_and_unique() {
        let root = std::env::temp_dir().join(format!("nurb-browser-test-{}", std::process::id()));
        let first = create_profile(&root).unwrap();
        let second = create_profile(&root).unwrap();
        assert_ne!(first, second);
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            assert_eq!(
                std::fs::metadata(&first).unwrap().permissions().mode() & 0o777,
                0o700
            );
        }
        std::fs::remove_dir_all(root).unwrap();
    }

    #[cfg(unix)]
    #[tokio::test]
    async fn dropping_a_canceled_start_stops_its_process_and_removes_its_profile() {
        use std::os::unix::process::CommandExt;
        let root = std::env::temp_dir().join(format!("nurb-browser-drop-{}", std::process::id()));
        let profile = create_profile(&root).unwrap();
        let mut command = Command::new("/bin/sh");
        command.args(["-c", "sleep 30"]).kill_on_drop(true);
        command.as_std_mut().process_group(0);
        let child = command.spawn().unwrap();
        let browser = BrowserSession {
            group: child.id().map(|pid| pid as i32),
            child: Some(child),
            profile: profile.clone(),
            endpoint: String::new(),
        };
        drop(browser);
        for _ in 0..100 {
            if !profile.exists() {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
        assert!(!profile.exists());
        std::fs::remove_dir_all(root).unwrap();
    }

    #[cfg(unix)]
    #[tokio::test]
    async fn an_exited_browser_parent_does_not_leave_its_children_running() {
        use std::os::unix::process::CommandExt;
        let root = std::env::temp_dir().join(format!("nurb-browser-exit-{}", std::process::id()));
        let profile = create_profile(&root).unwrap();
        let child_pid = profile.join("child.pid");
        let mut command = Command::new("/bin/sh");
        command
            .args(["-c", "sleep 30 & echo $! > \"$1\"", "sh"])
            .arg(&child_pid)
            .kill_on_drop(true);
        command.as_std_mut().process_group(0);
        let child = command.spawn().unwrap();
        let mut browser = BrowserSession {
            group: child.id().map(|pid| pid as i32),
            child: Some(child),
            profile: profile.clone(),
            endpoint: String::new(),
        };
        browser.child.as_mut().unwrap().wait().await.unwrap();
        assert!(browser.child.as_ref().unwrap().id().is_none());
        let descendant = std::fs::read_to_string(child_pid)
            .unwrap()
            .trim()
            .parse::<i32>()
            .unwrap();
        drop(browser);
        for _ in 0..200 {
            if !profile.exists() && unsafe { libc::kill(descendant, 0) } != 0 {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
        assert!(!profile.exists());
        assert_ne!(unsafe { libc::kill(descendant, 0) }, 0);
        std::fs::remove_dir_all(root).unwrap();
    }

    #[cfg(target_os = "macos")]
    #[tokio::test]
    #[ignore = "requires a local Google Chrome installation"]
    async fn real_chrome_starts_isolated_and_is_removed_on_close() {
        let root = std::env::temp_dir().join(format!("nurb-browser-live-{}", std::process::id()));
        let browser = launch(&root).await.unwrap();
        assert!(browser.endpoint().starts_with("ws://127.0.0.1:"));
        let profile = browser.profile.clone();
        let output = browser.output_dir();
        assert!(!output.starts_with(&profile));
        drop(browser);
        for _ in 0..100 {
            if !profile.exists() {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
        assert!(!profile.exists());
        std::fs::remove_dir_all(root).unwrap();
    }
}
