import { load } from "@tauri-apps/plugin-store";

const STORE_PATH = "settings.json";

async function getStore() {
  return await load(STORE_PATH, { autoSave: true, defaults: {} });
}

// --- API Key (persisted in Tauri store, overridden by env in dev) ---

export async function getApiKey(): Promise<string> {
  const envKey = import.meta.env.VITE_API_KEY;
  if (envKey) return envKey;

  try {
    const store = await getStore();
    return (await store.get<string>("apiKey")) || "";
  } catch {
    return "";
  }
}

export async function setApiKey(key: string): Promise<void> {
  const store = await getStore();
  await store.set("apiKey", key);
}

export async function getApiUrl(): Promise<string> {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  try {
    const store = await getStore();
    return (await store.get<string>("apiUrl")) || "https://api.promptrails.ai";
  } catch {
    return "https://api.promptrails.ai";
  }
}

export async function setApiUrl(url: string): Promise<void> {
  const store = await getStore();
  await store.set("apiUrl", url);
}

export async function clearAuth(): Promise<void> {
  const store = await getStore();
  await store.delete("apiKey");
  await store.delete("apiUrl");
}

// --- Polling ---

export async function getPollingInterval(): Promise<number> {
  try {
    const store = await getStore();
    const interval = await store.get<number>("pollingInterval");
    return interval || 60000;
  } catch {
    return 60000;
  }
}

export async function setPollingInterval(ms: number): Promise<void> {
  const store = await getStore();
  await store.set("pollingInterval", ms);
}

// --- Notification prefs ---

export async function getNotificationPrefs(): Promise<{
  approvals: boolean;
  failures: boolean;
}> {
  try {
    const store = await getStore();
    const prefs = await store.get<{ approvals: boolean; failures: boolean }>(
      "notifications",
    );
    return prefs || { approvals: true, failures: true };
  } catch {
    return { approvals: true, failures: true };
  }
}

export async function setNotificationPrefs(prefs: {
  approvals: boolean;
  failures: boolean;
}): Promise<void> {
  const store = await getStore();
  await store.set("notifications", prefs);
}
