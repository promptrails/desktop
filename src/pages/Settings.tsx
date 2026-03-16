import { useState, useEffect } from "react";
import {
  getApiUrl,
  getPollingInterval,
  setPollingInterval,
  getNotificationPrefs,
  setNotificationPrefs,
  clearAuth,
} from "../stores/auth";
import { resetClient } from "../lib/api";

const pollingOptions = [
  { value: 60000, label: "1 minute" },
  { value: 120000, label: "2 minutes" },
  { value: 300000, label: "5 minutes" },
  { value: 600000, label: "10 minutes" },
];

export default function Settings() {
  const [apiUrl, setApiUrl] = useState("");
  const [polling, setPolling] = useState(60000);
  const [notifApprovals, setNotifApprovals] = useState(true);
  const [notifFailures, setNotifFailures] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setApiUrl(await getApiUrl());
      setPolling(await getPollingInterval());
      const prefs = await getNotificationPrefs();
      setNotifApprovals(prefs.approvals);
      setNotifFailures(prefs.failures);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await setPollingInterval(polling);
      await setNotificationPrefs({
        approvals: notifApprovals,
        failures: notifFailures,
      });
      setMessage("Settings saved.");
    } catch {
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    await clearAuth();
    resetClient();
    window.location.reload();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-sm font-semibold">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-5">
          {/* Connection info */}
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              Connection
            </h2>
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">API URL</p>
              <p className="font-mono text-sm">{apiUrl}</p>
            </div>
          </section>

          {/* Polling */}
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              Polling Interval
            </h2>
            <select
              value={polling}
              onChange={(e) => setPolling(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            >
              {pollingOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              Notifications
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notifApprovals}
                  onChange={(e) => setNotifApprovals(e.target.checked)}
                  className="rounded"
                />
                Pending approvals
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notifFailures}
                  onChange={(e) => setNotifFailures(e.target.checked)}
                  className="rounded"
                />
                Execution failures
              </label>
            </div>
          </section>

          {message && (
            <p
              className={`text-sm ${message.includes("Failed") ? "text-red-500" : "text-emerald-600"}`}
            >
              {message}
            </p>
          )}

          <div className="space-y-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
