# Nurb Fork desktop

A Tauri shell around nurb: project rail, agent chat column, and the live viewer in one window.

## Dev setup

Rust toolchain, Node 24, uv, and Xcode command line tools. Then:

```
npm ci                 # at the repo root: it is an npm workspace, and the lockfile lives there
npm run tauri dev      # from this directory
```

Build the workbench from the repository root with `npm run build --workspace packages/workbench` before staging the engine wheel. Debug builds run the engine from `engine/`; use `NURB_DESKTOP_DATA` and `NURB_HOME` scratch directories for development so tests do not modify the real library. `cargo test` inside `src-tauri/` needs `scripts/stage.sh` to have run once (the build script wants the uv sidecar); any `tauri dev` or `tauri build` runs it for you.

## Provisioning model

Release builds never touch the dev environment. On first launch the app provisions everything into its app data directory (`~/Library/Application Support/io.github.babgev.nurb`):

- `python/`, `env/`: a managed CPython and a venv holding the bundled nurb wheel plus its hash-pinned lock, installed by the bundled uv sidecar.
- `node/`, `adapters/`: the pinned Node LTS (downloaded from nodejs.org, checksum-verified), the Claude metadata and Codex ACP adapters, the official Gemini CLI, and Playwright MCP, installed on the user's machine with `npm ci` from a committed integrity lock. Gemini speaks ACP natively through `--acp`; the app validates its Google AI Studio API key through ACP and stores the key in macOS Keychain, never app preferences. These packages are deliberately not bundled: the Claude Code binary inside `@anthropic-ai/claude-agent-sdk` is all-rights-reserved and must not be redistributed. Cursor and Grok speak ACP natively and are never provisioned at all: the app finds the CLI the vendor's own installer put on the machine (`~/.local/bin/cursor-agent`, `~/.grok/bin/grok`, then the PATH of the user's login shell, so Homebrew and npm installs count too; never the bare `agent`, which Grok's installer also claims). An app opened from Finder only gets launchd's bare PATH, so the app asks the login shell once at launch and hands that PATH to every agent it spawns. Until it exists the agent stays out of the rail; the rail's "need another agent?" help lists the missing ones with their installers.
- `provisioned.json`: what was installed, compared per component on every launch. A changed Python lock rebuilds the venv, a changed wheel on the same lock replaces only nurb inside it (no network needed, so an update works offline), and a changed Node version or adapter lock redoes only its own component; a broken venv is deleted and rebuilt.

The fork library lives in `home/` under the fork app data directory, separate from upstream's library. A serve already answering for that home is adopted, except one left by a crashed app (its parent is launchd) on another version, which is stopped and replaced so an update never keeps talking to an old engine.

`scripts/stage.sh` stages the bundle inputs before every build: the nurb wheel from this checkout, the dependencies as pinned by `engine/uv.lock` (`uv export`), the committed adapter manifest and lock, and the uv binaries for both darwin targets (skipped once downloaded).

Debug-build test overrides, never compiled into release: `NURB_DESKTOP_PROVISIONED=1` makes a debug build use the provisioned environment, and `NURB_DESKTOP_DATA=<dir>` points the whole app (registry, sessions, provisioned env) at a scratch directory.

## Install or update the Mac app

Install npm dependencies and build the workbench from the repository root, then build the app from `desktop/`:

```sh
npm ci
npm run build --workspace packages/workbench
cd desktop
npm run install:mac
```

This builds a locally signed release and replaces `/Applications/Nurb Fork.app`. If the app is running, the installer leaves it alone and prints a command to install the completed build after you quit it. It verifies the bundle identifier and signature before replacing anything, then keeps the previous app in `~/Library/Caches/io.github.babgev.nurb/app-backups/`. It never replaces the upstream `/Applications/nurb.app`. To install an already-built bundle, run `npm run install:mac -- "/path/to/Nurb Fork.app"`.

Every fork update uses the same `io.github.babgev.nurb` identity, app data directory, and Gemini Keychain service. Legacy project folders remain in place; imported projects are edited in the new local database. Back up the fork app data before a major upgrade. Conversation migration preserves the old records rather than deleting them. Open Nurb Fork from Applications when installation finishes. To roll back, quit the app and pass the previous bundle's path to the same installer; rollback does not restore older project files or app data.

The rail and About dialog identify this as `babgev fork 5`, alongside the upstream engine version `1.2.1`. Increment `FORK_BUILD` in `src/forkIdentity.ts` for a new fork revision; the engine version remains synchronized with the Python package and shared UI package.

## MCP connections

Open the MCPs button in the chat composer to add tools to your agents. Each server row shows the result of its latest connection check, the tool count it advertised, and any error. Refresh checks the servers again. These checks verify server availability; they do not claim that a running agent has loaded every advertised tool. Saved changes apply when a conversation starts or reconnects, and do not interrupt a running turn.

Choose **Add browser** to enable the managed [Playwright MCP](https://github.com/microsoft/playwright-mcp) connection. Google Chrome must be installed on the Mac. Nurb starts a separate Chrome instance with a private temporary profile; it never uses the cookies or tabs in your normal browser. It runs headlessly by default. Open the Browser row and enable **Show browser window** when you want to interact with it yourself, such as completing a sign-in or human-verification page. This setting applies to new or reopened conversations; an existing connection keeps its current mode. Connection checks always run headlessly. The browser can navigate, interact with pages, and download files. Downloads and other browser output are stored under the fork's app data directory in `mcp/browser-output/`, where the agent can read them and copy relevant files into the project. Temporary browser profiles are removed when their conversation connection closes.

Chrome starts as an app-owned process with its normal renderer sandbox enabled. The Playwright MCP process remains inside Nurb's existing agent sandbox and connects to that private browser through a loopback debugging endpoint. This arrangement avoids the macOS restriction that prevents Chrome's renderer sandbox from initializing inside an already-sandboxed agent process; neither sandbox is disabled.

Use **Add server** for other local stdio or remote HTTP MCP servers. Local servers accept an executable, argument list, and environment variables; HTTP servers accept a URL and optional headers. Settings are stored in the fork's private `mcp.json` file in its app data directory, so avoid copying that file into project repositories. Provider-native MCP settings may also load separately; the Nurb panel lists the connections configured through Nurb.

The Browser connection controls its isolated Chrome instance, not Mac applications. A separately installed computer-control MCP server can be added through the custom server form. Nurb does not copy Conductor or ChatGPT/Codex host-session tools, authentication, or access pipes into its agents.

## Release

Automatic updates and release publishing remain disabled until this fork has its own signing key and update feed. The application never installs an upstream build. `scripts/release.sh` refuses to publish while updater artifacts are disabled and targets `babgev/nurb` if a fork release channel is configured later.

The engine version in `engine/pyproject.toml`, the app version in `src-tauri/tauri.conf.json`, and the shared UI version stay synchronized. The separate `FORK_BUILD` in `src/forkIdentity.ts` identifies fork revisions. A full update must bundle a newly built workbench and engine wheel; a UI-only rebuild cannot upgrade the engine.
