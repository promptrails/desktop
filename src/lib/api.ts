import { PromptRails } from "@promptrails/sdk";

let clientInstance: PromptRails | null = null;

export function initClient(apiKey: string, apiUrl: string): PromptRails {
  // Dev: use Vite proxy to avoid CORS
  const baseUrl = import.meta.env.DEV ? window.location.origin : apiUrl;

  clientInstance = new PromptRails({
    apiKey,
    baseUrl,
  });

  return clientInstance;
}

export function getClient(): PromptRails {
  if (!clientInstance) {
    throw new Error("Client not initialized");
  }
  return clientInstance;
}

export function resetClient(): void {
  clientInstance = null;
}

export function isClientReady(): boolean {
  return clientInstance !== null;
}
