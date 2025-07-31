import { SuggestedAction } from "@/components/suggested-prompts";
import { 
  Code, 
  Brain, 
  Lightbulb, 
  Search, 
  BookOpen, 
  Zap,
  Globe,
  Sparkles,
  FileText,
  ImageIcon,
  Cpu,
  Languages,
  MessageCircle,
  Heart,
  MapPin,
  Utensils,
  DollarSign,
  Leaf,
  Dumbbell,
  Users,
  Palette,
  Telescope,
  Clock,
  Home,
  FlaskConical,
  Shield,
  Gamepad2,
  Music,
  Calendar
} from "lucide-react";

export interface ModelCapabilities {
  coding: boolean;
  reasoning: boolean;
  vision: boolean;
  creative: boolean;
  analysis: boolean;
  multimodal: boolean;
}

export const getModelCapabilities = (modelId: string): ModelCapabilities => {
  const model = modelId.toLowerCase();
  
  // Claude models
  if (model.includes('claude')) {
    return {
      coding: true,
      reasoning: true,
      vision: model.includes('3.5') || model.includes('3-5'),
      creative: true,
      analysis: true,
      multimodal: model.includes('3.5') || model.includes('3-5')
    };
  }
  
  // GPT models
  if (model.includes('gpt') || model.includes('o1')) {
    return {
      coding: true,
      reasoning: model.includes('o1'),
      vision: model.includes('4') && !model.includes('o1'),
      creative: true,
      analysis: true,
      multimodal: model.includes('4') && !model.includes('o1')
    };
  }
  
  // Gemini models
  if (model.includes('gemini')) {
    return {
      coding: true,
      reasoning: true,
      vision: true,
      creative: true,
      analysis: true,
      multimodal: true
    };
  }
  
  // Deepseek models - especially good at coding
  if (model.includes('deepseek')) {
    return {
      coding: true,
      reasoning: true,
      vision: false,
      creative: false,
      analysis: true,
      multimodal: false
    };
  }
  
  // Llama models
  if (model.includes('llama')) {
    return {
      coding: true,
      reasoning: true,
      vision: model.includes('vision'),
      creative: true,
      analysis: true,
      multimodal: model.includes('vision')
    };
  }
  
  // Default capabilities for unknown models
  return {
    coding: true,
    reasoning: true,
    vision: false,
    creative: true,
    analysis: true,
    multimodal: false
  };
};

