# nurb desktop

A Tauri shell around nurb: project rail, agent chat column, and the live viewer in one window.

## Dev setup

Current stable Rust toolchain, Node 22.18 or newer, uv, and Xcode command line tools. From `desktop/`:

```
npm ci
npm run tauri dev
```

Debug builds run nurb out of this checkout (`uv run --project <repo> nurb dev`) and the ACP adapters through PATH `npx`, so nothing needs provisioning. `cargo test` inside `src-tauri/` needs `scripts/stage.sh` to have run once (the build script wants the uv sidecar); any `tauri dev` or `tauri build` runs it for you.

## Provisioning model

Release builds never touch the dev environment. On first launch the app provisions everything into its app data directory (`~/Library/Application Support/io.github.babgev.nurb`):

- `python/`, `env/`: a managed CPython and a venv holding the bundled nurb wheel plus its hash-pinned lock, installed by the bundled uv sidecar.
- `node/`, `adapters/`: the pinned Node LTS (downloaded from nodejs.org, checksum-verified), the Claude and Codex ACP adapters, and the official Gemini CLI, installed on the user's machine with `npm ci` from a committed integrity lock. Gemini speaks ACP natively through `--acp`; the app validates its Google AI Studio API key through ACP and stores the key in macOS Keychain, never app preferences. These packages are deliberately not bundled: the Claude Code binary inside `@anthropic-ai/claude-agent-sdk` is all-rights-reserved and must not be redistributed. Cursor and Grok speak ACP natively and are never provisioned at all: the app finds the CLI the vendor's own installer put on the machine (`~/.local/bin/agent`, `~/.grok/bin/grok`, then PATH). Until it exists the agent stays out of the rail; the rail's "need another agent?" help lists the missing ones with their installers.
- `provisioned.json`: what was installed, compared per component on every launch. A changed wheel payload, Python lock, Node version, or adapter lock redoes only its own component; a broken venv is deleted and rebuilt.

`scripts/stage.sh` stages the bundle inputs before every build: the nurb wheel from this checkout, a `uv pip compile --universal --generate-hashes` lock, the committed adapter manifest and lock, and the uv binaries for both darwin targets (skipped once downloaded).

Debug-build test overrides, never compiled into release: `NURB_DESKTOP_PROVISIONED=1` makes a debug build use the provisioned environment, and `NURB_DESKTOP_DATA=<dir>` points the whole app (registry, sessions, provisioned env) at a scratch directory.

## Release

This fork uses the app identifier `io.github.babgev.nurb` and its own Gemini Keychain service, so its preferences and Gemini API key are separate from the upstream app. Existing projects can be opened from their folders.

Signed releases and automatic updates are disabled until this fork has its own signing key and release feed. The app's Check for Updates menu explains this; it never downloads an upstream build. The inherited PyPI publish workflow runs only in the upstream repository, and `scripts/release.sh` refuses to publish while updater artifacts are disabled.

To enable distribution, configure a fork-owned updater public key and endpoint in `src-tauri/tauri.conf.json`, enable `createUpdaterArtifacts` there and `automaticUpdatesAvailable` in `src/App.tsx`, register the Tauri updater plugin in `src-tauri/src/lib.rs`, and supply your own Apple signing and notarization credentials as described by `.env.example`. Create the versioned GitHub release in `babgev/nurb` before running `scripts/release.sh`; the fork does not publish the upstream `nurb` package on PyPI. The script builds Apple silicon and Intel artifacts and publishes its update feed to `babgev/nurb`.

Until then, update a source checkout with `git pull`, `npm ci`, and `npm run tauri dev`. Release builds bundle the Python wheel from this checkout rather than downloading the upstream package.
