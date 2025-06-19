import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ChatSidebar } from "@/components/chat-sidebar";
import { TopNav } from "@/components/top-nav";
import { Providers } from "./providers";
import "./globals.css";
import Script from "next/script";
import { WebSearchProvider } from "@/lib/context/web-search-context";
import { cn } from "@/lib/utils";
import BuildInfo from "@/components/ui/BuildInfo";
import { IOSInstallPrompt } from "@/components/ios-install-prompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chatlima.com/"),
  title: "ChatLima",
  description: "ChatLima is a minimalistic MCP client with a good feature set.",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatLima",
    description: "ChatLima is a minimalistic MCP client with a good feature set.",
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
              <ChatSidebar />
              <main className="flex-1 flex flex-col">
                <TopNav />
                <div className="flex-1 flex justify-center overflow-hidden">
                  {children}
                </div>
              </main>
            </div>
            <IOSInstallPrompt />
          </WebSearchProvider>
        </Providers>
        <Script defer src="https://cloud.umami.is/script.js" data-website-id="bd3f8736-1562-47e0-917c-c10fde7ef0d2" />
      </body>
    </html>
  );
}
