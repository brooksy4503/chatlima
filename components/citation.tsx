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

  const handleToggle = () => setIsExpanded(!isExpanded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground/70",
          "hover:text-muted-foreground transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:rounded-sm"
        )}
        aria-expanded={isExpanded}
        aria-controls="citations-list"
        aria-label={`${isExpanded ? 'Hide' : 'Show'} ${citations.length} citation${citations.length > 1 ? 's' : ''}`}
      >
        {isExpanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
        <span>{citations.length} citation{citations.length > 1 ? 's' : ''}</span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="citations-list"
            className="mt-2 space-y-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            role="list"
            aria-label="Citation sources"
          >
            {citations.map((citation, index) => (
              <div
                key={index}
                className="text-sm border border-border/30 rounded-lg p-3 bg-muted/10"
                role="listitem"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:rounded-sm"
                    aria-label={`Citation ${index + 1}: ${citation.title}`}
                  >
                    {citation.title}
                    <ExternalLinkIcon size={12} className="inline flex-shrink-0" aria-hidden="true" />
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