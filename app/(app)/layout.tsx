import { ChatSidebar } from "@/components/chat-sidebar";
import { AnonymousAuth } from "@/components/auth/AnonymousAuth";
import { IOSInstallPrompt } from "@/components/ios-install-prompt";
import { TopNav } from "@/components/top-nav";
import { SidebarInset } from "@/components/ui/sidebar";
import { ImageGenerationProvider } from "@/lib/context/image-generation-context";
import { WebSearchProvider } from "@/lib/context/web-search-context";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WebSearchProvider>
      <ImageGenerationProvider>
        <AnonymousAuth />
        <div className="flex h-dvh w-full">
          <ChatSidebar />
          <SidebarInset className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            <TopNav />
            <div className="flex min-h-0 min-w-0 flex-1 justify-center overflow-hidden">
              {children}
            </div>
          </SidebarInset>
        </div>
        <IOSInstallPrompt />
      </ImageGenerationProvider>
    </WebSearchProvider>
  );
}
