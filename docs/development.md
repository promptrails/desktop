# Development

## Prerequisites

- Node.js 18+
- Rust 1.77+
- pnpm 10+

## Setup

```bash
pnpm install
cp .env.example .env
# Edit .env with your API URL and key
```

## Run

```bash
pnpm tauri dev
```

This starts both the Vite dev server (port 1420) and the Tauri app. Hot module replacement is enabled for the React frontend.

In dev mode, API requests go through Vite's proxy to avoid CORS issues:
- Frontend fetches `http://localhost:1420/api/...`
- Vite proxies to `VITE_API_URL` (e.g., `http://localhost:8082`)

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Vite dev server only |
| `pnpm tauri dev` | Start full Tauri app in dev mode |
| `pnpm build` | Build frontend (TypeScript + Vite) |
| `pnpm tauri build` | Build production app (all platforms) |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm format` | Prettier format |
| `pnpm format:check` | Prettier check |
| `pnpm validate` | Run all checks (typecheck + lint + format) |

## Project Structure

```
desktop/
├── src-tauri/          # Rust (Tauri v2)
│   ├── src/
│   │   ├── main.rs     # Entry point
│   │   ├── lib.rs      # Tauri commands, plugin setup
│   │   └── tray.rs     # System tray menu & behavior
│   └── tauri.conf.json # Window config, permissions
│
├── src/                # React frontend (Vite)
│   ├── pages/          # Route pages (Feed, Approvals, Stats, etc.)
│   ├── components/     # Shared UI components
│   ├── hooks/          # TanStack Query hooks
│   ├── stores/         # Tauri secure store (settings, auth)
│   └── lib/            # API client, utilities
│
├── .github/workflows/
│   ├── ci.yml          # Lint + typecheck + Rust check
│   └── release.yml     # Multi-platform build + release
│
└── docs/               # Documentation
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Shell | Tauri v2 |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| API | @promptrails/sdk |
| State | TanStack Query |
| Charts | Recharts |
| Linting | ESLint + Prettier |
