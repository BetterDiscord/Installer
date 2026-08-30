# AGENT OPERATING NOTES

These notes are curated for downstream agents. Treat them as binding guidance: each section funnels a different expectation for builds, style, testing and compliance with upstream tooling. (`CLAUDE.md` is a symlink to this file.)

## 1. Project layout recap

A Wails app: Go backend + Svelte (SvelteKit) frontend, packaged as a single native binary.

- `frontend/` — Bun + SvelteKit UI written in **Svelte 5 (runes)**. Built by Vite into `frontend/build` and embedded into Go via `//go:embed all:frontend/build` in `main.go`. Wails TS bindings are generated into `frontend/src/lib/wailsjs`.
- `api/` — the Wails-bound `Controller`: install/repair/uninstall actions, native dialogs, and the GUI logging bridge.
- `betterdiscord/` — download plus install/repair/uninstall of the BetterDiscord asar.
- `discord/` — Discord install discovery and injection; per-OS path logic lives in `paths_*.go`.
- `types/`, `utils/`, `wsl/` — shared Go types, backend helpers, and WSL detection/path mapping.
- `main.go` / `app.go` — Wails entry point, window options, and the startup update check.
- `build/` — product icons plus plist/manifest/packaging templates (scaffolded/generated; not usually hand-edited).
- `scripts/` — release helpers: `build-frontend.sh`, `build-appimage.sh`, `bundle-macos-app.sh`, and the `winres` Go generator.
- `wails.json` — Wails config + frontend hooks (`frontend:install` = `bun install`, `frontend:build` = `bun run build`). Keep it synchronized with the commands you run locally.
- `Taskfile.yml` — dev/build/check/release shortcuts. `.goreleaser.yaml` — release build + publishing config.

## 2. Build, dev & release commands

Prereqs: Go (matches `go.mod`), Bun, the Wails CLI, and optionally Task + GoReleaser. On Linux, `wails dev`/`wails build` require `-tags webkit2_41` (the Task shortcuts add this automatically).

Follow this checklist before you claim a build is validated.

1. `cd frontend && bun install`
   * Bootstraps the renderer toolchain. Required before `wails dev/build` and before running any Bun scripts. The `frontend:install` hook in `wails.json` runs this during `wails build`.
2. `task dev` (or `wails dev`)
   * Launches the Go server, compiles the renderer on demand, and proxies events between them. Closest analog to the installed app; use it for interactive testing (dialogs, runtime events, system prompts).
3. `task build` (or `wails build`)
   * Produces a local native binary and triggers the `frontend:build` hook (`bun run build`) so the embed picks up the latest UI. Note: official release artifacts come from GoReleaser (see §6), not `wails build`.

### Frontend-only helpers (run from `frontend/`)

- `bun run dev` – Vite dev server only (renderer, no Go bindings).
- `bun run build` – rebuild the renderer bundle into `frontend/build` when changing UI/TS/CSS without touching Go.
- `bun run check` – `svelte-kit sync` + `svelte-check` (Svelte/TypeScript static checks).
- `bun run lint` – ESLint using the shared config in `frontend/eslint.config.js`.
- `bun run test` – Vitest unit tests.

### Go-specific commands

- `go test ./...` (or `task test`) – backend tests.
- `go vet ./...` (or `task vet`) – static analysis.
- `gofmt -w .` – required formatting for the `.go` files you touch.
- `task check` – runs frontend check + lint, `go vet`, and `go test` in one shot. It does **not** run the frontend Vitest suite; run `bun run test` for that.

## 3. Running isolated tests

- Backend: narrow with the `-run` regex, e.g. `go test ./types -run TestDiscordChannel_Name` (swap the suite name as needed).
- Many backend tests gate on `runtime.GOOS` with `t.Skipf` when the OS doesn't match — run the subset aligned with your OS; these are guards, not cross-platform stubs.
- The frontend has **real Vitest unit tests** (co-located `*.test.ts`, e.g. `Checkbox.test.ts`, `handlers.test.ts`). Run all with `bun run test`, or a single file with `bunx vitest run src/lib/utils/handlers.test.ts`. `bun run check` covers types separately.

## 4. Style rules – Go / backend

1. **Imports**
   * Standard library imports first (e.g., `context`, `embed`, `log`).
   * Blank line, then external dependencies (Wails, pkg/browser), then another blank line.
   * Local packages (`installer/api`, `installer/types`, `installer/utils`, …) go last.
2. **Formatting**
   * Always run `gofmt`. Tabs are canonical Go indentation.
   * Tables (like the ones in `channel_test.go`) are aligned for readability.
3. **Types & naming**
   * Exported structs and interfaces follow PascalCase (e.g., `App`, `Controller`).
   * Private helpers stay lowercase.
   * Channel constants are grouped and defined with `iota` (`Stable`, `Canary`, `PTB`).
