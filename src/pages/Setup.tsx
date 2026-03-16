import { useState } from "react";
import { PromptRails } from "@promptrails/sdk";
import { setApiKey, setApiUrl } from "../stores/auth";
import { initClient } from "../lib/api";

interface SetupProps {
  onConnected: () => void;
}

export default function Setup({ onConnected }: SetupProps) {
  const [apiKey, setApiKeyInput] = useState("");
  const [apiUrl, setApiUrlInput] = useState("https://api.promptrails.ai");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Test connection
      const testUrl = import.meta.env.DEV ? window.location.origin : apiUrl;
      const client = new PromptRails({ apiKey, baseUrl: testUrl });
      await client.agents.list({ page: 1, limit: 1 });

      // Save & init
      await setApiKey(apiKey);
      await setApiUrl(apiUrl);
      initClient(apiKey, apiUrl);
      onConnected();
    } catch {
      setError("Connection failed. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">PromptRails Monitor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your API key to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="pr_..."
              required
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showAdvanced ? "Hide" : "Show"} advanced options
          </button>

          {showAdvanced && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">API URL</label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="https://api.promptrails.ai"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Only change this for self-hosted instances
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !apiKey}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </form>
      </div>
    </div>
  );
}
