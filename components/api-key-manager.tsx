import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, Eye, EyeOff } from "lucide-react";

// API key configuration
interface ApiKeyConfig {
  name: string;
  key: string;
  storageKey: string;
  label: string;
  placeholder: string;
}

// Available API keys configuration
const API_KEYS_CONFIG: ApiKeyConfig[] = [
  {
    name: "OpenAI",
    key: "openai",
    storageKey: "OPENAI_API_KEY",
    label: "OpenAI API Key",
    placeholder: "sk-..."
  },
  {
    name: "Anthropic",
    key: "anthropic",
    storageKey: "ANTHROPIC_API_KEY",
    label: "Anthropic API Key",
    placeholder: "sk-ant-..."
  },
  {
    name: "Groq",
    key: "groq",
    storageKey: "GROQ_API_KEY",
    label: "Groq API Key",
    placeholder: "gsk_..."
  },
  {
    name: "XAI",
    key: "xai",
    storageKey: "XAI_API_KEY",
    label: "XAI API Key",
    placeholder: "xai-..."
  },
  {
    name: "Openrouter",
    key: "openrouter",
    storageKey: "OPENROUTER_API_KEY",
    label: "Openrouter API Key",
    placeholder: "sk-or-..."
  },
  {
    name: "Requesty",
    key: "requesty", 
    storageKey: "REQUESTY_API_KEY",
    label: "Requesty API Key",
    placeholder: "req-..."
  }
];

interface ApiKeyManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyManager({ open, onOpenChange }: ApiKeyManagerProps) {
  // State to store API keys
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Load API keys from localStorage on initial mount
  useEffect(() => {
    const storedKeys: Record<string, string> = {};
    
    API_KEYS_CONFIG.forEach(config => {
      const value = localStorage.getItem(config.storageKey);
      if (value) {
        storedKeys[config.key] = value;
      }
    });
    
    setApiKeys(storedKeys);
  }, []);

  // Update API key in state
  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Toggle visibility of API key
  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Save API keys to localStorage
  const handleSaveApiKeys = () => {
    try {
      API_KEYS_CONFIG.forEach(config => {
        const value = apiKeys[config.key];
        
        if (value && value.trim()) {
          localStorage.setItem(config.storageKey, value.trim());
        } else {
          localStorage.removeItem(config.storageKey);
        }
      });
      
      toast.success("API keys saved successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast.error("Failed to save API keys");
    }
  };

  // Clear all API keys
  const handleClearApiKeys = () => {
    try {
      API_KEYS_CONFIG.forEach(config => {
        localStorage.removeItem(config.storageKey);
      });
      
      setApiKeys({});
      toast.success("All API keys cleared");
    } catch (error) {
      console.error("Error clearing API keys:", error);
      toast.error("Failed to clear API keys");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md lg:max-w-[500px] p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base sm:text-lg font-semibold">
                API Key Settings
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Enter your own API keys for different AI providers. Keys are stored securely in your browser's local storage.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[40vh] sm:max-h-[50vh] overflow-y-auto space-y-3 sm:space-y-4 py-2 sm:py-4 pr-2">
          {API_KEYS_CONFIG.map(config => (
            <div key={config.key} className="space-y-1.5 sm:space-y-2">
              <Label 
                htmlFor={config.key}
                className="text-xs sm:text-sm font-medium"
              >
                {config.label}
              </Label>
              <div className="relative">
                <Input
                  id={config.key}
                  type={showKeys[config.key] ? "text" : "password"}
                  value={apiKeys[config.key] || ""}
                  onChange={(e) => handleApiKeyChange(config.key, e.target.value)}
                  placeholder={config.placeholder}
                  className="text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => toggleKeyVisibility(config.key)}
                >
                  {showKeys[config.key] ? (
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
          <Button
            variant="destructive"
            onClick={handleClearApiKeys}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            Clear All Keys
          </Button>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveApiKeys}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              Save Keys
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 