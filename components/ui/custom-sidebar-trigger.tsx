"use client";

import * as React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
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
          "fixed left-0 top-1/2 transform -translate-y-1/2 z-50",
          "w-5 h-12 flex items-center justify-center",
          "bg-border/40 hover:bg-accent/60 rounded-r-md shadow-sm",
          "transition-all duration-300 ease-in-out",
          "hover:w-6 hover:shadow-md",
          "group opacity-70 hover:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
          className
        )}
        aria-label="Expand sidebar"
        title="Expand sidebar"
      >
        <div className="flex items-center justify-center">
          <div className="w-0.5 h-6 bg-foreground/50 rounded-full mr-1 transition-colors group-hover:bg-foreground/70" />
          <ChevronRight className="h-3 w-3 text-foreground/60 group-hover:text-foreground/90 transition-all duration-200 group-hover:translate-x-0.5" />
        </div>
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
        "group opacity-70 hover:opacity-100",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        className
      )}
      aria-label="Collapse sidebar"
      title="Collapse sidebar"
    >
      <div className="flex items-center justify-center">
        <ChevronLeft className="h-4 w-4 text-foreground/60 group-hover:text-foreground/90 transition-all duration-200 group-hover:-translate-x-0.5 mr-1" />
        <div className="w-0.5 h-4 bg-foreground/50 rounded-full transition-colors group-hover:bg-foreground/70" />
      </div>
    </button>
  );
}