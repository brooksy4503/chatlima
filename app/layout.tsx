import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ChatSidebar } from "@/components/chat-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bot, PlusCircle } from "lucide-react";
import { Providers } from "./providers";
import "./globals.css";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://mcp.scira.ai"),
  title: "Chatbot",
  description: "Chatbot is a minimalistic MCP client with a good feature set.",
  openGraph: {
    siteName: "Chatbot",
    url: "https://mcp.scira.ai",
    images: [
      {
        url: "https://mcp.scira.ai/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chatbot",
    description: "Chatbot is a minimalistic MCP client with a good feature set.",
    images: ["https://mcp.scira.ai/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <Providers>
          <div className="flex h-dvh w-full">
            <ChatSidebar />
            <main className="flex-1 flex flex-col relative">
              <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
                <SidebarTrigger>
                  <button className="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent rounded-md transition-colors">
                    <Bot className="h-4 w-4" />
                  </button>
                </SidebarTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent rounded-md transition-colors"
                  asChild
                >
                  <Link href="/" title="New Chat">
                    <PlusCircle className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex-1 flex justify-center">
                {children}
              </div>
            </main>
          </div>
        </Providers>
        <Script defer src="https://cloud.umami.is/script.js" data-website-id="bd3f8736-1562-47e0-917c-c10fde7ef0d2" />
      </body>
    </html>
  );
}
