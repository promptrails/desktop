# PromptRails Monitor

Desktop monitoring app for PromptRails AI agent executions. Built with Tauri v2, React, and TypeScript.

## Features

- **Live Execution Feed** — Real-time polling of agent executions with status, duration, and cost
- **Trace Viewer** — Collapsible trace tree with span details, input/output, and token usage
- **Approval Management** — View, approve, or reject pending human-in-the-loop approvals
- **Native Notifications** — Get notified when new approvals are pending
- **System Tray** — Lives in your tray with status indicator
- **Stats Dashboard** — Execution counts, success rates, costs, and top agents
- **Compact UI** — 420x700 window, no browser tab needed

## Installation

### Homebrew (macOS)

```bash
brew install promptrails/tap/promptrails-monitor
```

### Direct Download

Download the latest release from [GitHub Releases](https://github.com/promptrails/desktop/releases):

- **macOS**: `.dmg` (Apple Silicon & Intel)
- **Windows**: `.msi` / `.exe`
- **Linux**: `.AppImage` / `.deb`

### Build from Source

```bash
# Prerequisites: Node.js 18+, Rust 1.77+, pnpm
pnpm install
pnpm tauri build
```

## Development

```bash
pnpm install
pnpm tauri dev
```

## Configuration

1. Launch the app
2. Enter your PromptRails API URL (default: `https://api.promptrails.ai`)
3. Enter your API key (`pr_...`)
4. Click **Connect**

Settings (polling interval, notifications) are available in the Settings tab.

## Tech Stack

- [Tauri v2](https://v2.tauri.app/) — Lightweight desktop shell (~10MB)
- [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@promptrails/sdk](https://www.npmjs.com/package/@promptrails/sdk) — API client
- [TanStack Query](https://tanstack.com/query) — Polling & caching
- [Recharts](https://recharts.org/) — Charts

## License

MIT
