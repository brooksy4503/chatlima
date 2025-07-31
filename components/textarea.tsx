import { modelID } from "@/ai/providers";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { ArrowUp, Square, Globe, AlertCircle, ImageIcon, Code2, X, Eye, EyeOff } from "lucide-react";
import { ModelPicker } from "./model-picker";
import { PresetSelector } from "./preset-selector";
import { useRef, useState, useCallback } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useWebSearch } from "@/lib/context/web-search-context";
import { usePresets } from "@/lib/context/preset-context";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { WEB_SEARCH_COST } from "@/lib/tokenCounter";
import { ImageUpload } from "./image-upload";
import { ImagePreview } from "./image-preview";
import type { ImageAttachment } from "@/lib/types";
import { Button } from "./ui/button";
import { useModels } from "@/hooks/use-models";
import { processTextInput } from "@/lib/text-utils";
import { processKeyboardInput, expandCodeSnippet, cleanupCodeStructure } from "@/lib/text-utils";
import { useClientMount } from "@/lib/hooks/use-client-mount";

interface InputProps {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  status: string;
  stop: () => void;
  selectedModel: modelID;
  setSelectedModel: (model: modelID) => void;
  // Image upload props
  images?: ImageAttachment[];
  onImagesChange?: (images: ImageAttachment[]) => void;
}

