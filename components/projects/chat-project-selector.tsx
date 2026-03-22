"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderKanban, ChevronDown, X, Loader2 } from "lucide-react";
import { useProjectsList, projectsQueryKey, type ApiProject } from "@/lib/hooks/use-projects";
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

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 mb-2 px-0",
        "text-sm"
      )}
    >
      <span className="text-muted-foreground shrink-0">Project:</span>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : linked ? (
        <div className="flex items-center gap-1 min-w-0 flex-wrap">
          <Badge variant="secondary" className="font-normal max-w-[200px] truncate">
            <FolderKanban className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{linked.name}</span>
          </Badge>
          {(projects || []).filter((p) => p.id !== linked.projectId).length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  disabled={mutating}
                >
                  Switch
                  <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[240px] max-h-[240px] overflow-y-auto">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Switch to another project
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(projects || [])
                  .filter((p) => p.id !== linked.projectId)
                  .map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => linkTo(p)}
                      className="cursor-pointer"
                    >
                      <FolderKanban className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                      <span className="truncate">{p.name}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => unlink()}
            disabled={mutating}
            aria-label="Unlink project"
          >
            {mutating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={mutating || !projects?.length}
            >
              {mutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Link a project
                  <ChevronDown className="ml-1 h-4 w-4 opacity-60" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[240px] max-h-[280px] overflow-y-auto">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {projects?.length
                ? "Choose a project for this chat"
                : "Create a project in the sidebar first"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(projects || []).map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => linkTo(p)} className="cursor-pointer">
                <FolderKanban className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                <span className="truncate">{p.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