4. **Error handling**
   * Prefer early returns instead of nested conditionals.
   * When something fails (e.g., `install.InstallBD()`), emit the failure event (`runtime.EventsEmit(action.ctx, "failure")`) and `return` immediately.
   * Swallow errors only when a retry loop is not viable; always log or emit events so the renderer can surface the failure.
5. **Context & runtime**
   * Store the Wails `context.Context` in the struct once (`SetContext`). Reuse the stored value for dialogs, events, etc.
   * Use the context for runtime calls (`runtime.MessageDialog`, `runtime.OpenDirectoryDialog`). Guard all runtime returns and treat empty strings as cancellations.
6. **Logging/event protocol**
   * `Controller.Write` mirrors `fmt` output to the UI by emitting a `log` event; the default logger is wired to it in `main.go`.
   * Emit only the semantic events both sides agree on: `log`, `success`, `failure`, `reset`, and `navigate` (which carries an `{action}` payload). Do not invent new event names without updating the Svelte listeners.
7. **Assets & versions**
   * UI assets live in `frontend/build`. Any Svelte change needs a `bun run build` so the Go embed rule picks it up.
   * The version string is injected via `-ldflags "-X main.version=…"` (see §6). Compare against GitHub release data with `utils.CompareVersions` to decide if an update is needed.
8. **Dialogs**
   * Wrap each dialog in a helper that returns string results (`BrowseForDiscord`, `ConfirmAction`, `ShowNotice`). If the call errors or returns an empty string, propagate an empty response and let the renderer treat it as cancel.

## 5. Style rules – Frontend (Svelte 5 + Bun)

### Imports & modules

- Prefer `$lib/` aliases for shared assets, stores, components (see `+page.svelte` or `+layout.svelte`). Import generated Wails bindings via the `@api` alias.
- Local constants (e.g., `const installPaths = ...`) live near top-level script scope for clarity.
- Keep third-party imports grouped (Svelte, Wails runtime, helpers) and sorted within each category.

### Script style

- Always use `<script lang="ts">`.
- Default to `const` unless a binding reassigns; reactive state uses `$state`/`$derived` runes (this is Svelte 5 — no legacy `writable`/`derived` stores).
- Introspect derived state with expressions like `$derived(window.navigator.platform.startsWith("Mac"))` (see `+layout.svelte`).
- Inline helper functions (`log`, `succeed`, `reset`) should be declared near the state definitions.

### Components & layout

- Use the shared `<Page>`, `<TextDisplay>`, `<ProgressBar>`, `Titlebar`, and `Footer` components to keep layout consistent.
- Where the UI depends on state (e.g., `currentAction`), render the SVG logic inline inside named snippet helpers (`{#snippet icon()}`) instead of spreading props.
- `listenFor` / `unlistenFor` lifecycles should be paired in `onMount`/`onDestroy` blocks to avoid leaking event listeners. Register listeners before kicking off backend actions so early events aren't missed.

### Styling

- Keep component styles scoped with `<style>` blocks. Avoid global selectors.
- Reference CSS custom properties (`--bg2`, `--bg2-alt`) for colors; these live in `frontend/src/lib/styles/theme.css`.
- Use textures/gradients and layered pseudo-elements (see `.installer-body::after` in `+layout.svelte`) to maintain the polished aesthetic.
- Avoid brittle absolute positioning; prefer flex layouts and `contain: strict` for window surfaces.

### State & events

- Store logs and progress inside `$state` wrappers, and mutate them via `logs.push(...)` or direct assignments.
- Expose `active` flags for async work, so the page can wire `canGoNext={!active}`.
- Treat `listenFor` payloads as trusted strings but still guard against empty events (e.g., call `message.trim()` before pushing into logs).

### TypeScript organization

- Use `type` aliases for simple shapes. Keep them near the components that consume them.
- Keep `frontend/package.json` and `bun.lock` updated in parallel when dependencies change.
- For generated bindings, prefer the Wails TS typing output in `frontend/src/lib/wailsjs`, imported through the `@api` alias to keep runtime definitions stable.

## 6. Release & CI context

Releases are **tag-driven via GoReleaser**, not a bespoke pipeline.