export const Textarea = ({
  input,
  handleInputChange,
  isLoading,
  status,
  stop,
  selectedModel,
  setSelectedModel,
  images = [],
  onImagesChange,
}: InputProps) => {
  const isStreaming = status === "streaming" || status === "submitted";
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  // Code detection and enhancement state
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeConfidence, setCodeConfidence] = useState(0);
  const [lastProcessedLength, setLastProcessedLength] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [showAutoWrapFeedback, setShowAutoWrapFeedback] = useState(false);
  const [showAutoUnwrapFeedback, setShowAutoUnwrapFeedback] = useState(false);
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState(true);
  const isMounted = useClientMount();

  const { webSearchEnabled, setWebSearchEnabled } = useWebSearch();
  const { activePreset } = usePresets();
  const { user } = useAuth();
  const isMobileScreen = useIsMobile();
  const { models } = useModels();

  // Get the effective model ID - use preset model if active, otherwise selected model
  const getEffectiveModel = (): modelID => {
    return activePreset?.modelId || selectedModel;
  };

  // Helper function to check if the effective model supports vision
  const effectiveModelSupportsVision = (): boolean => {
    const effectiveModelId = getEffectiveModel();
    const modelInfo = models.find(model => model.id === effectiveModelId);
    return modelInfo?.vision === true;
  };

  // Get the effective web search enabled state - use preset setting if active, otherwise context setting
  const getEffectiveWebSearchEnabled = (): boolean => {
    return activePreset?.webSearchEnabled ?? webSearchEnabled;
  };

  const handleWebSearchToggle = () => {
    // Only allow toggle when no preset is active
    if (!activePreset) {
      setWebSearchEnabled(!webSearchEnabled);
    }
  };

  const handleAutoDetectionToggle = () => {
    const newAutoDetectionEnabled = !autoDetectionEnabled;
    setAutoDetectionEnabled(newAutoDetectionEnabled);
    
    if (!newAutoDetectionEnabled) {
      // Disabling auto detection: clear code mode state and unwrap any code blocks
      setIsCodeMode(false);
      setCodeConfidence(0);
      setDetectedLanguage(null);
      
      // Unwrap code blocks from the current input
      const unwrappedText = unwrapCodeBlocks(input);
      if (unwrappedText !== input) {
        const syntheticEvent = {
          target: { value: unwrappedText }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        handleInputChange(syntheticEvent);
        
        // Show feedback that code blocks were automatically unwrapped
        setShowAutoUnwrapFeedback(true);
        setTimeout(() => setShowAutoUnwrapFeedback(false), 3000);
      }
    } else {
      // Enabling auto detection: analyze current text and potentially wrap it
      if (input.trim().length > 20) {
        const processed = processTextInput(input, { autoWrapCode: true });
        
        if (processed.isCode && processed.confidence > 60) {
          // Update code mode state
          setIsCodeMode(true);
          setCodeConfidence(processed.confidence);
          setDetectedLanguage(processed.language || null);
          
          // If the text was wrapped, update the input
          if (processed.wasWrapped && processed.processedText !== input) {
            const syntheticEvent = {
              target: { value: processed.processedText }
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
            
            // Show feedback that code was automatically wrapped
            setShowAutoWrapFeedback(true);
            setTimeout(() => setShowAutoWrapFeedback(false), 3000);
          }
        }
      }
    }
  };

  // Helper function to unwrap code blocks
  const unwrapCodeBlocks = (text: string): string => {
    if (!text) return text;
    
    const trimmed = text.trim();
    
    // Check if text starts and ends with triple backticks (simple single code block)
    if (trimmed.startsWith('```') && trimmed.endsWith('```') && trimmed.split('```').length === 3) {
      const lines = trimmed.split('\n');
      
      // Need at least 3 lines: opening ```, content, closing ```
      if (lines.length >= 3) {
        // Remove first line (```language) and last line (```)
        const unwrapped = lines.slice(1, -1).join('\n');
        
        // Preserve original leading/trailing whitespace structure
        const leadingWhitespace = text.match(/^\s*/)?.[0] || '';
        const trailingWhitespace = text.match(/\s*$/)?.[0] || '';
        
        return leadingWhitespace + unwrapped + trailingWhitespace;
      }
    }
    
    // Handle edge case: single line code block like ```javascript console.log('hello'); ```
    const singleLineMatch = trimmed.match(/^```\w*\s*(.*?)\s*```$/);
    if (singleLineMatch) {
      const unwrapped = singleLineMatch[1];
      const leadingWhitespace = text.match(/^\s*/)?.[0] || '';
      const trailingWhitespace = text.match(/\s*$/)?.[0] || '';
      return leadingWhitespace + unwrapped + trailingWhitespace;
    }
    
    return text;
  };

  // Check if user has enough credits for web search (5 credits minimum)
  // Use a more resilient check that handles temporary null values during hot reload
  const userCredits = user?.credits ?? 0;
  const hasEnoughCreditsForWebSearch = user?.hasCredits !== false && userCredits >= WEB_SEARCH_COST;
  const isAnonymousUser = !user || user?.isAnonymous;
  // Only allow web search if user has sufficient credits and is not anonymous
  const canUseWebSearch = !isAnonymousUser && hasEnoughCreditsForWebSearch;

  // Calculate estimated cost
  const getEstimatedCost = () => {
    const baseCost = 1; // Base cost for any message
    const effectiveWebSearchEnabled = getEffectiveWebSearchEnabled();
    const webSearchCost = effectiveWebSearchEnabled ? WEB_SEARCH_COST : 0;
    return baseCost + webSearchCost;
  };

  const estimatedCost = getEstimatedCost();
  const shouldShowCostWarning = getEffectiveWebSearchEnabled() && canUseWebSearch && input.trim();

  // Focus textarea after model selection
  const handleModelSelected = () => {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Image handling functions
  const handleImageSelect = (newImages: ImageAttachment[]) => {
    if (onImagesChange) {
      onImagesChange([...images, ...newImages]);
    }
    setShowImageUpload(false);
  };

  const handleImageRemove = (index: number) => {
    if (onImagesChange) {
      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
    }
  };

  const canUploadMore = images.length < 5;
  const hasImages = images.length > 0;

  // Detect programming language from content
  const detectLanguage = useCallback((text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    // JavaScript/TypeScript patterns
    if (lowerText.includes('console.log') || lowerText.includes('function') || 
        lowerText.includes('=>') || lowerText.includes('const ') || 
        lowerText.includes('import ') || lowerText.includes('export ')) {
      if (lowerText.includes('interface ') || lowerText.includes('type ') || 
          text.includes(': string') || text.includes(': number')) {
        return 'typescript';
      }
      return 'javascript';
    }
    
    // Python patterns
    if (lowerText.includes('def ') || lowerText.includes('import ') || 
        lowerText.includes('print(') || lowerText.includes('class ') ||
        lowerText.includes('if __name__')) {
      return 'python';
    }
    
    // HTML/JSX patterns
    if (text.includes('<') && text.includes('>') && 
        (text.includes('</') || text.includes('/>'))) {
      if (text.includes('className=') || text.includes('onClick=')) {
        return 'jsx';
      }
      return 'html';
    }
    
    // CSS patterns
    if (text.includes('{') && text.includes('}') && 
        (text.includes(':') && text.includes(';'))) {
      if (lowerText.includes('@media') || lowerText.includes('px') || 
          lowerText.includes('rem') || lowerText.includes('color:')) {
        return 'css';
      }
    }
    
    // JSON patterns
    if (text.trim().startsWith('{') && text.trim().endsWith('}') ||
        text.trim().startsWith('[') && text.trim().endsWith(']')) {
      try {
        JSON.parse(text);
        return 'json';
      } catch {}
    }
    
    // SQL patterns
    if (lowerText.includes('select ') || lowerText.includes('from ') || 
        lowerText.includes('where ') || lowerText.includes('insert ')) {
      return 'sql';
    }
    
    return null;
  }, []);

  // Paste event handler for enhanced text processing
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    if (!pastedText) return;

    // Process the pasted text with auto-wrapping enabled
    const processed = processTextInput(pastedText, { autoWrapCode: true });
    
    if (processed.processedText !== pastedText) {
      // Prevent default paste and use our processed version
      e.preventDefault();
      
      const textarea = textareaRef.current;
      if (!textarea) return;

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const currentValue = textarea.value;
      
      // Insert processed text at cursor position
      const newValue = 
        currentValue.slice(0, selectionStart) + 
        processed.processedText + 
        currentValue.slice(selectionEnd);
      
      // Create synthetic event to trigger handleInputChange
      const syntheticEvent = {
        target: { value: newValue }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      handleInputChange(syntheticEvent);
      
      // Restore cursor position
      requestAnimationFrame(() => {
        const newCursorPos = selectionStart + processed.processedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
      
      // Show feedback if code was automatically wrapped
      if (processed.wasWrapped) {
        console.log(`✅ Code automatically wrapped in \`\`\`${processed.language || ''}\`\`\` blocks`);
        setShowAutoWrapFeedback(true);
        // Hide feedback after 3 seconds
        setTimeout(() => setShowAutoWrapFeedback(false), 3000);
      }
    }
    
    // Update code detection state only if auto detection is enabled
    if (autoDetectionEnabled) {
      if (processed.isCode && processed.confidence > 60) {
        setIsCodeMode(true);
        setCodeConfidence(processed.confidence);
        setDetectedLanguage(processed.language || null);
        console.log('Code detected:', processed.reasons, processed.language ? `(${processed.language})` : '');
      } else if (processed.confidence < 30) {
        setIsCodeMode(false);
        setCodeConfidence(0);
        setDetectedLanguage(null);
      }
    }
    
    setLastProcessedLength(processed.processedText.length);
  }, [handleInputChange]);

  // Enhanced input change handler with dynamic code detection
  const handleEnhancedInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Call the original handler first
    handleInputChange(e);
    
    // Dynamic code detection for longer content (> 50 characters) - only if auto detection is enabled
    if (autoDetectionEnabled && newValue.length > 50 && newValue.length % 20 === 0) {
      const processed = processTextInput(newValue, { autoWrapCode: false }); // Don't auto-wrap during typing
      
      if (processed.isCode && processed.confidence > 70) {
        if (!isCodeMode) {
          setIsCodeMode(true);
          setCodeConfidence(processed.confidence);
          setDetectedLanguage(processed.language || null);
        }
      } else if (processed.confidence < 20 && isCodeMode) {
        // Only switch out of code mode if confidence is very low
        setIsCodeMode(false);
        setCodeConfidence(0);
        setDetectedLanguage(null);
      }
    }
    
    // Clear code mode for very short content - only if auto detection is enabled
    if (autoDetectionEnabled && newValue.length < 20 && isCodeMode) {
      setIsCodeMode(false);
      setCodeConfidence(0);
      setDetectedLanguage(null);
    }
  }, [handleInputChange, isCodeMode, detectLanguage, autoDetectionEnabled]);

  // Enhanced keyboard handler with smart input processing
  const handleEnhancedKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const key = e.key;

    // Handle Enter submission (preserve existing behavior)
    if (key === "Enter" && !e.shiftKey && !isLoading && (input.trim() || hasImages)) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
      return;
    }

    // Handle Ctrl/Cmd+K for manual code wrapping
    if ((e.ctrlKey || e.metaKey) && key === 'k') {
      e.preventDefault();
      
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      
      if (selectionStart !== selectionEnd) {
        // Wrap selected text
        const selectedText = input.slice(selectionStart, selectionEnd);
        const processed = processTextInput(selectedText, { forceCodeWrapping: true });
        
        const newValue = 
          input.slice(0, selectionStart) + 
          processed.processedText + 
          input.slice(selectionEnd);
        
        const syntheticEvent = {
          target: { value: newValue }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        handleInputChange(syntheticEvent);
        
        // Show feedback
        if (processed.wasWrapped) {
          setShowAutoWrapFeedback(true);
          setTimeout(() => setShowAutoWrapFeedback(false), 3000);
        }
        
        // Restore selection around the wrapped code
        requestAnimationFrame(() => {
          const newStart = selectionStart;
          const newEnd = selectionStart + processed.processedText.length;
          textarea.setSelectionRange(newStart, newEnd);
        });
      } else {
        // No selection - wrap entire input if it looks like code
        const processed = processTextInput(input, { forceCodeWrapping: true });
        
        if (processed.wasWrapped) {
          const syntheticEvent = {
            target: { value: processed.processedText }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          
          handleInputChange(syntheticEvent);
          setShowAutoWrapFeedback(true);
          setTimeout(() => setShowAutoWrapFeedback(false), 3000);
          
          // Keep cursor at the end
          requestAnimationFrame(() => {
            textarea.setSelectionRange(processed.processedText.length, processed.processedText.length);
          });
        }
      }
      return;
    }

    // Skip processing for modifier keys or special keys
    if (e.ctrlKey || e.metaKey || e.altKey || key.length > 1) {
      // Allow Tab for indentation in code mode
      if (key === 'Tab' && isCodeMode) {
        // Handle tab logic below
      } else {
        return;
      }
    }

    // Process keyboard input with smart enhancements
    const processed = processKeyboardInput(key, input, cursorPosition, detectedLanguage);

    if (processed.shouldPreventDefault) {
      e.preventDefault();

      if (processed.newText && processed.newCursorPosition !== undefined) {
        // Create synthetic event for the new text
        const syntheticEvent = {
          target: { value: processed.newText }
        } as React.ChangeEvent<HTMLTextAreaElement>;

        handleInputChange(syntheticEvent);

        // Set cursor position after React updates
        requestAnimationFrame(() => {
          textarea.setSelectionRange(processed.newCursorPosition!, processed.newCursorPosition!);
        });
      }
    }

    // Handle code snippet expansion on space or tab
    if ((key === ' ' || key === 'Tab') && isCodeMode && detectedLanguage) {
      const words = input.slice(0, cursorPosition).split(/\s+/);
      const lastWord = words[words.length - 1];
      
      if (lastWord && lastWord.length > 1) {
        const snippet = expandCodeSnippet(lastWord, detectedLanguage);
        if (snippet) {
          e.preventDefault();
          
          // Replace the trigger word with the snippet
          const beforeWord = input.slice(0, cursorPosition - lastWord.length);
          const afterCursor = input.slice(cursorPosition);
          
          // Simple snippet expansion (remove ${} placeholders for now)
          const expandedSnippet = snippet.replace(/\$\{\d+:?([^}]*)\}/g, '$1');
          const newText = beforeWord + expandedSnippet + afterCursor;
          
          const syntheticEvent = {
            target: { value: newText }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          
          handleInputChange(syntheticEvent);
          
          // Position cursor at first placeholder or end of snippet
          const newCursorPos = beforeWord.length + expandedSnippet.indexOf('// ');
          if (newCursorPos > beforeWord.length) {
            requestAnimationFrame(() => {
              textarea.setSelectionRange(newCursorPos, newCursorPos + 3); // Select "// "
            });
          }
        }
      }
    }
  }, [input, isLoading, hasImages, handleInputChange, isCodeMode, detectedLanguage]);

  // Determine tooltip message based on credit status
  const getWebSearchTooltipMessage = () => {
    if (activePreset) {
      return activePreset.webSearchEnabled 
        ? `Web search is enabled by "${activePreset.name}" preset`
        : `Web search is disabled by "${activePreset.name}" preset`;
    }
    if (isAnonymousUser) {
      return "Sign in and purchase credits to enable Web Search";
    }
    if (!hasEnoughCreditsForWebSearch) {
      return "Purchase credits to enable Web Search";
    }
    const effectiveWebSearchEnabled = getEffectiveWebSearchEnabled();
    return effectiveWebSearchEnabled ? 'Disable web search' : 'Enable web search';
  };



  return (
    <div className="w-full space-y-3">
      {/* Image Upload Interface */}
      {effectiveModelSupportsVision() && showImageUpload && (
        <div className="bg-card border border-border rounded-xl p-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            maxFiles={3 - images.length}
            disabled={isLoading || !canUploadMore}
            showDetailSelector={true}
          />
        </div>
      )}

      {/* Image Preview */}
      {hasImages && (
        <div className="bg-card border border-border rounded-xl p-3">
          <ImagePreview
            images={images}
            onRemove={handleImageRemove}
            maxWidth={120}
            maxHeight={120}
            className="mb-2"
          />
          <div className="text-xs text-muted-foreground">
            {images.length}/5 images • Click images to remove
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative w-full">
        <ShadcnTextarea
          ref={textareaRef}
          className={`resize-y bg-background/50 dark:bg-muted/50 backdrop-blur-sm w-full rounded-2xl px-4 py-4 border-input focus-visible:ring-ring placeholder:text-muted-foreground transition-all duration-300 ease-in-out ${
            isCodeMode 
              ? 'font-mono ring-2 ring-blue-500/20 border-blue-500/30 bg-blue-50/10 dark:bg-blue-950/10 text-sm leading-relaxed' 
              : 'font-sans text-base leading-normal'
          }`}
          value={input}
          autoFocus
          placeholder={hasImages ? "Describe these images or ask questions..." : "Send a message..."}
          onChange={handleEnhancedInputChange}
          onPaste={handlePaste}
          onKeyDown={handleEnhancedKeyDown}
          onBlur={(e) => {
            // Clean up code structure when user finishes editing
            if (isCodeMode && input.length > 50) {
              const cleaned = cleanupCodeStructure(input);
              if (cleaned !== input) {
                const syntheticEvent = {
                  target: { value: cleaned }
                } as React.ChangeEvent<HTMLTextAreaElement>;
                handleInputChange(syntheticEvent);
              }
            }
          }}
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            fontVariantLigatures: isCodeMode ? 'none' : 'normal',
            lineHeight: isCodeMode ? '1.6' : '1.5',
            whiteSpace: isCodeMode ? 'pre' : 'pre-wrap',
            wordBreak: isCodeMode ? 'normal' : 'break-word',
            overflowWrap: isCodeMode ? 'normal' : 'break-word',
            unicodeBidi: 'plaintext',
            tabSize: 2,
            // Enhanced text rendering for code
            ...(isCodeMode && {
              fontFeatureSettings: '"liga" 0, "calt" 0',
              textRendering: 'optimizeSpeed',
            })
          }}
        />
      
      {/* Cost visibility warning */}
      {isMounted && shouldShowCostWarning && (
        <div className="absolute top-2 right-4 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs px-2 py-1 rounded-full border border-amber-200 dark:border-amber-700/30">
                <AlertCircle className="h-3 w-3" />
                <span className="font-medium">{estimatedCost} credits</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              <div className="text-xs">
                <div>Estimated cost: {estimatedCost} credits</div>
                <div className="text-muted-foreground">Base: 1 credit + Web Search: {WEB_SEARCH_COST} credits</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Code mode indicator with auto-detection toggle */}
      {isCodeMode && (
        <div className={`absolute top-2 z-10 flex items-center gap-1 ${shouldShowCostWarning ? 'right-32' : 'right-4'}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-all duration-200 ${
                codeConfidence >= 80 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700/30'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/30'
              }`}>
                <Code2 className="h-3 w-3" />
                <span className="font-medium">
                  {detectedLanguage ? detectedLanguage.toUpperCase() : 'Code'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              <div className="text-xs">
                <div>
                  Code detected: {detectedLanguage || 'Generic'} 
                  <span className="text-muted-foreground ml-1">({codeConfidence}% confidence)</span>
                </div>
                <div className="text-muted-foreground">Smart input processing active</div>
                <div className="text-muted-foreground mt-1 text-[10px]">
                  • Auto-indentation • Bracket matching • Code cleanup
                </div>
                <div className="text-muted-foreground mt-1 text-[10px] border-t border-border/30 pt-1">
                  💡 Press <kbd className="bg-muted px-1 rounded text-[9px]">Ctrl+K</kbd> to wrap text in code blocks
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
          
          {/* Auto-detection toggle button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleAutoDetectionToggle}
                className={`flex items-center justify-center h-6 w-6 rounded-full border transition-all duration-200 ${
                  autoDetectionEnabled
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700/30 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                    : 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-900/30'
                }`}
              >
                {autoDetectionEnabled ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              <div className="text-xs">
                {autoDetectionEnabled 
                  ? 'Disable auto language detection'
                  : 'Enable auto language detection'
                }
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Auto-detection disabled indicator */}
      {!autoDetectionEnabled && !isCodeMode && input.length > 20 && (
        <div className={`absolute top-2 z-10 ${shouldShowCostWarning ? 'right-32' : 'right-4'}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleAutoDetectionToggle}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-all duration-200 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-900/30"
              >
                <EyeOff className="h-3 w-3" />
                <span className="font-medium">Auto-detect OFF</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              <div className="text-xs">
                <div>Language auto-detection is disabled</div>
                <div className="text-muted-foreground">Click to re-enable automatic code detection</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Auto-wrap feedback indicator */}
      {showAutoWrapFeedback && (
        <div className={`absolute top-2 z-10 ${
          shouldShowCostWarning && isCodeMode ? 'right-72' : 
          shouldShowCostWarning || isCodeMode || (!autoDetectionEnabled && input.length > 20) ? 'right-44' : 
          'right-4'
        }`}>
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs px-2.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-700/30 animate-in slide-in-from-right-2 duration-300">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Code auto-wrapped</span>
          </div>
        </div>
      )}

      {/* Auto-unwrap feedback indicator */}
      {showAutoUnwrapFeedback && (
        <div className={`absolute top-2 z-10 ${
          shouldShowCostWarning && isCodeMode ? 'right-72' : 
          shouldShowCostWarning || isCodeMode || (!autoDetectionEnabled && input.length > 20) ? 'right-44' : 
          'right-4'
        }`}>
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-700/30 animate-in slide-in-from-right-2 duration-300">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Code blocks removed</span>
          </div>
        </div>
      )}
      </div>

      {/* Control Bar - Unified for both mobile and desktop */}
      <div className="w-full bg-background/50 dark:bg-muted/50 backdrop-blur-sm rounded-xl border border-border p-2">
        <div className={`flex ${isMobileScreen ? 'flex-col gap-2' : 'items-center gap-2'}`}>
          {/* Left side controls - Stack on mobile */}
          <div className={`flex items-center gap-2 ${isMobileScreen ? 'w-full' : 'flex-1'}`}>
            <PresetSelector className={isMobileScreen ? "flex-1 min-w-0" : ""} />
            {/* Only show model picker when no preset is active */}
            {!activePreset && (
              <div className={isMobileScreen ? "flex-1 min-w-0" : ""}>
                <ModelPicker
                  setSelectedModel={setSelectedModel}
                  selectedModel={selectedModel}
                  onModelSelected={handleModelSelected}
                  disabled={false}
                />
              </div>
            )}
          </div>

          {/* Right side controls - Second row on mobile */}
          <div className={`flex items-center ${isMobileScreen ? 'w-full justify-between' : 'gap-2'}`}>
            {/* Action buttons group */}
            <div className="flex items-center gap-1.5">
              {/* Image Upload Button */}
              {effectiveModelSupportsVision() && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      disabled={isLoading || !canUploadMore}
                      className={`${
                        isMobileScreen ? 'h-8 w-8' : 'h-9 w-9'
                      } flex items-center justify-center rounded-full border transition-colors duration-150 ${
                        !canUploadMore
                          ? 'bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50'
                          : showImageUpload
                            ? 'bg-primary text-primary-foreground border-primary shadow'
                            : 'bg-background border-border text-muted-foreground hover:bg-accent'
                      } focus:outline-none focus:ring-2 focus:ring-primary/30`}
                    >
                      <ImageIcon className={isMobileScreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8}>
                    {showImageUpload ? 'Hide image upload' : 'Upload images'}
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Only show web search button when no preset is active and model supports it */}
              {isMounted && !activePreset && getEffectiveModel().startsWith("openrouter/") && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      ref={iconButtonRef}
                      aria-label={getEffectiveWebSearchEnabled() ? "Web search enabled" : "Web search disabled"}
                      onClick={handleWebSearchToggle}
                      disabled={!canUseWebSearch}
                      className={`${
                        isMobileScreen ? 'h-8 w-8' : 'h-9 w-9'
                      } flex items-center justify-center rounded-full border transition-colors duration-150 ${
                        !canUseWebSearch
                          ? 'bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50'
                          : getEffectiveWebSearchEnabled()
                            ? 'bg-primary text-primary-foreground border-primary shadow'
                            : 'bg-background border-border text-muted-foreground hover:bg-accent'
                      } focus:outline-none focus:ring-2 focus:ring-primary/30`}
                    >
                      <Globe className={isMobileScreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8}>
                    {getWebSearchTooltipMessage()}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Send/Stop Button - Grows on mobile */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type={isStreaming ? "button" : "submit"}
                  onClick={isStreaming ? stop : undefined}
                  disabled={(!isStreaming && !(input.trim() || hasImages)) || (isStreaming && status === "submitted")}
                  className={`${
                    isMobileScreen 
                      ? 'flex-1 h-8 px-3 text-sm' 
                      : 'px-3 h-9'
                  } rounded-full bg-primary hover:bg-primary/90 disabled:bg-muted/60 disabled:border disabled:border-border disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2`}
                >
                  {isStreaming ? (
                    <>
                      <Square className={isMobileScreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                      <span className={isMobileScreen ? 'text-xs font-medium' : 'text-sm'}>
                        Stop
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className={`${
                        isMobileScreen ? 'h-3.5 w-3.5' : 'h-4 w-4'
                      } ${(!isStreaming && !(input.trim() || hasImages)) ? 'text-muted-foreground' : 'text-primary-foreground'}`} />
                      <span className={isMobileScreen ? 'text-xs font-medium' : 'text-sm'}>
                        Send
                      </span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {isStreaming ? "Stop generation" : "Send message"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
