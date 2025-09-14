"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebSearchCitation } from "@/lib/types";

interface CitationsProps {
  citations: WebSearchCitation[];
  className?: string;
  source?: 'openrouter' | 'openai' | 'perplexity';
}

export function Citations({ citations, className, source }: CitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) {
    return null;
  }

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'openrouter':
        return 'OpenRouter';
      case 'openai':
        return 'OpenAI';
      case 'perplexity':
        return 'Perplexity';
      default:
        return 'Web Search';
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'openrouter':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50';
      case 'openai':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/50';
      case 'perplexity':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/50 dark:text-slate-300 dark:border-slate-800/50';
    }
  };

  // Scira-style: Show first few citations inline, rest collapsed
  const maxInlineCitations = 3;
  const inlineCitations = citations.slice(0, maxInlineCitations);
  const collapsedCitations = citations.slice(maxInlineCitations);

  return (
    <div className={cn("mt-3 space-y-3", className)}>
      {/* Always visible citations (Scira-style) */}
      <div className="flex flex-wrap gap-2">
        {inlineCitations.map((citation, index) => (
          <motion.a
            key={`${citation.url}-${index}`}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
              "text-xs font-medium transition-all duration-200",
              "hover:scale-105 hover:shadow-sm",
              getSourceColor(source),
              "cursor-pointer group"
            )}
            title={citation.title}
          >
            <span className="citation-number w-4 h-4 rounded-full bg-current/10 text-current flex items-center justify-center text-[10px] font-bold">
              {index + 1}
            </span>
            <span className="truncate max-w-[120px]">
              {new URL(citation.url).hostname.replace('www.', '')}
            </span>
            <ExternalLinkIcon className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
          </motion.a>
        ))}
        
        {/* Show more button if there are additional citations */}
        {collapsedCitations.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-full border",
              "text-xs font-medium transition-all duration-200",
              "bg-muted/30 hover:bg-muted/50 border-border/50 hover:border-border/70",
              "text-muted-foreground hover:text-foreground",
              "cursor-pointer group"
            )}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Hide' : 'Show'} ${collapsedCitations.length} more citation${collapsedCitations.length !== 1 ? 's' : ''}`}
          >
            <span>+{collapsedCitations.length} more</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="h-3 w-3" />
            </motion.div>
          </button>
        )}
      </div>

      {/* Expanded citations list */}
      <AnimatePresence>
        {isExpanded && collapsedCitations.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2 border-t border-border/30">
              {collapsedCitations.map((citation, index) => {
                const globalIndex = maxInlineCitations + index;
                return (
                  <motion.div
                    key={`${citation.url}-${globalIndex}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group/citation"
                  >
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
                        "bg-background hover:bg-muted/30 border-border/30 hover:border-border/50",
                        "text-sm hover:shadow-sm",
                        "cursor-pointer"
                      )}
                      aria-label={`Open citation ${globalIndex + 1}: ${citation.title}`}
                    >
                      {/* Citation number */}
                      <div className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                        "text-xs font-bold citation-number",
                        "bg-muted text-muted-foreground",
                        "group-hover/citation:scale-110 transition-transform duration-200"
                      )}>
                        {globalIndex + 1}
                      </div>

                      {/* Citation content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm leading-tight line-clamp-2 text-foreground">
                            {citation.title}
                          </h4>
                          <ExternalLinkIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground opacity-0 group-hover/citation:opacity-100 transition-opacity" />
                        </div>
                        {citation.content && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {citation.content}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground/80">
                          {new URL(citation.url).hostname.replace('www.', '')}
                        </div>
                      </div>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual citation component for inline citations
interface CitationLinkProps {
  citation: WebSearchCitation;
  index: number;
  className?: string;
}

export function CitationLink({ citation, index, className }: CitationLinkProps) {
  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "citation-number inline-block",
        "hover:scale-110 transition-transform duration-200",
        className
      )}
      aria-label={`Citation ${index + 1}: ${citation.title}`}
      title={citation.title}
    >
      [{index + 1}]
    </a>
  );
}
