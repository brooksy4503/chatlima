import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

// Import auth performance monitor in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/utils/auth-performance-monitor');
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chatlima.com/"),
  title: {
    default: "ChatLima",
    template: "%s | ChatLima",
  },
  description:
    "ChatLima is a multi-model AI chat app with GPT, Claude, Gemini and 300+ models — web search, files, MCP tools, and transparent credits.",
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
    description:
      "ChatLima is a multi-model AI chat app with GPT, Claude, Gemini and 300+ models — web search, files, MCP tools, and transparent credits.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatLima",
    description:
      "ChatLima is a multi-model AI chat app with GPT, Claude, Gemini and 300+ models — web search, files, MCP tools, and transparent credits.",
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
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
