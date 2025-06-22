"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface CustomSidebarTriggerProps {
  variant: "collapsed" | "expanded";
  className?: string;
}

export function CustomSidebarTrigger({ variant, className }: CustomSidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();

  if (variant === "collapsed") {
    return (
      <button
        onClick={toggleSidebar}
        className={cn(
          "flex items-center justify-center w-8 h-8",
          "bg-muted hover:bg-accent rounded-md",
          "transition-all duration-300 ease-in-out",
          "opacity-70 hover:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
          className
        )}
        aria-label="Expand sidebar"
        title="Expand sidebar"
      >
        <Menu className="h-4 w-4 text-foreground/60 hover:text-foreground/90 transition-colors" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        "flex items-center justify-center p-2",
        "hover:bg-accent/50 rounded-md",
        "transition-all duration-300 ease-in-out",
        "opacity-70 hover:opacity-100",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        className
      )}
      aria-label="Collapse sidebar"
      title="Collapse sidebar"
    >
      <Menu className="h-4 w-4 text-foreground/60 hover:text-foreground/90 transition-colors" />
    </button>
  );
}