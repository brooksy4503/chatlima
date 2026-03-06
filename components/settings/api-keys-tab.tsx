"use client";

import { ApiKeyManager } from "@/components/api-key-manager";

export function ApiKeysTab() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">API Keys</h3>
        <p className="text-sm text-muted-foreground">
          Manage your API keys for different AI providers. Keys are stored securely in your browser&apos;s local storage.
        </p>
      </div>
      <ApiKeyManager embedded />
    </div>
  );
}
