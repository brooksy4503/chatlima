import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TopNav } from "@/components/top-nav";
import { Providers } from "./providers";
import "./globals.css";
import Script from "next/script";
import { WebSearchProvider } from "@/lib/context/web-search-context";
import { cn } from "@/lib/utils";
import BuildInfo from "@/components/ui/BuildInfo";
import { IOSInstallPrompt } from "@/components/ios-install-prompt";
import { SidebarInset } from "@/components/ui/sidebar";
import { Suspense, lazy } from "react";

// Lazy load the ChatSidebar to improve initial page load performance
const ChatSidebar = lazy(() => import("@/components/chat-sidebar").then(module => ({ default: module.ChatSidebar })));

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chatlima.com/"),
  title: "ChatLima",
  description: "Feature-rich MCP-powered AI chatbot with multi-model support and advanced tools.",
  icons: {
    icon: "/logo.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-167x167.png", sizes: "167x167", type: "image/png" },
      { url: "/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChatLima",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    siteName: "ChatLima",
    url: "https://www.chatlima.com/",
    images: [
      {
        url: "https://www.chatlima.com/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
    description: "Feature-rich MCP-powered AI chatbot with multi-model support and advanced tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatLima",
    description: "Feature-rich MCP-powered AI chatbot with multi-model support and advanced tools.",
    images: ["https://www.chatlima.com/twitter-image.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "ChatLima",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" 
        />
      </head>
      <body className={`${inter.className}`}>
        <Providers>
          <WebSearchProvider>
            <div className="flex h-dvh w-full">
              {/* Sidebar - lazy loaded to improve initial page performance */}
              <Suspense fallback={
                <div className="w-[280px] bg-background/80 dark:bg-background/40 backdrop-blur-md border-r border-border/40 animate-pulse">
                  <div className="h-16 border-b border-border/40 flex items-center px-4">
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                    <div className="ml-2 h-4 w-20 bg-muted rounded"></div>
                  </div>
                  <div className="p-4 space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              }>
                <ChatSidebar />
              </Suspense>
              {/* Main content area - SidebarInset handles responsive peer classes */}
              <SidebarInset className="flex flex-col min-w-0">
                <TopNav />
                <div className="flex-1 flex justify-center overflow-hidden">
                  {children}
                </div>
              </SidebarInset>
            </div>
            <IOSInstallPrompt />
          </WebSearchProvider>
        </Providers>
        <Script defer src="https://cloud.umami.is/script.js" data-website-id="bd3f8736-1562-47e0-917c-c10fde7ef0d2" />
      </body>
    </html>
  );
}
