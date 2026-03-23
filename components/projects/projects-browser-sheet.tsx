"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, PlusCircle } from "lucide-react";
import type { ApiProject } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ApiProject[] | undefined;
  isLoading: boolean;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
};

export function ProjectsBrowserSheet({
  open,
  onOpenChange,
  projects,
  isLoading,
  onSelectProject,
  onCreateProject,
}: Props) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const filtered = useMemo(() => {
    const list = projects ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md"
        data-testid="projects-browser-sheet"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-border/40 px-4 py-4 pr-12">
          <SheetTitle>Projects</SheetTitle>
          <SheetDescription>
            Search, create, and open a project. Attach instructions and files to
            chats from the project detail view.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
          <div className="flex shrink-0 gap-2">
            <Input
              ref={searchRef}
              placeholder="Search projects…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              aria-label="Search projects"
            />
            <Button
              type="button"
              className="shrink-0 gap-1.5"
              aria-label="New project"
              onClick={() => {
                onOpenChange(false);
                onCreateProject();
              }}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1 pr-3">
            <div className="flex flex-col gap-1 pb-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </>
              ) : filtered.length === 0 ? (
                <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                  {(projects?.length ?? 0) === 0
                    ? "No projects yet. Use New to create one."
                    : "No projects match your search."}
                </p>
              ) : (
                filtered.map((p) => (
                  <Button
                    key={p.id}
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-auto w-full justify-start gap-2 py-2.5 pl-3 pr-2 font-normal"
                    )}
                    onClick={() => {
                      onOpenChange(false);
                      onSelectProject(p.id);
                    }}
                  >
                    <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-left">{p.name}</span>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
