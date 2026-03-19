"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export const projectsQueryKey = ["projects"] as const;

export type ApiProject = {
  id: string;
  userId: string;
  name: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ApiProjectFile = {
  id: string;
  projectId: string;
  filepath: string | null;
  url: string | null;
  filename: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
};

export function useProjectsList(enabled: boolean) {
  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load projects");
      }
      const data = await res.json();
      return (data.projects || []) as ApiProject[];
    },
    enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useProjectDetail(projectId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load project");
      }
      return res.json() as Promise<{
        project: ApiProject;
        files: ApiProjectFile[];
        linkedChatsCount: number;
      }>;
    },
    enabled: enabled && !!projectId,
    staleTime: 1000 * 30,
  });
}

export function useInvalidateProjects() {
  const qc = useQueryClient();
  return {
    invalidateList: () => qc.invalidateQueries({ queryKey: projectsQueryKey }),
    invalidateProject: (id: string) =>
      qc.invalidateQueries({ queryKey: ["project", id] }),
    invalidateChatProject: (chatId: string) =>
      qc.invalidateQueries({ queryKey: ["chat-project", chatId] }),
  };
}
