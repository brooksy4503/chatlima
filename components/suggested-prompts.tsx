"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { memo, useCallback, useState, useMemo } from "react";
import { 
  Code, 
  MessageCircle, 
  Lightbulb, 
  Search, 
  BookOpen, 
  Zap,
  Brain,
  Globe,
  Sparkles,
  FileText,
  Filter,
  X
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { getContextualSuggestions, getCategoryColor } from "@/lib/suggested-prompts-utils";

export interface SuggestedAction {
  title: string;
  label: string;
  action: string;
  category?: string;
  icon?: React.ReactNode;
}

interface SuggestedPromptsProps {
  sendMessage: (input: string) => void;
  suggestions?: SuggestedAction[];
  maxSuggestions?: number;
  showCategories?: boolean;
  selectedModel?: string;
}

const defaultSuggestions: SuggestedAction[] = [
  {
    title: "Explain this code",
    label: "and suggest improvements",
    action: "Can you explain this code and suggest any improvements?",
    category: "coding",
    icon: <Code className="h-4 w-4" />,
  },
  {
    title: "Write a function",
    label: "to solve a specific problem",
    action: "Write a function that handles user authentication with error handling",
    category: "coding",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    title: "Brainstorm ideas",
    label: "for a new project",
    action: "Help me brainstorm ideas for a productivity app that uses AI",
    category: "creative",
    icon: <Lightbulb className="h-4 w-4" />,
  },
  {
    title: "Research and summarize",
    label: "latest tech trends",  
    action: "Research and summarize the latest trends in web development for 2024",
    category: "research",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    title: "Create a learning plan",
    label: "for a new technology",
    action: "Create a comprehensive learning plan for mastering React and TypeScript",
    category: "learning",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Analyze and debug",
    label: "this error message",
    action: "Help me analyze and debug this error: 'Cannot read property of undefined'",
    category: "debugging",
    icon: <Search className="h-4 w-4" />,
  },
  {
    title: "Write documentation",
    label: "for this API",
    action: "Write comprehensive documentation for a REST API with authentication",
    category: "documentation",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Optimize performance",
    label: "of my application",
    action: "What are the best practices to optimize React application performance?",
    category: "optimization",
    icon: <Sparkles className="h-4 w-4" />,
  },
];

function PureSuggestedPrompts({
  sendMessage,
  suggestions,
  maxSuggestions = 4,
  showCategories = true,
  selectedModel
}: SuggestedPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMore, setShowMore] = useState(false);

  // Get contextual suggestions based on the selected model
  const contextualSuggestions = useMemo(() => {
    if (suggestions) return suggestions;
    return selectedModel ? getContextualSuggestions(selectedModel) : defaultSuggestions;
  }, [suggestions, selectedModel]);

  const handleSuggestionClick = useCallback(async (action: string) => {
    setIsAnimating(true);
    sendMessage(action);
    setTimeout(() => setIsAnimating(false), 300);
  }, [sendMessage]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>, action: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      sendMessage(action);
    }
  }, [sendMessage]);

  // Get unique categories
  const categories = Array.from(new Set(contextualSuggestions.map(s => s.category).filter(Boolean)));
  
  // Filter suggestions by search query and selected category
  const filteredSuggestions = useMemo(() => {
    let filtered = contextualSuggestions;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(suggestion => 
        suggestion.title.toLowerCase().includes(query) ||
        suggestion.label.toLowerCase().includes(query) ||
        suggestion.action.toLowerCase().includes(query) ||
        (suggestion.category && suggestion.category.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    return filtered;
  }, [contextualSuggestions, searchQuery, selectedCategory]);
  
  // Limit the number of suggestions based on showMore state
  const displayLimit = showMore ? Math.min(filteredSuggestions.length, maxSuggestions * 2) : maxSuggestions;
  const limitedSuggestions = filteredSuggestions.slice(0, displayLimit);
  const hasMoreSuggestions = filteredSuggestions.length > maxSuggestions;

  return (
    <div className="w-full space-y-3">
      {/* Search input */}
      <div className="relative max-w-sm mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search suggestions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filters */}
      {showCategories && categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs h-7 px-3"
          >
            <Filter className="h-3 w-3 mr-1" />
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category || null)}
              className="text-xs capitalize h-7 px-3"
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Suggestions grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory || 'all'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          data-testid="suggested-actions"
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full"
          role="group"
          aria-label="Suggested prompts"
        >
          {limitedSuggestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full text-center py-6 text-muted-foreground"
            >
              <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions found matching your criteria.</p>
              <p className="text-xs mt-1">
                Try adjusting your search or selecting a different category.
              </p>
            </motion.div>
          ) : (
            limitedSuggestions.map((suggestedAction, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ 
                delay: 0.05 * index,
                duration: 0.3,
                type: "spring",
                stiffness: 100
              }}
              key={`suggested-action-${suggestedAction.title}-${index}`}
              className="group relative"
            >
              <Button
                variant="ghost"
                onClick={() => handleSuggestionClick(suggestedAction.action)}
                onKeyDown={(event) => handleKeyDown(event, suggestedAction.action)}
                aria-label={`Send message: ${suggestedAction.action}`}
                disabled={isAnimating}
                className="text-left border rounded-xl px-3 py-3 text-sm w-full h-auto justify-start items-start hover:shadow-md transition-all duration-200 group-hover:scale-[1.02] bg-background/50 backdrop-blur-sm relative overflow-hidden"
                role="button"
                tabIndex={0}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                
                <div className="relative z-10 flex flex-col gap-1.5 w-full">
                  {/* Header with icon and category */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {suggestedAction.icon && (
                        <div className="text-primary/70 group-hover:text-primary transition-colors">
                          {suggestedAction.icon}
                        </div>
                      )}
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                        {suggestedAction.title}
                      </span>
                    </div>
                    {suggestedAction.category && showCategories && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1.5 py-0.5 ${getCategoryColor(suggestedAction.category)}`}
                      >
                        {suggestedAction.category}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Description */}
                  <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors text-xs leading-relaxed">
                    {suggestedAction.label}
                  </span>
                </div>
              </Button>
            </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Show More button */}
      {hasMoreSuggestions && !searchQuery.trim() && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMore(!showMore)}
            className="text-xs px-4 py-2"
          >
            {showMore ? "Show Less" : `Show More (${filteredSuggestions.length - maxSuggestions} more)`}
          </Button>
        </div>
      )}

      {/* Model context hint */}
      {selectedModel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground"
        >
          <Brain className="h-3 w-3 inline mr-1" />
          Suggestions optimized for {selectedModel}
        </motion.div>
      )}
    </div>
  );
}

// Custom comparison function for memoization  
const arePropsEqual = (prevProps: SuggestedPromptsProps, nextProps: SuggestedPromptsProps) => {
  return (
    prevProps.sendMessage === nextProps.sendMessage &&
    prevProps.suggestions === nextProps.suggestions &&
    prevProps.maxSuggestions === nextProps.maxSuggestions &&
    prevProps.showCategories === nextProps.showCategories &&
    prevProps.selectedModel === nextProps.selectedModel
  );
};

export const SuggestedPrompts = memo(PureSuggestedPrompts, arePropsEqual);
