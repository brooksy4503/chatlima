"use client";

import { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectsList } from "@/lib/hooks/use-projects";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ProjectDetailSheet } from "./project-detail-sheet";
import { ProjectsBrowserSheet } from "./projects-browser-sheet";

type Props = {
  userId: string | null;
  isCollapsed: boolean;
};

export function ProjectsSidebarSection({ userId, isCollapsed }: Props) {
  const [browserOpen, setBrowserOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);

  const { data: projects, isLoading } = useProjectsList(!!userId);

  const count = projects?.length ?? 0;

  const openNew = () => {
    setDetailProjectId(null);
    setDetailOpen(true);
  };

  const openEdit = (id: string) => {
    setDetailProjectId(id);
    setDetailOpen(true);
  };

  if (!userId) {
    return null;
  }

  const rowButton = (
    <SidebarMenuButton
      type="button"
      className={cn(
        "w-full gap-2",
        isCollapsed ? "justify-center" : "justify-start"
      )}
      onClick={() => setBrowserOpen(true)}
      aria-label={
        isCollapsed
          ? count > 0
            ? `Projects, ${count} total`
            : "Projects"
          : undefined
      }
      data-testid="projects-sidebar-open-browser"
    >
      <FolderKanban
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground",
          isCollapsed && "text-foreground"
        )}
      />
      {!isCollapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left text-sm text-foreground/80">
            Projects
          </span>
          {count > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 shrink-0 px-1.5 text-[10px] tabular-nums"
            >
              {count}
            </Badge>
          ) : null}
        </>
      )}
    </SidebarMenuButton>
  );

  return (
    <>
      <SidebarGroup className="flex-shrink-0 border-t border-border/40 pt-2">
        <SidebarGroupContent>
          <SidebarMenu className={cn(isCollapsed ? "gap-0" : "")}>
            <SidebarMenuItem>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{rowButton}</TooltipTrigger>
                  <TooltipContent side="right">
                    {count > 0 ? `Projects (${count})` : "Projects"}
                  </TooltipContent>
                </Tooltip>
              ) : (
                rowButton
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <ProjectsBrowserSheet
        open={browserOpen}
        onOpenChange={setBrowserOpen}
        projects={projects}
        isLoading={isLoading}
        onSelectProject={openEdit}
        onCreateProject={openNew}
      />

      <ProjectDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        projectId={detailProjectId}
      />
    </>
  );
}