- **Trigger.** Pushing a `vX.Y.Z` tag runs `.github/workflows/release.yml`, which invokes GoReleaser (`.goreleaser.yaml`) across a linux/windows/macOS matrix. `max-parallel: 1` + `mode: keep-existing` mean the first leg creates the GitHub release and the others add to it; each leg sets `RELEASE_OS` so GoReleaser builds only that OS.
- **Prereleases.** A tag like `v2.0.0-alpha.1` is detected as a prerelease (`prerelease: auto`); winget/homebrew publishing is skipped (`skip_upload: auto`).
- **Version.** Injected via `-ldflags "-X main.version={{ .Tag }}"`. CI also overrides `wails.json` `info.productVersion` so Windows file metadata matches the tag. A `main.version` that doesn't start with `v` is treated as a dev build and skips the update check (`app.go`).
- **Artifacts.** `BetterDiscord-Installer-Windows.exe`, `-Mac.zip` (universal `.app`), `-Linux.zip`, plus `-Linux.AppImage.zip` (built by `scripts/build-appimage.sh`, attached via `release.extra_files`) and per-OS `checksums_<os>.txt`.
- **Publishing.** The Homebrew cask and winget manifest are pushed to `BetterDiscord/homebrew-tap` and the `betterdiscord/winget-pkgs` fork using `GH_PAT` (falls back to `GITHUB_TOKEN`, which can't push cross-repo).
- **CI on PRs/push** (`ci.yml`): frontend check/lint/test/build, `go test`, `goreleaser check`, and a **linux** release snapshot. The Windows/macOS release legs are only exercised by the manual `snapshot.yml` (`workflow_dispatch`) — run it before tagging.
- **Windows resources.** GoReleaser runs plain `go build`, which (unlike `wails build`) doesn't embed the icon/manifest/version info; `scripts/winres` generates the `.syso` in a pre-build hook.

## 7. Documentation & collaborator expectations

- Reference `README.md` for high-level orientation and `CONTRIBUTING.md` for style-guide summaries and the AI-assisted-contributions policy.
- Emulate the verbose variable names and whole-module imports suggested in `CONTRIBUTING.md` (e.g., avoid destructuring core Node modules if the repo avoids it).
- When documenting new behavior, add sections to `README.md` (or a dedicated `docs/` file); keep AGENTS focused on machine-readable guidance.

## 8. Cursor / Copilot / assistant config

- `CLAUDE.md` is a symlink to this file, so Claude Code reads the same guidance.
- There are no `.cursor/rules/` or `.cursorrules` files and no `.github/copilot-instructions.md`; default assistant settings apply.
- If future agents add cursor/Copilot rules, append them to this section so every agent reads the new constraints first.

## 9. Security, secrets, and environment

- **Never commit credentials, tokens, or `.env` files.** Release publishing relies solely on GitHub Actions secrets: `GITHUB_TOKEN` (create/upload the release) and `GH_PAT` (open cross-repo PRs to the Homebrew tap and the winget-pkgs fork). No secret is needed to build locally.
- **The app is not notarized and has no Developer ID** — there is no code-signing secret. Windows SmartScreen and macOS Gatekeeper warnings are expected and documented in the README FAQ; do not add signing config that needs certs/secrets unless they actually exist.
- **macOS builds are ad-hoc signed** by `scripts/bundle-macos-app.sh` (`codesign --sign -`), which needs no Apple account. This is not about Gatekeeper — it seals the `.app` so macOS keeps App Management (TCC) grants across launches; without it the permission silently resets and injection fails (#424). Keep the archive's `files:` entries pointed at the sealed staging copies, and don't sign a copy of the bundle: `codesign` rewrites the main executable, and the archive ships GoReleaser's own binary artifact.
- **Supply chain.** `scripts/build-appimage.sh` pins `appimagetool` to a version and verifies its SHA-256 before use. The downloaded `betterdiscord.asar` is fetched over TLS from the official site (GitHub release as a fallback) — there is no checksum verification of that asar yet; treat it as a known gap, not something to silently remove.
- **Auto-update is non-silent.** `app.go` checks the latest GitHub release and, if newer, asks the user and opens the download in a browser — it never downloads or executes an update itself. Preserve that confirmation flow.
- Keep tracked config (`wails.json`, `frontend/package.json`, `go.mod`) clean; do not add untracked credential copies to the tree.

## 10. Help & escalation

- If you find conflicting conventions between AGENTS and `CONTRIBUTING.md`, escalate by opening an issue so the maintainers can harmonize the documents.
- Use the Wails community (https://wails.io/support) or BetterDiscord Discord (linked from README) when runtime integration questions exceed local knowledge.
- Document any new tooling (e.g., a new CLI helper) within this file so future agents immediately know how to operate the repo.

## 11. AI self-disclosure

If you are an autonomous agent submitting a PR where the human operator did not personally review the output before submission, say so explicitly in the PR description. For example:

> This PR was generated by [agent/tool]. The human operator [reviewed the diff and ran the checks locally / did not review the output before submission].

This is a transparency expectation, not a penalty against AI-assisted work. It helps calibrate review effort. PRs that appear to be unreviewed agent output without this disclosure will be closed without detailed feedback.
