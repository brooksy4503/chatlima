"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface Citation {
  url: string;
  title: string;
  content?: string;
  startIndex: number;
  endIndex: number;
}

interface CitationProps {
  citations: Citation[];
}

export function Citations({ citations }: CitationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations?.length) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground/70",
          "hover:text-muted-foreground transition-colors"
        )}
      >
        {isExpanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
        <span>{citations.length} citation{citations.length > 1 ? 's' : ''}</span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            className="mt-2 space-y-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {citations.map((citation, index) => (
              <div
                key={index}
                className="text-sm border border-border/30 rounded-lg p-3 bg-muted/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {citation.title}
                    <ExternalLinkIcon size={12} className="inline" />
                  </a>
                </div>
                {citation.content && (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3">
                    {citation.content}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 