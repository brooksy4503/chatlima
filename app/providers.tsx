"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { MCPProvider } from "@/lib/context/mcp-context";
import { ModelProvider } from "@/lib/context/model-context";
import { PresetProvider } from "@/lib/context/preset-context";
import { AuthProvider } from "@/lib/context/auth-context";
import { AnonymousAuth } from "@/components/auth/AnonymousAuth";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Disabled to prevent excessive auth calls
      refetchOnMount: false, // Don't refetch on mount if data is available
      refetchOnReconnect: false, // Don't refetch on reconnect
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(
    STORAGE_KEYS.SIDEBAR_STATE,
    true
  );
  
  // Prevent hydration mismatch by ensuring we only use localStorage values after mounting
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
          themes={["light", "dark", "black", "sunset", "cyberpunk", "retro", "nature"]}
          storageKey="mcp-theme"
        >
          <MCPProvider>
            <ModelProvider>
              <PresetProvider>
                <SidebarProvider 
                  defaultOpen={true} 
                  open={isMounted ? sidebarOpen : true} 
                  onOpenChange={setSidebarOpen}
                >
                  <AnonymousAuth />
                  {children}
                  <Toaster position="top-center" richColors />
                </SidebarProvider>
              </PresetProvider>
            </ModelProvider>
          </MCPProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 