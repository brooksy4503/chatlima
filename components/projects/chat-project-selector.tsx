"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderKanban, Loader2, Unlink } from "lucide-react";
import { useProjectsList, projectsQueryKey, type ApiProject } from "@/lib/hooks/use-projects";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type LinkedProject = {
  projectId: string;
  name: string;
  instructions: string;
};

export function ChatProjectSelector({
  chatId,
  userId,
}: {
  chatId: string | undefined;
  userId: string | null;
}) {
  const queryClient = useQueryClient();
  const isMobileScreen = useIsMobile();
  const { data: projects, isLoading: listLoading } = useProjectsList(!!userId && !!chatId);

  const { data: linked, isLoading: linkLoading } = useQuery({
    queryKey: ["chat-project", chatId],
    queryFn: async () => {
      const res = await fetch(`/api/chats/${chatId}/project`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load linked project");
      }
      const body = await res.json();
      return body.project as LinkedProject | null;
    },
    enabled: !!chatId && !!userId,
    staleTime: 1000 * 30,
  });

  const [mutating, setMutating] = useState(false);

  if (!chatId || !userId) {
    return null;
  }

  const linkTo = async (project: ApiProject) => {
    setMutating(true);
    try {
      const res = await fetch(`/api/chats/${chatId}/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to link project");
      }
      await queryClient.invalidateQueries({ queryKey: ["chat-project", chatId] });
      await queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["project"] });
      toast.success(`Linked to “${project.name}”`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to link project");
    } finally {
      setMutating(false);
    }
  };

  const unlink = async () => {
    setMutating(true);
    try {
      const res = await fetch(`/api/chats/${chatId}/project`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to unlink");
      }
      await queryClient.invalidateQueries({ queryKey: ["chat-project", chatId] });
      await queryClient.invalidateQueries({ queryKey: ["project"] });
      toast.success("Project unlinked from this chat");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to unlink");
    } finally {
      setMutating(false);
    }
  };

  const loading = linkLoading || listLoading;
  const isLinked = !!linked;
  const switchableProjects = (projects || []).filter((p) => p.id !== linked?.projectId);
  const tooltipLabel = loading
    ? "Loading projects..."
    : isLinked
      ? `Linked to ${linked.name}`
      : projects?.length
        ? "Link a project"
        : "Create a project in the sidebar first";

  const iconSizeClass = isMobileScreen ? "h-3.5 w-3.5" : "h-4 w-4";
  const buttonSizeClass = isMobileScreen ? "h-8 w-8" : "h-9 w-9";

  const triggerButton = (
    <button
      type="button"
      disabled={mutating || loading || (!isLinked && !projects?.length)}
      aria-label={tooltipLabel}
      className={cn(
        buttonSizeClass,
        "flex items-center justify-center rounded-full border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30",
        mutating || loading || (!isLinked && !projects?.length)
          ? "bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50"
          : isLinked
            ? "bg-primary text-primary-foreground border-primary shadow"
            : "bg-background border-border text-muted-foreground hover:bg-accent"
      )}
    >
      {mutating || loading ? (
        <Loader2 className={cn(iconSizeClass, "animate-spin")} />
      ) : (
        <FolderKanban className={iconSizeClass} />
      )}
    </button>
  );

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            {triggerButton}
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>{tooltipLabel}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-[240px] max-h-[280px] overflow-y-auto">
        {isLinked ? (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              <span className="flex items-center gap-2 min-w-0">
                <FolderKanban className="h-4 w-4 shrink-0" />
                <span className="truncate">{linked.name}</span>
              </span>
            </DropdownMenuLabel>
            {switchableProjects.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Switch to another project
                </DropdownMenuLabel>
                {switchableProjects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => linkTo(p)}
                    disabled={mutating}
                    className="cursor-pointer"
                  >
                    <FolderKanban className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                    <span className="truncate">{p.name}</span>
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => unlink()}
              disabled={mutating}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Unlink className="h-4 w-4 mr-2 shrink-0" />
              Unlink project
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {projects?.length
                ? "Choose a project for this chat"
                : "Create a project in the sidebar first"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(projects || []).map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => linkTo(p)}
                disabled={mutating}
                className="cursor-pointer"
              >
                <FolderKanban className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                <span className="truncate">{p.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
