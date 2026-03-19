"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, ExternalLink, FolderKanban } from "lucide-react";
import { useProjectDetail, useInvalidateProjects, type ApiProjectFile } from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When null, sheet is in “create project” mode */
  projectId: string | null;
};

export function ProjectDetailSheet({ open, onOpenChange, projectId }: Props) {
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

  const isCreateMode = open && !effectiveId;
  const title = isCreateMode ? "New project" : detailLoading ? "Project" : detail?.project.name || "Project";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
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

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
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
                    className="resize-y min-h-[120px]"
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

                {typeof detail.linkedChatsCount === "number" && (
                  <p className="text-sm text-muted-foreground">
                    <strong>{detail.linkedChatsCount}</strong> chat
                    {detail.linkedChatsCount === 1 ? "" : "s"} linked to this project.
                  </p>
                )}

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
                            "flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm"
                          )}
                        >
                          <span className="truncate flex-1 min-w-0" title={f.filename}>
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
