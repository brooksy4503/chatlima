"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/models", label: "Models" },
  { href: "/compare", label: "Compare" },
  { href: "/faq", label: "FAQ" },
  { href: "/upgrade", label: "Pricing" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[18rem] p-0">
              <SheetHeader className="border-b border-border/40 px-4 py-4 text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6" />
                  ChatLima
                </SheetTitle>
                <SheetDescription>Navigate ChatLima marketing pages.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-muted",
                        isActivePath(pathname, item.href) ? "bg-muted text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button asChild className="mt-3 w-full">
                    <Link href="/chat">Start chatting</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-2.5 font-semibold" aria-label="ChatLima home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
            <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6" priority />
          </span>
          <span>ChatLima</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground",
                isActivePath(pathname, item.href) && "text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/chat">
            Start chatting
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="sm" className="sm:hidden">
          <Link href="/chat">Chat</Link>
        </Button>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={20} height={20} />
          <span>ChatLima</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/faq" className="hover:text-foreground">
            FAQ
          </Link>
          <Link href="/chat" className="hover:text-foreground">
            Open Chat
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex-1 overflow-hidden bg-background text-foreground">
      <a
        href="#marketing-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to content
      </a>
      <MarketingHeader />
      <main id="marketing-content">{children}</main>
      <MarketingFooter />
    </div>
  );
}
