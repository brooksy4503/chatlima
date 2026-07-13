"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GitBranch, MoreHorizontal, Pencil, RefreshCw } from "lucide-react";

type MessageActionsProps = {
  role: "user" | "assistant";
  disabled?: boolean;
  onRegenerate?: () => void;
  onEditResubmit?: (content: string) => void;
  onFork?: () => void;
  initialEditContent?: string;
};

export function MessageActions({
  role,
  disabled = false,
  onRegenerate,
  onEditResubmit,
  onFork,
  initialEditContent = "",
}: MessageActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(initialEditContent);

  const openEdit = () => {
    setEditContent(initialEditContent);
    setEditOpen(true);
  };

  const submitEdit = () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    onEditResubmit?.(trimmed);
    setEditOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-80"
            disabled={disabled}
            aria-label="Message actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {role === "assistant" && onRegenerate ? (
            <DropdownMenuItem onClick={onRegenerate} disabled={disabled}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </DropdownMenuItem>
          ) : null}
          {role === "user" && onEditResubmit ? (
            <DropdownMenuItem onClick={openEdit} disabled={disabled}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit & resubmit
            </DropdownMenuItem>
          ) : null}
          {onFork ? (
            <DropdownMenuItem onClick={onFork} disabled={disabled}>
              <GitBranch className="mr-2 h-4 w-4" />
              Fork to new chat
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {role === "user" && onEditResubmit ? (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit message</DialogTitle>
              <DialogDescription>
                This creates a new branch from this point. Later messages stay on the original branch.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              rows={6}
              className="resize-y"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={submitEdit} disabled={!editContent.trim()}>
                Save & send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
