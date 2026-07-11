"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/hooks/use-copy";
import { Button } from "./ui/button";

interface CopyButtonProps {
  text: string;
  className?: string;
  /** Icon-only control for thin action bars (always visible). */
  iconOnly?: boolean;
}

export function CopyButton({ text, className, iconOnly = false }: CopyButtonProps) {
  const { copied, copy } = useCopy();

  return (
    <Button
      variant="ghost"
      size={iconOnly ? "icon" : "sm"}
      className={cn(
        iconOnly
          ? "h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          : "transition-opacity opacity-0 group-hover/message:opacity-100 gap-1.5 sm:opacity-0 sm:group-hover/message:opacity-100 opacity-100",
        className
      )}
      onClick={() => copy(text)}
      title={copied ? "Copied" : "Copy to clipboard"}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
      {!iconOnly ? (
        <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
      ) : null}
    </Button>
  );
} 