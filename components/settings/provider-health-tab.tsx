"use client";

import { ProviderHealthDashboard } from "@/components/provider-health-dashboard";

export function ProviderHealthTab() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Provider Health</h3>
        <p className="text-sm text-muted-foreground">
          Monitor the status and availability of AI model providers.
        </p>
      </div>
      <ProviderHealthDashboard 
        dialogMode={false} 
        compact={false} 
        showRefreshButton={true} 
      />
    </div>
  );
}
