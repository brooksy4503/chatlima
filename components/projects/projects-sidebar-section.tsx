"use client";

import { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FolderKanban, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectsList } from "@/lib/hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectDetailSheet } from "./project-detail-sheet";

type Props = {
  userId: string | null;
  isCollapsed: boolean;
  setOpenMobile?: (open: boolean) => void;
};

export function ProjectsSidebarSection({
  userId,
  isCollapsed,
  setOpenMobile,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetProjectId, setSheetProjectId] = useState<string | null>(null);

  const { data: projects, isLoading } = useProjectsList(!!userId);

  const openNew = () => {
    setSheetProjectId(null);
    setSheetOpen(true);
    setOpenMobile?.(false);
  };

  const openEdit = (id: string) => {
    setSheetProjectId(id);
    setSheetOpen(true);
    setOpenMobile?.(false);
  };

  if (!userId) {
    return null;
  }

  return (
    <>
      <SidebarGroup className="flex-shrink-0 border-t border-border/40 pt-2">
        <SidebarGroupLabel
          className={cn(
            "px-4 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
            isCollapsed ? "sr-only" : ""
          )}
        >
          Projects
        </SidebarGroupLabel>
        <SidebarGroupContent>
          {!isCollapsed && (
            <div className="px-3 pb-2">
              <Button variant="outline" className="w-full" size="sm" onClick={openNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New project
              </Button>
            </div>
          )}
          <SidebarMenu className={cn(isCollapsed ? "gap-0" : "")}>
            {isLoading ? (
              !isCollapsed &&
              [0, 1].map((i) => (
                <SidebarMenuItem key={i} className="px-3 py-1">
                  <Skeleton className="h-8 w-full" />
                </SidebarMenuItem>
              ))
            ) : !projects?.length ? (
              !isCollapsed && (
                <SidebarMenuItem>
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No projects yet. Create one to attach instructions and files to chats.
                  </p>
                </SidebarMenuItem>
              )
            ) : (
              projects.map((p) =>
                isCollapsed ? (
                  <SidebarMenuItem key={p.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          className="justify-center"
                          onClick={() => openEdit(p.id)}
                        >
                          <FolderKanban className="h-4 w-4" />
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">{p.name}</TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={p.id}>
                    <SidebarMenuButton
                      className="w-full justify-start gap-2"
                      onClick={() => openEdit(p.id)}
                    >
                      <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{p.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )
            )}
            {isCollapsed && (
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      className="justify-center"
                      onClick={openNew}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">New project</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <ProjectDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        projectId={sheetProjectId}
      />
    </>
  );
}
