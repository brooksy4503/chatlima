"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, ExternalLink, FolderKanban, Link2, MessageSquarePlus } from "lucide-react";
import { useProjectDetail, useInvalidateProjects, type ApiProjectFile } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When null, sheet is in “create project” mode */
  projectId: string | null;
};

export function ProjectDetailSheet({ open, onOpenChange, projectId }: Props) {
  const router = useRouter();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const effectiveId = projectId ?? createdId;

  const { data: detail, isLoading: detailLoading, refetch } = useProjectDetail(
    effectiveId,
    open && !!effectiveId
  );

  const { invalidateList, invalidateProject } = useInvalidateProjects();

  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [linkingChatId, setLinkingChatId] = useState<string | null>(null);
  const [availableChats, setAvailableChats] = useState<Array<{ id: string; title: string }>>([]);
  const [loadingAvailableChats, setLoadingAvailableChats] = useState(false);

  useEffect(() => {
    if (!open) {
      setCreatedId(null);
      setName("");
      setInstructions("");
    }
  }, [open]);

  // Hydrate form when opening a project or after create — avoid depending on full `detail` to limit resets while typing
  useEffect(() => {
    const p = detail?.project;
    if (!open || !p) return;
    setName(p.name);
    setInstructions(p.instructions || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-hydrate when project id or sheet open changes
  }, [open, detail?.project?.id]);

  const files = detail?.files ?? [];
  const linkedChats = detail?.linkedChats ?? [];

  const linkedChatIds = useMemo(() => new Set(linkedChats.map((chat) => chat.id)), [linkedChats]);

  useEffect(() => {
    if (!open || !effectiveId) return;

    const controller = new AbortController();
    const loadChats = async () => {
      setLoadingAvailableChats(true);
      try {
        const res = await fetch('/api/chats?limit=200', { signal: controller.signal });
        const body = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(body.error || 'Failed to load chats');
        }

        const rows = Array.isArray(body) ? body : [];
        setAvailableChats(
          rows.map((chat: { id: string; title?: string }) => ({
            id: chat.id,
            title: chat.title?.trim() || 'Untitled chat',
          }))
        );
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error(error);
          toast.error('Failed to load chats for linking');
        }
      } finally {
        setLoadingAvailableChats(false);
      }
    };

    loadChats();

    return () => controller.abort();
  }, [open, effectiveId]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Project name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          instructions: instructions.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to create project");
      }
      setCreatedId(body.project.id);
      await invalidateList();
      toast.success("Project created. You can attach files below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!effectiveId) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Project name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${effectiveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          instructions: instructions.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to save");
      }
      await invalidateList();
      await invalidateProject(effectiveId);
      await refetch();
      toast.success("Project saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!effectiveId) return;
    if (!confirm("Delete this project? Linked chats will be unlinked from it.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${effectiveId}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to delete");
      }
      await invalidateList();
      toast.success("Project deleted");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!effectiveId) return;
    const list = e.target.files;
    if (!list?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < list.length; i++) {
        formData.append("files", list[i]);
      }
      const res = await fetch(`/api/projects/${effectiveId}/files`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Upload failed");
      }
      if (Array.isArray(body.errors) && body.errors.length > 0) {
        toast.message("Some files failed", { description: body.errors.join("\n") });
      } else {
        toast.success("Files uploaded");
      }
      await invalidateProject(effectiveId);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteFile = async (file: ApiProjectFile) => {
    if (!effectiveId) return;
    setDeletingFileId(file.id);
    try {
      const res = await fetch(`/api/projects/${effectiveId}/files/${file.id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to remove file");
      }
      await invalidateProject(effectiveId);
      await refetch();
      toast.success("File removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove file");
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleCreateChatInProject = async () => {
    if (!effectiveId) return;
    setCreatingChat(true);

    try {
      const res = await fetch(`/api/projects/${effectiveId}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || 'Failed to create chat in project');
      }

      await invalidateList();
      await invalidateProject(effectiveId);
      toast.success('New chat created in project');
      onOpenChange(false);
      router.push(`/chat/${body.chat.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create chat in project');
    } finally {
      setCreatingChat(false);
    }
  };

  const handleLinkExistingChat = async (chatId: string) => {
    if (!effectiveId || !chatId) return;

    setLinkingChatId(chatId);
    try {
      const res = await fetch(`/api/chats/${chatId}/project`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: effectiveId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || 'Failed to link existing chat');
      }

      await invalidateList();
      await invalidateProject(effectiveId);
      await refetch();
      toast.success('Existing chat linked to project');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to link existing chat');
    } finally {
      setLinkingChatId(null);
    }
  };

  const unlinkedChats = useMemo(
    () => availableChats.filter((chat) => !linkedChatIds.has(chat.id)),
    [availableChats, linkedChatIds]
  );

  const isCreateMode = open && !effectiveId;
  const title = isCreateMode ? "New project" : detailLoading ? "Project" : detail?.project.name || "Project";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full min-w-0 sm:max-w-lg flex flex-col p-0 gap-0 overflow-x-hidden"
      >
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0 text-left">
          <SheetTitle className="flex items-center gap-2 pr-8">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
            <span className="truncate">{title}</span>
          </SheetTitle>
          <SheetDescription>
            Instructions and files are added to the model context when a chat is linked to this project.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 min-w-0 flex-1">
          <div className="min-w-0 max-w-full p-6 space-y-6">
            {isCreateMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="project-name">Name</Label>
                  <Input
                    id="project-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Website redesign"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-instructions">Instructions</Label>
                  <Textarea
                    id="project-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Goals, tone, constraints…"
                    rows={8}
                    maxLength={8000}
                    className="resize-y min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    {instructions.length}/8000 characters
                  </p>
                </div>
                <Button onClick={handleCreate} disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create project"
                  )}
                </Button>
              </>
            ) : detailLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : detail?.project ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-name">Name</Label>
                  <Input
                    id="edit-project-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-instructions">Instructions</Label>
                  <Textarea
                    id="edit-project-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={8}
                    maxLength={8000}
                    className="resize-y min-h-[120px] w-full max-w-full min-w-0 overflow-x-hidden break-words [overflow-wrap:anywhere]"
                  />
                  <p className="text-xs text-muted-foreground">
                    {instructions.length}/8000 characters
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSave} disabled={saving} variant="default">
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteProject}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Delete project"
                    )}
                  </Button>
                </div>

                <div className="space-y-4 border-t border-border pt-6">
                  {typeof detail.linkedChatsCount === "number" && (
                    <p className="text-sm text-muted-foreground">
                      <strong>{detail.linkedChatsCount}</strong> chat
                      {detail.linkedChatsCount === 1 ? "" : "s"} linked to this project.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCreateChatInProject} disabled={creatingChat}>
                      {creatingChat ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <MessageSquarePlus className="h-4 w-4 mr-2" />
                          New Chat in Project
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Linked chats</p>
                    {linkedChats.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No chats linked yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {linkedChats.map((chat) => (
                          <li key={chat.id} className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-sm">
                            <span className="min-w-0 flex-1 truncate" title={chat.title}>{chat.title}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onOpenChange(false);
                                router.push(`/chat/${chat.id}`);
                              }}
                            >
                              Open
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Link Existing Chat</p>
                    {loadingAvailableChats ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading chats…
                      </div>
                    ) : unlinkedChats.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No unlinked chats available.</p>
                    ) : (
                      <div className="space-y-2">
                        {unlinkedChats.slice(0, 8).map((chat) => (
                          <div key={chat.id} className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-sm">
                            <span className="min-w-0 flex-1 truncate" title={chat.title}>{chat.title}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleLinkExistingChat(chat.id)}
                              disabled={linkingChatId === chat.id}
                            >
                              {linkingChatId === chat.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Link2 className="h-4 w-4 mr-1" />
                                  Link
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Files</Label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        className="absolute inset-0 cursor-pointer opacity-0 w-full h-full disabled:cursor-not-allowed"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      <Button type="button" variant="outline" size="sm" disabled={uploading}>
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {files.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No files yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {files.map((f) => (
                        <li
                          key={f.id}
                          className={cn(
                            "flex min-w-0 items-center gap-2 overflow-hidden rounded-md border border-border/60 px-3 py-2 text-sm"
                          )}
                        >
                          <span className="block min-w-0 max-w-full flex-1 truncate" title={f.filename}>
                            {f.filename}
                          </span>
                          {f.url && (
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground shrink-0"
                              aria-label={`Open ${f.filename}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFile(f)}
                            disabled={deletingFileId === f.id}
                            aria-label={`Remove ${f.filename}`}
                          >
                            {deletingFileId === f.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Project could not be loaded.</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
