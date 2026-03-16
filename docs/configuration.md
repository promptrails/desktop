# Configuration

## First Launch

1. Launch PromptRails Monitor
2. Enter your API key (`pr_...`)
3. Click **Connect**

The API key is stored securely in the OS keychain via Tauri's secure store.

By default, the app connects to `https://api.promptrails.ai`. For self-hosted instances, click **Show advanced options** and enter your API URL.

## Settings

Available in the **Settings** tab:

| Setting | Options | Default |
|---------|---------|---------|
| Polling Interval | 1 min, 2 min, 5 min, 10 min | 1 minute |
| Approval Notifications | On / Off | On |
| Failure Notifications | On / Off | On |

## Disconnect

To switch API keys or instances, go to **Settings** → **Disconnect**. This clears the stored credentials and returns to the setup screen.

## Environment Variables (Development)

For local development, you can set credentials via `.env` instead of the setup screen:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://api.promptrails.ai` | API base URL |
| `VITE_API_KEY` | — | API key (skips setup screen if set) |

When `VITE_API_KEY` is set, it takes precedence over the stored key.
