"use client";

import { useState, useEffect } from "react";
import { X, Lightbulb, Globe } from "lucide-react";
import { useWebSearch } from "@/lib/context/web-search-context";
import { WEB_SEARCH_COST } from "@/lib/tokenCounter";
import { motion, AnimatePresence } from "framer-motion";
import { useClientMount } from "@/lib/hooks/use-client-mount";

interface WebSearchSuggestionProps {
  messageId: string;
  hasWebSearchResults?: boolean;
}

export function WebSearchSuggestion({ messageId, hasWebSearchResults }: WebSearchSuggestionProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const isMounted = useClientMount();
  const { webSearchEnabled, setWebSearchEnabled } = useWebSearch();

  // Show suggestion only if:
  // 1. Web search is currently enabled
  // 2. Message has web search results (indicates this was a web search response)
  // 3. User hasn't dismissed it
  useEffect(() => {
    if (webSearchEnabled && hasWebSearchResults && !dismissed) {
      setShowSuggestion(true);
    } else {
      setShowSuggestion(false);
    }
  }, [webSearchEnabled, hasWebSearchResults, dismissed, messageId]);

  // Reset dismissed state when web search is toggled back on
  useEffect(() => {
    if (!webSearchEnabled) {
      setDismissed(false);
    }
  }, [webSearchEnabled]);

  const handleDisableWebSearch = () => {
    setWebSearchEnabled(false);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!isMounted || !showSuggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={`suggestion-${messageId}`}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="mt-3 p-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/40 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="p-1 bg-blue-100 dark:bg-blue-800/40 rounded-full">
              <Lightbulb className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
              Save credits on follow-up questions
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-200 mb-3 leading-relaxed">
              Follow-up questions about these results don&apos;t need web search. 
              Disable it to save {WEB_SEARCH_COST} credits per message.
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDisableWebSearch}
                className="inline-flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-full transition-colors duration-150 font-medium"
              >
                <Globe className="h-3 w-3" />
                Disable Web Search
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-150"
              >
                Keep enabled
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150"
            aria-label="Dismiss suggestion"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 