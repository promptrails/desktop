# Build from Source

## Prerequisites

- Node.js 18+
- Rust 1.77+
- pnpm 10+
- Linux only: `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`

## Build

```bash
git clone https://github.com/promptrails/desktop.git
cd desktop
pnpm install
pnpm tauri build
```

The built app will be in `src-tauri/target/release/bundle/`.
