# PromptRails Monitor

Desktop monitoring app for PromptRails AI agent executions. Built with Tauri v2, React, and TypeScript.

## Features

- **Live Execution Feed** — Real-time polling of agent executions with status, duration, and cost
- **Trace Viewer** — Collapsible trace tree with span details, input/output, and token usage
- **Approval Management** — View, approve, or reject pending human-in-the-loop approvals
- **Native Notifications** — Get notified on new approvals and execution failures (configurable)
- **System Tray** — Quick overview panel on left-click, context menu on right-click
- **Stats Dashboard** — Execution counts, success rates, costs, top agents with 1D/7D/30D period tabs
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

## License

MIT
