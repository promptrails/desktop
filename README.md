# PromptRails Monitor

Desktop monitoring app for PromptRails AI agent executions.

## Features

- **Live Execution Feed** — Real-time polling of agent executions with status, duration, and cost
- **Trace Viewer** — Collapsible trace tree with span details, input/output, and token usage
- **Approval Inbox** — Review executions parked at `waiting_approval` and approve or deny them (execution-scoped HITL)
- **Execution Tree** — Drill into sub-agent, handoff, and workflow-node runs; cancel a running execution
- **Native Notifications** — Get notified on new approvals and execution failures (configurable)
- **System Tray** — Quick overview panel on left-click, context menu on right-click
- **Trace Stats** — Trace counts, success rates, cost, tokens, models, and sessions with 1D/7D/30D period tabs
- **Infinite Scroll** — Load more executions and approvals as you scroll
- **Compact UI** — 420x700 window, no browser tab needed

## Screenshots

| Tray Panel | Execution Feed | Stats Dashboard |
|:---:|:---:|:---:|
| ![Tray Panel](screenshots/panel.png) | ![Feed](screenshots/feed.png) | ![Stats](screenshots/stats.png) |

| Approvals | Settings |
|:---:|:---:|
| ![Approvals](screenshots/approvals.png) | ![Settings](screenshots/settings.png) |

## Installation

### Homebrew (macOS)

```bash
brew install --cask promptrails/tap/promptrails-monitor
```

### Direct Download

Download the latest release from [GitHub Releases](https://github.com/promptrails/desktop/releases):

| Platform | Format |
|----------|--------|
| macOS (Apple Silicon) | `.dmg` |
| macOS (Intel) | `.dmg` |
| Windows | `.msi` / `.exe` |
| Linux | `.AppImage` / `.deb` |

See [docs/](docs/) for configuration, development, and build-from-source guides.

## SDK dependency (temporary)

This app targets PromptRails **API v2** via `@promptrails/sdk` `^0.9.0`, which is
not yet published to npm. Because the version cannot be resolved from the
registry yet, the committed `pnpm-lock.yaml` is intentionally **stale** — it
still pins the previous `0.5.0` line and does not resolve `^0.9.0`. This is
expected and will be reconciled (`pnpm install`) once the SDK publishes to npm.

To build/validate locally against the unreleased SDK, build the sibling
checkout and link it (do **not** commit the link or an override):

```bash
cd ../javascript-sdk && npm ci && npm run build   # build the v0.9.0 SDK
cd -                                              # back to the desktop app
pnpm link ../javascript-sdk                        # local-only link
```

**TODO:** at the coordinated v2 release, publish `@promptrails/sdk` 0.9.x, then
run `pnpm install` here to regenerate the lockfile against the published
version and remove the local link.

## License

MIT
