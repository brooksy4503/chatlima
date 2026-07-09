"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

const MIN_SELECTION_LENGTH = 1;

function isEditableElement(node: Node | null): boolean {
  if (!node || !(node instanceof Element)) {
    return false;
  }
  const editable = node.closest("textarea, input, [contenteditable='true']");
  return Boolean(editable);
}

function getSelectionTextInContainer(container: HTMLElement): string | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const text = selection.toString().trim();

  if (text.length < MIN_SELECTION_LENGTH) {
    return null;
  }

  if (!container.contains(range.commonAncestorContainer)) {
    return null;
  }

  if (isEditableElement(range.commonAncestorContainer)) {
    return null;
  }

  return text;
}

export interface SelectionToolbarState {
  text: string;
  top: number;
  left: number;
}

export function useSelectionAddToChat(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true
) {
  const [toolbar, setToolbar] = useState<SelectionToolbarState | null>(null);
  const toolbarRef = useRef<SelectionToolbarState | null>(null);

  const clearToolbar = useCallback(() => {
    toolbarRef.current = null;
    setToolbar(null);
  }, []);

  const updateToolbar = useCallback(() => {
    if (!enabled) {
      clearToolbar();
      return;
    }

    const container = containerRef.current;
    if (!container) {
      clearToolbar();
      return;
    }

    const text = getSelectionTextInContainer(container);
    if (!text) {
      clearToolbar();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      clearToolbar();
      return;
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const next: SelectionToolbarState = {
      text,
      top: Math.max(8, rect.top - 40),
      left: Math.max(8, rect.left),
    };

    toolbarRef.current = next;
    setToolbar(next);
  }, [clearToolbar, containerRef, enabled]);

  useEffect(() => {
    if (!enabled) {
      clearToolbar();
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleMouseUp = () => {
      requestAnimationFrame(updateToolbar);
    };

    const handleSelectionChange = () => {
      requestAnimationFrame(updateToolbar);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearToolbar();
        window.getSelection()?.removeAllRanges();
      }
    };

    const handleScroll = () => {
      clearToolbar();
    };

    container.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("keydown", handleKeyDown);
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [clearToolbar, containerRef, enabled, updateToolbar]);

  const handleAddToChat = useCallback(
    (onAddToChat: (text: string) => void) => {
      if (!toolbarRef.current) {
        return;
      }

      onAddToChat(toolbarRef.current.text);
      window.getSelection()?.removeAllRanges();
      clearToolbar();
    },
    [clearToolbar]
  );

  return {
    toolbar,
    clearToolbar,
    handleAddToChat,
  };
}
