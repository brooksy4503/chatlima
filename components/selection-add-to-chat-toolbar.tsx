"use client";

import { AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SelectionToolbarState } from "@/hooks/use-selection-add-to-chat";

interface SelectionAddToChatToolbarProps {
  toolbar: SelectionToolbarState;
  onAdd: (text: string) => void;
}

export function SelectionAddToChatToolbar({
  toolbar,
  onAdd,
}: SelectionAddToChatToolbarProps) {
  return (
    <div
      className="fixed z-50"
      style={{
        top: toolbar.top,
        left: toolbar.left,
      }}
    >
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-8 gap-1.5 rounded-lg border border-border bg-card px-2.5 shadow-md"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onAdd(toolbar.text)}
      >
        <AlignLeft className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Add to chat</span>
      </Button>
    </div>
  );
}