export const getContextualSuggestions = (
  modelId?: string,
  userPreferences?: string[]
): SuggestedAction[] => {
  const capabilities = modelId ? getModelCapabilities(modelId) : null;
  const suggestions: SuggestedAction[] = [];
  
  // Beginner-friendly suggestions (always shown first)
  suggestions.push(
    {
      title: "Help me write an email",
      label: "professional and clear",
      action: "template:write-email",
      category: "writing",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Help me write a story",
      label: "with an interesting twist",
      action: "template:write-story",
      category: "creative",
      icon: <Lightbulb className="h-4 w-4" />,
    },
    {
      title: "Help me plan my week",
      label: "efficiently and realistically",
      action: "template:plan-schedule",
      category: "planning",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: "Explain this concept",
      label: "in simple terms",
      action: "template:explain-concept",
      category: "learning",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Help me make a decision",
      label: "by weighing pros and cons",
      action: "template:make-decision",
      category: "decision",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      title: "Help me brainstorm ideas",
      label: "for a creative project",
      action: "template:brainstorm-ideas",
      category: "creative",
      icon: <Lightbulb className="h-4 w-4" />,
    },
    {
      title: "Help me write a cover letter",
      label: "that stands out",
      action: "template:write-cover-letter",
      category: "writing",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Help me write a social post",
      label: "engaging and authentic",
      action: "template:write-social-post",
      category: "writing",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      title: "Help me prepare for an interview",
      label: "with confidence",
      action: "template:prepare-interview",
      category: "planning",
      icon: <Search className="h-4 w-4" />,
    }
  );
  
  // Health & Wellness suggestions
  suggestions.push(
    {
      title: "Design a workout plan",
      label: "for my fitness goals",
      action: "template:create-workout-plan",
      category: "health",
      icon: <Dumbbell className="h-4 w-4" />,
    },
    {
      title: "Manage stress and anxiety",
      label: "with proven techniques",
      action: "template:manage-stress",
      category: "wellness",
      icon: <Heart className="h-4 w-4" />,
    },
    {
      title: "Start a meditation practice",
      label: "for beginners",
      action: "template:meditation-guide",
      category: "wellness",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      title: "Improve my memory",
      label: "and recall abilities",
      action: "template:improve-memory",
      category: "self-improvement",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      title: "Boost my confidence",
      label: "in challenging situations",
      action: "template:boost-confidence",
      category: "self-improvement",
      icon: <Shield className="h-4 w-4" />,
    }
  );
  
  // Lifestyle & Personal suggestions
  suggestions.push(
    {
      title: "Creative date ideas",
      label: "for memorable experiences",
      action: "template:suggest-date-ideas",
      category: "lifestyle",
      icon: <Heart className="h-4 w-4" />,
    },
    {
      title: "Plan a perfect trip",
      label: "with detailed itinerary",
      action: "template:travel-itinerary",
      category: "travel",
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      title: "Make friends as an adult",
      label: "in meaningful ways",
      action: "template:make-adult-friends",
      category: "social",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Organize my living space",
      label: "efficiently and stylishly",
      action: "template:home-organization",
      category: "lifestyle",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Find new hobbies to try",
      label: "that match my interests",
      action: "template:hobby-suggestions",
      category: "lifestyle",
      icon: <Palette className="h-4 w-4" />,
    }
  );
  
  // Financial & Practical suggestions
  suggestions.push(
    {
      title: "Save money effectively",
      label: "with practical strategies",
      action: "template:save-money-tips",
      category: "finance",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Reduce my carbon footprint",
      label: "with actionable tips",
      action: "template:reduce-carbon-footprint",
      category: "environment",
      icon: <Leaf className="h-4 w-4" />,
    },
    {
      title: "Create a delicious recipe",
      label: "with what I have",
      action: "template:create-recipe",
      category: "cooking",
      icon: <Utensils className="h-4 w-4" />,
    }
  );
  
  // Learning & Skills suggestions
  suggestions.push(
    {
      title: "Get book recommendations",
      label: "across different genres",
      action: "template:book-recommendations",
      category: "learning",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Learn a new language",
      label: "with structured approach",
      action: "template:learn-language",
      category: "learning",
      icon: <Languages className="h-4 w-4" />,
    },
    {
      title: "Improve public speaking",
      label: "and presentation skills",
      action: "template:improve-public-speaking",
      category: "skills",
      icon: <MessageCircle className="h-4 w-4" />,
    }
  );
  
  // Fun & Entertainment suggestions
  suggestions.push(
    {
      title: "Fascinating space facts",
      label: "about the universe",
      action: "template:space-facts",
      category: "science",
      icon: <Telescope className="h-4 w-4" />,
    },
    {
      title: "Intriguing unsolved mysteries",
      label: "that puzzle experts",
      action: "template:unsolved-mysteries",
      category: "mystery",
      icon: <Search className="h-4 w-4" />,
    },
    {
      title: "Historical facts",
      label: "that will surprise you",
      action: "template:historical-facts",
      category: "history",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      title: "Fun science experiments",
      label: "to try at home",
      action: "template:science-experiments",
      category: "science",
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      title: "Board game recommendations",
      label: "for any occasion",
      action: "template:board-game-suggestions",
      category: "entertainment",
      icon: <Gamepad2 className="h-4 w-4" />,
    }
  );
  
  // Professional & Social suggestions
  suggestions.push(
    {
      title: "Team building activities",
      label: "to strengthen bonds",
      action: "template:team-building",
      category: "professional",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Cultural awareness guide",
      label: "for respectful interactions",
      action: "template:cultural-awareness",
      category: "social",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      title: "Philosophical discussion",
      label: "on thought-provoking topics",
      action: "template:philosophical-discussion",
      category: "philosophy",
      icon: <Brain className="h-4 w-4" />,
    }
  );
  
  // Technical suggestions for developers
  suggestions.push(
    {
      title: "Debug this code",
      label: "and explain the issue",
      action: "template:debug-code",
      category: "coding",
      icon: <Search className="h-4 w-4" />,
    },
    {
      title: "Code review",
      label: "with best practices",
      action: "template:code-review",
      category: "coding", 
      icon: <Code className="h-4 w-4" />,
    }
  );
  
  // Model-specific suggestions
  if (capabilities?.reasoning) {
    suggestions.push({
      title: "Step-by-step analysis",
      label: "of complex problem",
      action: "template:analyze-problem",
      category: "reasoning",
      icon: <Brain className="h-4 w-4" />,
    });
  }
  
  if (capabilities?.vision) {
    suggestions.push({
      title: "Analyze this image",
      label: "and describe what you see",
      action: "Please analyze this image and describe what you see in detail",
      category: "vision",
      icon: <ImageIcon className="h-4 w-4" />,
    });
  }
  
  if (capabilities?.creative) {
    suggestions.push({
      title: "Write creative content",
      label: "for my project",
      action: "template:write-content",
      category: "creative",
      icon: <Lightbulb className="h-4 w-4" />,
    });
  }
  
  // DeepSeek specific suggestions (coding focused)
  if (modelId?.toLowerCase().includes('deepseek')) {
    suggestions.push(
      {
        title: "Optimize algorithm",
        label: "for better performance",
        action: "template:optimize-algorithm",
        category: "optimization",
        icon: <Cpu className="h-4 w-4" />,
      },
      {
        title: "Refactor code",
        label: "with clean architecture",
        action: "template:refactor-code",
        category: "coding",
        icon: <Zap className="h-4 w-4" />,
      }
    );
  }
  
  // Claude specific suggestions (reasoning focused)
  if (modelId?.toLowerCase().includes('claude')) {
    suggestions.push(
      {
        title: "Research and synthesize",
        label: "multiple sources",
        action: "template:research-topic",
        category: "research",
        icon: <Globe className="h-4 w-4" />,
      },
      {
        title: "Explain complex concept",
        label: "in simple terms",
        action: "template:explain-concept",
        category: "learning",
        icon: <BookOpen className="h-4 w-4" />,
      }
    );
  }
  
  // GPT specific suggestions (versatile)
  if (modelId?.toLowerCase().includes('gpt')) {
    suggestions.push(
      {
        title: "Create documentation",
        label: "with examples",
        action: "template:create-documentation",
        category: "documentation",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "Generate test cases",
        label: "for thorough testing",
        action: "template:generate-tests",
        category: "testing",
        icon: <Sparkles className="h-4 w-4" />,
      }
    );
  }
  
  // Gemini specific suggestions (multimodal)
  if (modelId?.toLowerCase().includes('gemini')) {
    suggestions.push({
      title: "Multimodal analysis",
      label: "of data and content",
      action: "template:multimodal-analysis",
      category: "analysis",
      icon: <Languages className="h-4 w-4" />,
    });
  }
  
  // Generic helpful suggestions
  suggestions.push(
    {
      title: "Learn new technology",
      label: "with structured plan",
      action: "template:learn-technology",
      category: "learning",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Summarize this text",
      label: "with key points",
      action: "template:summarize-text",
      category: "analysis",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Review this document",
      label: "and suggest improvements",
      action: "template:review-document",
      category: "analysis",
      icon: <Search className="h-4 w-4" />,
    },
    {
      title: "Brainstorm solutions",
      label: "to specific challenge",
      action: "template:brainstorm-solutions",
      category: "creative",
      icon: <Lightbulb className="h-4 w-4" />,
    }
  );
  
  return suggestions;
};

export const getCategoryColor = (category: string): string => {
  const colors = {
    // Beginner-friendly categories
    writing: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    planning: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
    decision: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    
    // Technical categories
    coding: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    reasoning: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    debugging: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    documentation: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    optimization: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    testing: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    
    // Health & Wellness categories
    health: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    wellness: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    'self-improvement': "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    
    // Lifestyle categories
    lifestyle: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    travel: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    social: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    cooking: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    
    // Financial & Practical categories
    finance: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    environment: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    
    // Learning & Skills categories
    skills: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    
    // Fun & Entertainment categories
    science: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    mystery: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
    history: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    entertainment: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    
    // Professional & Social categories
    professional: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    philosophy: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    
    // General categories
    creative: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    research: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    learning: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    vision: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    analysis: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  };
  
  return colors[category as keyof typeof colors] || colors.creative;
}; 