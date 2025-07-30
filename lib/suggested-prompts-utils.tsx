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
  Languages
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
  
  // Core coding suggestions (always available)
  suggestions.push(
    {
      title: "Debug this code",
      label: "and explain the issue",
      action: "I'm having an issue with this code. Can you debug it and explain what's wrong?",
      category: "coding",
      icon: <Search className="h-4 w-4" />,
    },
    {
      title: "Code review",
      label: "with best practices",
      action: "Please review this code and suggest improvements following best practices",
      category: "coding", 
      icon: <Code className="h-4 w-4" />,
    }
  );
  
  // Model-specific suggestions
  if (capabilities?.reasoning) {
    suggestions.push({
      title: "Step-by-step analysis",
      label: "of complex problem",
      action: "Break down this complex problem step by step and provide a detailed analysis",
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
      action: "Help me write engaging and creative content for my website/project",
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
        action: "Analyze this algorithm and suggest optimizations for better time/space complexity",
        category: "optimization",
        icon: <Cpu className="h-4 w-4" />,
      },
      {
        title: "Refactor code",
        label: "with clean architecture",
        action: "Refactor this code following clean architecture principles and design patterns",
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
        action: "Research this topic from multiple angles and synthesize the information into a comprehensive overview",
        category: "research",
        icon: <Globe className="h-4 w-4" />,
      },
      {
        title: "Explain complex concept",
        label: "in simple terms",
        action: "Explain this complex concept to me as if I'm a beginner, using analogies and examples",
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
        action: "Create comprehensive documentation for this code/API with usage examples",
        category: "documentation",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "Generate test cases",
        label: "for thorough testing",
        action: "Generate comprehensive test cases for this function/component including edge cases",
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
      action: "Analyze this content across multiple formats (text, images, data) and provide insights",
      category: "analysis",
      icon: <Languages className="h-4 w-4" />,
    });
  }
  
  // Generic helpful suggestions
  suggestions.push(
    {
      title: "Learn new technology",
      label: "with structured plan",
      action: "Create a learning roadmap for mastering a new technology stack",
      category: "learning",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Brainstorm solutions",
      label: "to technical challenge",
      action: "Help me brainstorm creative solutions to overcome this technical challenge",
      category: "creative",
      icon: <Lightbulb className="h-4 w-4" />,
    }
  );
  
  return suggestions;
};

export const getCategoryColor = (category: string): string => {
  const colors = {
    coding: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    reasoning: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    creative: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    research: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    learning: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    debugging: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    documentation: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    optimization: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    vision: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    analysis: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    testing: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  };
  
  return colors[category as keyof typeof colors] || colors.coding;
}; 