"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { memo, useCallback, useState, useMemo, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  X,
  Edit3,
  Send,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { getContextualSuggestions, getCategoryColor } from "@/lib/suggested-prompts-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";

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



// Template configuration for different template types
const TEMPLATE_CONFIGS = {
  'explain-concept': {
    title: 'What concept would you like me to explain?',
    description: 'I\'ll explain it in simple terms using everyday analogies.',
    placeholder: 'e.g., blockchain, quantum physics, machine learning...',
    template: (input: string) => `Explain ${input} in simple terms, using everyday analogies that anyone can understand`,
    multiline: false,
  },
  'debug-code': {
    title: 'What code would you like me to debug?',
    description: 'Paste your code and I\'ll help identify and fix any issues.',
    placeholder: 'Paste your code here...',
    template: (input: string) => `I'm having an issue with this code. Can you debug it and explain what's wrong?\n\n\`\`\`\n${input}\n\`\`\``,
    multiline: true,
  },
  'summarize-text': {
    title: 'What text would you like me to summarize?',
    description: 'I\'ll create a clear, concise summary of the key points.',
    placeholder: 'Paste the text you want summarized...',
    template: (input: string) => `Please summarize this text and highlight the key points:\n\n${input}`,
    multiline: true,
  },
  'learn-technology': {
    title: 'What technology would you like to learn?',
    description: 'I\'ll create a structured learning roadmap with resources and milestones.',
    placeholder: 'e.g., React, Python, Docker, GraphQL...',
    template: (input: string) => `Create a comprehensive learning roadmap for mastering ${input}, including key concepts, resources, and practical projects`,
    multiline: false,
  },
  'review-document': {
    title: 'What document would you like me to review?',
    description: 'I\'ll review it for clarity, structure, and suggest improvements.',
    placeholder: 'Paste your document here...',
    template: (input: string) => `Please review this document and suggest improvements for clarity, structure, and effectiveness:\n\n${input}`,
    multiline: true,
  },
  'write-email': {
    title: 'What kind of email do you need help writing?',
    description: 'I\'ll help you write a professional and clear email.',
    placeholder: 'e.g., request a meeting, follow up on interview, ask for feedback...',
    template: (input: string) => `Help me write a professional email to ${input}`,
    multiline: false,
  },
  'write-story': {
    title: 'What kind of story would you like me to write?',
    description: 'I\'ll create an engaging story with interesting characters and plot.',
    placeholder: 'e.g., sci-fi adventure on Mars, mystery in a small town, romance at a coffee shop...',
    template: (input: string) => `Help me write a short story about ${input}`,
    multiline: false,
  },
  'make-decision': {
    title: 'What decision do you need help making?',
    description: 'I\'ll help you weigh the pros and cons and ask clarifying questions.',
    placeholder: 'e.g., accept a job offer, choose between two apartments, pick a college major...',
    template: (input: string) => `Help me decide whether to ${input} by listing pros and cons and asking clarifying questions`,
    multiline: false,
  },
  'brainstorm-ideas': {
    title: 'What do you need ideas for?',
    description: 'I\'ll help you brainstorm creative and practical solutions.',
    placeholder: 'e.g., business name, party theme, weekend activities, project features...',
    template: (input: string) => `Help me brainstorm creative ideas for ${input}`,
    multiline: false,
  },
  'code-review': {
    title: 'What code would you like me to review?',
    description: 'I\'ll review your code and suggest improvements following best practices.',
    placeholder: 'Paste your code here...',
    template: (input: string) => `Please review this code and suggest improvements following best practices:\n\n\`\`\`\n${input}\n\`\`\``,
    multiline: true,
  },
  'analyze-problem': {
    title: 'What problem would you like me to analyze?',
    description: 'I\'ll break it down step by step and provide a detailed analysis.',
    placeholder: 'Describe the problem you\'re facing...',
    template: (input: string) => `Break down this problem step by step and provide a detailed analysis: ${input}`,
    multiline: true,
  },
  'write-content': {
    title: 'What kind of content do you need?',
    description: 'I\'ll help you create engaging and creative content.',
    placeholder: 'e.g., blog post about AI, product description, social media caption...',
    template: (input: string) => `Help me write engaging and creative content for ${input}`,
    multiline: false,
  },
  'optimize-algorithm': {
    title: 'What algorithm would you like me to optimize?',
    description: 'I\'ll analyze it and suggest optimizations for better performance.',
    placeholder: 'Paste your algorithm or code here...',
    template: (input: string) => `Analyze this algorithm and suggest optimizations for better time/space complexity:\n\n\`\`\`\n${input}\n\`\`\``,
    multiline: true,
  },
  'refactor-code': {
    title: 'What code would you like me to refactor?',
    description: 'I\'ll refactor it following clean architecture principles and design patterns.',
    placeholder: 'Paste your code here...',
    template: (input: string) => `Refactor this code following clean architecture principles and design patterns:\n\n\`\`\`\n${input}\n\`\`\``,
    multiline: true,
  },
  'research-topic': {
    title: 'What topic would you like me to research?',
    description: 'I\'ll research it from multiple angles and synthesize the information.',
    placeholder: 'e.g., climate change impacts, AI ethics, renewable energy trends...',
    template: (input: string) => `Research ${input} from multiple angles and synthesize the information into a comprehensive overview`,
    multiline: false,
  },
  'create-documentation': {
    title: 'What would you like me to document?',
    description: 'I\'ll create comprehensive documentation with usage examples.',
    placeholder: 'Paste your code, API, or describe what needs documentation...',
    template: (input: string) => `Create comprehensive documentation for this with usage examples:\n\n${input}`,
    multiline: true,
  },
  'generate-tests': {
    title: 'What function or component needs test cases?',
    description: 'I\'ll generate comprehensive test cases including edge cases.',
    placeholder: 'Paste your function/component code here...',
    template: (input: string) => `Generate comprehensive test cases for this function/component including edge cases:\n\n\`\`\`\n${input}\n\`\`\``,
    multiline: true,
  },
  'multimodal-analysis': {
    title: 'What content would you like me to analyze?',
    description: 'I\'ll analyze it across multiple formats and provide insights.',
    placeholder: 'Describe the text, images, data, or other content to analyze...',
    template: (input: string) => `Analyze this content across multiple formats and provide insights: ${input}`,
    multiline: true,
  },
  'brainstorm-solutions': {
    title: 'What challenge do you need solutions for?',
    description: 'I\'ll help you brainstorm creative solutions to overcome it.',
    placeholder: 'e.g., low team productivity, marketing strategy, technical architecture...',
    template: (input: string) => `Help me brainstorm creative solutions to overcome this challenge: ${input}`,
    multiline: false,
  },
  'plan-schedule': {
    title: 'What would you like help planning?',
    description: 'I\'ll create a balanced and realistic schedule or plan.',
    placeholder: 'e.g., my weekly routine, study schedule, project timeline, workout plan...',
    template: (input: string) => `Help me create a balanced and realistic plan for ${input}`,
    multiline: false,
  },
  'write-cover-letter': {
    title: 'What position are you applying for?',
    description: 'I\'ll help you write a compelling cover letter.',
    placeholder: 'e.g., Marketing Manager at Tech Corp, highlighting creativity and analytics...',
    template: (input: string) => `Help me write a compelling cover letter for ${input}`,
    multiline: false,
  },
  'write-social-post': {
    title: 'What kind of social media post do you need?',
    description: 'I\'ll help you create engaging and authentic content.',
    placeholder: 'e.g., LinkedIn post about career growth, Twitter thread about AI...',
    template: (input: string) => `Help me write an engaging social media post about ${input}`,
    multiline: false,
  },
  'prepare-interview': {
    title: 'What position are you interviewing for?',
    description: 'I\'ll help you prepare with practice questions and tips.',
    placeholder: 'e.g., Software Developer at startup, Marketing Manager at Fortune 500...',
    template: (input: string) => `Help me prepare for a job interview for ${input} by creating practice questions and tips`,
    multiline: false,
  },
  'create-workout-plan': {
    title: 'What are your fitness goals?',
    description: 'I\'ll design a personalized workout plan to help you achieve them.',
    placeholder: 'e.g., lose weight, build muscle, improve endurance, yoga routine...',
    template: (input: string) => `Create a detailed workout plan to help me ${input}, including exercises, sets, reps, and weekly schedule`,
    multiline: false,
  },
  'suggest-date-ideas': {
    title: 'What kind of date are you planning?',
    description: 'I\'ll suggest creative and memorable date ideas.',
    placeholder: 'e.g., first date, anniversary, budget-friendly, adventurous...',
    template: (input: string) => `Suggest creative and memorable date ideas for ${input}`,
    multiline: false,
  },
  'book-recommendations': {
    title: 'What genres or topics interest you?',
    description: 'I\'ll recommend books across different genres and topics.',
    placeholder: 'e.g., sci-fi, mystery, self-help, history, fantasy...',
    template: (input: string) => `Recommend a diverse list of must-read books in ${input} with brief descriptions of why each is worth reading`,
    multiline: false,
  },
  'reduce-carbon-footprint': {
    title: 'What area of your life do you want to make more eco-friendly?',
    description: 'I\'ll suggest practical ways to reduce your environmental impact.',
    placeholder: 'e.g., home energy use, transportation, diet, shopping habits...',
    template: (input: string) => `Give me practical and actionable tips to reduce my carbon footprint in ${input}`,
    multiline: false,
  },
  'create-recipe': {
    title: 'What ingredients do you have or what dish do you want?',
    description: 'I\'ll create a delicious recipe with detailed instructions.',
    placeholder: 'e.g., chicken breast and vegetables, healthy breakfast, vegan dessert...',
    template: (input: string) => `Create a delicious recipe using ${input} with detailed cooking instructions and tips`,
    multiline: false,
  },
  'improve-public-speaking': {
    title: 'What aspect of public speaking do you want to improve?',
    description: 'I\'ll provide strategies and exercises to boost your confidence.',
    placeholder: 'e.g., managing nerves, engaging audience, storytelling, body language...',
    template: (input: string) => `Help me improve my public speaking skills, specifically ${input}, with practical exercises and strategies`,
    multiline: false,
  },
  'save-money-tips': {
    title: 'What area of spending do you want to optimize?',
    description: 'I\'ll suggest strategies to help you save money effectively.',
    placeholder: 'e.g., groceries, utilities, entertainment, travel, monthly expenses...',
    template: (input: string) => `Give me practical money-saving strategies for ${input} that I can implement immediately`,
    multiline: false,
  },
  'learn-language': {
    title: 'What language do you want to learn?',
    description: 'I\'ll provide effective techniques and a structured approach.',
    placeholder: 'e.g., Spanish, French, Mandarin, Japanese, German...',
    template: (input: string) => `Create a comprehensive guide for learning ${input}, including effective study techniques, resources, and milestones`,
    multiline: false,
  },
  'travel-itinerary': {
    title: 'Where do you want to travel and for how long?',
    description: 'I\'ll create a detailed travel itinerary with activities and tips.',
    placeholder: 'e.g., Japan for 2 weeks, weekend in Paris, backpacking Europe...',
    template: (input: string) => `Create a detailed travel itinerary for ${input}, including must-see attractions, local experiences, and practical tips`,
    multiline: false,
  },
  'manage-stress': {
    title: 'What situations or areas cause you stress?',
    description: 'I\'ll provide techniques for managing stress and anxiety.',
    placeholder: 'e.g., work pressure, social situations, financial worries, daily life...',
    template: (input: string) => `Give me effective techniques for managing stress and anxiety related to ${input}`,
    multiline: false,
  },
  'team-building': {
    title: 'What kind of team building activity do you need?',
    description: 'I\'ll suggest engaging activities to strengthen team bonds.',
    placeholder: 'e.g., virtual team, office meeting, outdoor event, creative workshop...',
    template: (input: string) => `Suggest effective team-building activities for ${input} that will improve collaboration and morale`,
    multiline: false,
  },
  'hobby-suggestions': {
    title: 'What type of hobby interests you?',
    description: 'I\'ll suggest interesting hobbies you might enjoy trying.',
    placeholder: 'e.g., creative, outdoor, intellectual, social, crafts, sports...',
    template: (input: string) => `Suggest interesting ${input} hobbies I could try, with information about getting started and what to expect`,
    multiline: false,
  },
  'make-adult-friends': {
    title: 'What\'s your situation for meeting new people?',
    description: 'I\'ll provide tips for making meaningful connections as an adult.',
    placeholder: 'e.g., new city, remote work, shy personality, specific interests...',
    template: (input: string) => `Give me practical tips for making friends as an adult in my situation: ${input}`,
    multiline: false,
  },
  'improve-memory': {
    title: 'What do you want to remember better?',
    description: 'I\'ll teach you techniques to enhance memory and recall.',
    placeholder: 'e.g., names and faces, study material, daily tasks, languages...',
    template: (input: string) => `Teach me effective techniques to improve my memory and recall abilities for ${input}`,
    multiline: false,
  },
  'meditation-guide': {
    title: 'What\'s your experience level with meditation?',
    description: 'I\'ll create a personalized meditation practice guide.',
    placeholder: 'e.g., complete beginner, some experience, specific technique like mindfulness...',
    template: (input: string) => `Create a meditation practice guide for ${input}, including techniques, schedules, and tips for success`,
    multiline: false,
  },
  'historical-facts': {
    title: 'What historical period or topic interests you?',
    description: 'I\'ll share fascinating historical facts and stories.',
    placeholder: 'e.g., ancient Rome, World War II, Renaissance, specific country...',
    template: (input: string) => `Share fascinating and lesser-known historical facts about ${input} that would surprise most people`,
    multiline: false,
  },
  'space-facts': {
    title: 'What aspect of space and the universe interests you?',
    description: 'I\'ll share amazing facts about outer space and astronomy.',
    placeholder: 'e.g., black holes, planets, space exploration, stars, galaxies...',
    template: (input: string) => `Share mind-blowing facts about ${input} and explain them in an engaging way`,
    multiline: false,
  },
  'unsolved-mysteries': {
    title: 'What type of mysteries fascinate you?',
    description: 'I\'ll tell you about intriguing unsolved mysteries.',
    placeholder: 'e.g., historical, scientific, criminal, archaeological, paranormal...',
    template: (input: string) => `Tell me about fascinating ${input} unsolved mysteries that continue to puzzle experts today`,
    multiline: false,
  },
  'philosophical-discussion': {
    title: 'What philosophical topic interests you?',
    description: 'I\'ll explain philosophical concepts and encourage thoughtful discussion.',
    placeholder: 'e.g., meaning of life, free will, ethics, consciousness, reality...',
    template: (input: string) => `Explain the philosophical concept of ${input} and engage me in a thoughtful discussion about it`,
    multiline: false,
  },
  'cultural-awareness': {
    title: 'What culture or cultural aspect would you like to learn about?',
    description: 'I\'ll help you become more culturally aware and respectful.',
    placeholder: 'e.g., Japanese business culture, Middle Eastern traditions, Latin American customs...',
    template: (input: string) => `Help me understand ${input} and how to be more culturally aware and respectful in my interactions`,
    multiline: false,
  },
  'home-organization': {
    title: 'What area of your home needs organizing?',
    description: 'I\'ll provide practical tips for creating an organized living space.',
    placeholder: 'e.g., bedroom closet, kitchen pantry, home office, garage...',
    template: (input: string) => `Give me practical tips and strategies for organizing my ${input} and keeping it clutter-free`,
    multiline: false,
  },
  'science-experiments': {
    title: 'What type of science experiments interest you?',
    description: 'I\'ll suggest safe and interesting experiments you can do at home.',
    placeholder: 'e.g., chemistry, physics, biology, for kids, kitchen science...',
    template: (input: string) => `Suggest interesting and safe ${input} experiments I can do at home with common materials`,
    multiline: false,
  },
  'boost-confidence': {
    title: 'What situation makes you feel less confident?',
    description: 'I\'ll provide techniques to boost your self-esteem and confidence.',
    placeholder: 'e.g., social situations, work presentations, dating, public speaking...',
    template: (input: string) => `Give me effective techniques to boost my self-esteem and confidence when dealing with ${input}`,
    multiline: false,
  },
  'board-game-suggestions': {
    title: 'What type of board game experience are you looking for?',
    description: 'I\'ll recommend engaging board games for different occasions.',
    placeholder: 'e.g., family night, strategy games, party games, two-player games...',
    template: (input: string) => `Recommend engaging board games perfect for ${input}, with brief descriptions of gameplay`,
    multiline: false,
  },
} as const;

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<keyof typeof TEMPLATE_CONFIGS | null>(null);
  const [templateInput, setTemplateInput] = useState("");

  // Scroll functions
  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
  }, []);

  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: -150, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: 150, behavior: 'smooth' });
  }, []);

  // Check scroll buttons when categories change
  useEffect(() => {
    checkScrollButtons();
  }, [checkScrollButtons]);

  // Mobile-optimized category selection (most popular categories with short names)
  const getMobilePriorityCategories = useCallback((allCategories: string[]) => {
    // Prioritize shorter category names that fit better on mobile
    const priorityOrder = ['writing', 'coding', 'creative', 'planning', 'learning', 'decision', 'health', 'travel', 'science'];
    const sorted = allCategories.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a);
      const bIndex = priorityOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) {
        // If neither is in priority list, prefer shorter names
        if (a.length !== b.length) return a.length - b.length;
        return a.localeCompare(b);
      }
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    // Only show 2-3 categories that fit comfortably on mobile
    return sorted.slice(0, 2);
  }, []);

  // Smart search suggestions - provide contextual hints based on search
  const getSearchHints = useCallback((query: string) => {
    if (!query) return [];
    
    const lowercaseQuery = query.toLowerCase();
    const hints = [];
    
    // Category-based hints
    if (lowercaseQuery.includes('code') || lowercaseQuery.includes('program')) {
      hints.push('Try "coding" category for development help');
    }
    if (lowercaseQuery.includes('write') || lowercaseQuery.includes('essay')) {
      hints.push('Check "writing" category for content creation');
    }
    if (lowercaseQuery.includes('plan') || lowercaseQuery.includes('organize')) {
      hints.push('Explore "planning" category for organization tools');
    }
    if (lowercaseQuery.includes('learn') || lowercaseQuery.includes('study')) {
      hints.push('Browse "learning" category for educational help');
    }
    
    return hints.slice(0, 1); // Show only one hint
  }, []);

  const searchHints = useMemo(() => 
    getSearchHints(searchQuery), [searchQuery, getSearchHints]
  );

  // Get contextual suggestions based on the selected model
  const contextualSuggestions = useMemo(() => {
    if (suggestions) return suggestions;
    return getContextualSuggestions(selectedModel);
  }, [suggestions, selectedModel]);

  const handleSuggestionClick = useCallback(async (action: string) => {
    // Check if this is a template action
    if (action.startsWith('template:')) {
      const templateType = action.replace('template:', '') as keyof typeof TEMPLATE_CONFIGS;
      if (TEMPLATE_CONFIGS[templateType]) {
        setCurrentTemplate(templateType);
        setTemplateInput('');
        setShowTemplateModal(true);
        return;
      }
    }
    
    // Regular suggestion - send directly
    setIsAnimating(true);
    sendMessage(action);
    setTimeout(() => setIsAnimating(false), 300);
  }, [sendMessage]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>, action: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // Check if this is a template action
      if (action.startsWith('template:')) {
        const templateType = action.replace('template:', '') as keyof typeof TEMPLATE_CONFIGS;
        if (TEMPLATE_CONFIGS[templateType]) {
          setCurrentTemplate(templateType);
          setTemplateInput('');
          setShowTemplateModal(true);
          return;
        }
      }
      sendMessage(action);
    }
  }, [sendMessage]);

  // Template modal handlers
  const handleTemplateSubmit = useCallback(() => {
    if (!currentTemplate || !templateInput.trim()) return;
    
    const config = TEMPLATE_CONFIGS[currentTemplate];
    const fullMessage = config.template(templateInput.trim());
    
    setShowTemplateModal(false);
    setCurrentTemplate(null);
    setTemplateInput('');
    sendMessage(fullMessage);
  }, [currentTemplate, templateInput, sendMessage]);

  const handleTemplateCancel = useCallback(() => {
    setShowTemplateModal(false);
    setCurrentTemplate(null);
    setTemplateInput('');
  }, []);

  const handleTemplateKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && currentTemplate && !TEMPLATE_CONFIGS[currentTemplate].multiline) {
      event.preventDefault();
      handleTemplateSubmit();
    }
    if (event.key === 'Escape') {
      handleTemplateCancel();
    }
  }, [currentTemplate, handleTemplateSubmit, handleTemplateCancel]);

  // Get unique categories
  const categories = Array.from(new Set(contextualSuggestions.map(s => s.category).filter((cat): cat is string => Boolean(cat))));

  // Show categories logic: Search-first approach
  const shouldShowCategories = useMemo(() => {
    if (!showCategories || categories.length <= 1) return false;
    
    // Always show on desktop
    if (!isMobile) return true;
    
    // On mobile: show only when search is focused or has content
    return isSearchFocused || searchQuery.length > 0;
  }, [showCategories, categories.length, isMobile, isSearchFocused, searchQuery]);

  // Get categories to display based on device type
  const displayCategories = useMemo(() => {
    if (!shouldShowCategories) return [];
    
    if (isMobile) {
      return getMobilePriorityCategories(categories);
    }
    
    return categories;
  }, [shouldShowCategories, isMobile, categories, getMobilePriorityCategories]);
  
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
  const displayLimit = showMore ? filteredSuggestions.length : maxSuggestions;
  const limitedSuggestions = filteredSuggestions.slice(0, displayLimit);
  const hasMoreSuggestions = filteredSuggestions.length > maxSuggestions;

  return (
    <div className="w-full space-y-3 px-3 sm:px-0">
      {/* Search input - Made more prominent for search-first approach */}
      <div className={`relative mx-auto transition-all duration-200 ${
        isMobile 
          ? (isSearchFocused || searchQuery.length > 0 ? 'max-w-full px-2' : 'max-w-sm')
          : 'max-w-sm'
      }`}>
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
          isSearchFocused ? 'text-primary' : 'text-muted-foreground'
        }`} />
        <Input
          type="text"
          placeholder={isMobile 
            ? (isSearchFocused ? "Search suggestions..." : "Search or choose categories...")
            : "Search suggestions..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={`pl-10 pr-10 transition-all duration-200 ${
            isSearchFocused 
              ? 'h-10 ring-2 ring-primary/20 border-primary' 
              : 'h-9'
          }`}
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
        
        {/* Mobile hint text - only show when categories would appear on focus */}
        {isMobile && !isSearchFocused && !searchQuery && shouldShowCategories && (
          <div className="absolute -bottom-6 left-0 right-0 text-center">
            <span className="text-xs text-muted-foreground">
              Tap to search or browse categories
            </span>
          </div>
        )}
      </div>

      {/* Mobile quick actions - Show when categories are hidden */}
      {isMobile && !shouldShowCategories && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex gap-2 justify-center flex-wrap px-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendMessage("Help me write something")}
            className="text-xs h-7 px-2 flex-1 min-w-0 max-w-[90px]"
          >
            <Edit3 className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Write</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendMessage("Help me code something")}
            className="text-xs h-7 px-2 flex-1 min-w-0 max-w-[90px]"
          >
            <Code className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Code</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendMessage("Help me plan something")}
            className="text-xs h-7 px-2 flex-1 min-w-0 max-w-[90px]"
          >
            <Zap className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Plan</span>
          </Button>
        </motion.div>
      )}

      {/* Smart search hints */}
      {searchHints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center px-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs max-w-full">
            <Sparkles className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{searchHints[0]}</span>
          </div>
        </motion.div>
      )}

      {/* Category filters - Search-first approach with mobile optimization */}
      <AnimatePresence>
        {shouldShowCategories && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: isMobile ? 8 : 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {isMobile ? (
              /* Mobile: Constrained button layout that prevents overflow */
              <div className="px-2">
                <div className="flex gap-1.5 justify-center flex-wrap max-w-full">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs h-6 px-2 min-w-0"
                  >
                    <Filter className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">All</span>
                  </Button>
                  {displayCategories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category || null)}
                      className="text-xs capitalize h-6 px-2 min-w-0 max-w-[80px]"
                    >
                      <span className="truncate">{category}</span>
                    </Button>
                  ))}
                </div>
                {categories.length > 2 && (
                  <div className="text-center mt-2 px-2">
                    <span className="text-xs text-muted-foreground">
                      {categories.length - 2} more via search
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop: Full horizontal scroll */
              <div className="relative flex items-center">
                {/* Left scroll arrow */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className={`absolute left-0 z-20 h-6 w-6 p-0 bg-background/80 backdrop-blur-sm border transition-all ${
                    canScrollLeft 
                      ? 'opacity-100 hover:bg-background/90' 
                      : 'opacity-30 cursor-not-allowed'
                  }`}
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>

                {/* Scrollable container */}
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 px-8 scroll-smooth"
                  onScroll={checkScrollButtons}
                >
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs h-6 px-2.5 flex-shrink-0"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    All
                  </Button>
                  {displayCategories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category || null)}
                      className="text-xs capitalize h-6 px-2.5 flex-shrink-0 whitespace-nowrap"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Right scroll arrow */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className={`absolute right-0 z-20 h-6 w-6 p-0 bg-background/80 backdrop-blur-sm border transition-all ${
                    canScrollRight 
                      ? 'opacity-100 hover:bg-background/90' 
                      : 'opacity-30 cursor-not-allowed'
                  }`}
                  aria-label="Scroll categories right"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search results info */}
      {searchQuery && (
        <div className="text-center text-sm text-muted-foreground px-2">
          {filteredSuggestions.length === 0 ? (
            <div className="flex items-center justify-center gap-2">
              <Search className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">No suggestions found for "{searchQuery}"</span>
            </div>
          ) : (
            <div className="truncate">
              Found {filteredSuggestions.length} suggestion{filteredSuggestions.length !== 1 ? 's' : ''} 
              {selectedCategory && ` in "${selectedCategory}"`}
            </div>
          )}
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

      {/* Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              {currentTemplate && TEMPLATE_CONFIGS[currentTemplate].title}
            </DialogTitle>
            <DialogDescription>
              {currentTemplate && TEMPLATE_CONFIGS[currentTemplate].description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentTemplate && TEMPLATE_CONFIGS[currentTemplate].multiline ? (
              <Textarea
                placeholder={TEMPLATE_CONFIGS[currentTemplate].placeholder}
                value={templateInput}
                onChange={(e) => setTemplateInput(e.target.value)}
                onKeyDown={handleTemplateKeyDown}
                className="min-h-[120px] resize-none"
                autoFocus
              />
            ) : (
              <Input
                placeholder={currentTemplate ? TEMPLATE_CONFIGS[currentTemplate].placeholder : ''}
                value={templateInput}
                onChange={(e) => setTemplateInput(e.target.value)}
                onKeyDown={handleTemplateKeyDown}
                autoFocus
              />
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTemplateCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleTemplateSubmit}
                disabled={!templateInput.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-3 w-3" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

