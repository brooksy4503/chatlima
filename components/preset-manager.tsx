'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePresets, type Preset, type CreatePresetData } from '@/lib/context/preset-context';
import { PRESET_TEMPLATES, getTemplateCategories, getTemplatesByCategory, type PresetTemplate } from '@/lib/preset-templates';
import { validatePresetParameters, getModelParameterConstraints } from '@/lib/parameter-validation';
import { type modelID, MODELS } from '@/ai/providers';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ModelPicker } from './model-picker';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Share, 
  Star, 
  Copy, 
  Download, 
  Loader2,
  AlertTriangle,
  Check,
  Info
} from 'lucide-react';
import { useModels } from '@/hooks/use-models';

interface PresetManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PresetFormData {
  name: string;
  modelId: modelID;
  systemInstruction: string;
  temperature: number;
  maxTokens: number;
  webSearchEnabled: boolean;
  webSearchContextSize: 'low' | 'medium' | 'high';
  isDefault: boolean;
}

export function PresetManager({ open, onOpenChange }: PresetManagerProps) {
  const {
    presets,
    activePreset,
    defaultPreset,
    loading,
    error,
    createPreset,
    createPresetFromTemplate,
    updatePreset,
    deletePreset,
    sharePreset,
    setDefaultPreset,
    setActivePreset
  } = usePresets();

  const { models, isLoading: modelsLoading } = useModels();

  // Helper function to get model info from dynamic models
  const getModelInfo = (modelId: string) => {
    return models.find(model => model.id === modelId);
  };

  // Helper function to get provider name
  const getModelProvider = (modelId: string): string => {
    const modelInfo = getModelInfo(modelId);
    return modelInfo?.provider || 'Unknown';
  };

  // Helper function to get model name
  const getModelName = (modelId: string): string => {
    const modelInfo = getModelInfo(modelId);
    return modelInfo?.name || modelId;
  };

  // Function to check if a model supports web search
  const supportsWebSearch = (modelId: string): boolean => {
    // OpenRouter models support web search (except specific exclusions)
    if (modelId.startsWith('openrouter/')) {
      // Specific exclusions
      if (modelId.includes('grok-3-beta') || modelId.includes('grok-3-mini-beta')) {
        return false;
      }
      return true;
    }
    
    // Requesty models do NOT support web search
    if (modelId.startsWith('requesty/')) {
      return false;
    }
    
    // For direct models, check the dynamic model details
    const modelInfo = getModelInfo(modelId);
    if (modelInfo?.supportsWebSearch !== undefined) {
      return modelInfo.supportsWebSearch;
    }
    
    // Default to true for other models
    return true;
  };

  // Helper function to get web search restriction message
  const getWebSearchRestrictionMessage = (modelId: string): string | null => {
    if (modelId.startsWith('requesty/')) {
      return 'Web search is not supported for Requesty models';
    }
    
    if (modelId.startsWith('openai/') && (modelId.includes('gpt-4.1') || modelId.includes('o4-mini'))) {
      return 'Web search is not supported for this OpenAI model';
    }
    
    return null;
  };

  // Helper function to format API route
  const formatApiRoute = (modelId: string) => {
    const parts = modelId.split('/');
    if (parts.length === 1) return 'Direct';
    const route = parts[0];
    switch (route) {
      case 'openrouter': return 'OpenRouter';
      case 'requesty': return 'Requesty';
      case 'anthropic': return 'Anthropic';
      case 'openai': return 'OpenAI';
      case 'groq': return 'Groq';
      case 'xai': return 'X.AI';
      default: return route.charAt(0).toUpperCase() + route.slice(1);
    }
  };

  // Helper function to get provider badge color
  const getProviderBadgeClass = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openrouter': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'requesty': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'anthropic': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'openai': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'groq': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'x.ai':
      case 'xai': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // State
  const [activeTab, setActiveTab] = useState<'list' | 'templates' | 'create' | 'edit'>('list');
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [templateNameHint, setTemplateNameHint] = useState<string | null>(null);
  const [formData, setFormData] = useState<PresetFormData>({
    name: '',
    modelId: 'openrouter/anthropic/claude-3.5-sonnet',
    systemInstruction: '',
    temperature: 1,
    maxTokens: 4096,
    webSearchEnabled: false,
    webSearchContextSize: 'medium',
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setActiveTab('list');
      setEditingPreset(null);
      setTemplateNameHint(null);
      setFormErrors([]);
      resetForm();
    }
  }, [open]);

  // Effect to disable web search when model doesn't support it
  useEffect(() => {
    if (!supportsWebSearch(formData.modelId) && formData.webSearchEnabled) {
      setFormData(prev => ({ ...prev, webSearchEnabled: false }));
    }
  }, [formData.modelId, formData.webSearchEnabled, supportsWebSearch]);

  // Reset form data
  const resetForm = () => {
    setTemplateNameHint(null);
    setFormData({
      name: '',
      modelId: 'openrouter/anthropic/claude-3.5-sonnet',
      systemInstruction: '',
      temperature: 1,
      maxTokens: 4096,
      webSearchEnabled: false,
      webSearchContextSize: 'medium',
      isDefault: false
    });
  };

  // Populate form for editing
  const startEdit = (preset: Preset) => {
    setEditingPreset(preset);
    setTemplateNameHint(null); // Clear template hint when editing existing preset
    const webSearchEnabled = preset.webSearchEnabled && supportsWebSearch(preset.modelId);
    
    setFormData({
      name: preset.name,
      modelId: preset.modelId,
      systemInstruction: preset.systemInstruction,
      temperature: preset.temperature,
      maxTokens: preset.maxTokens,
      webSearchEnabled: webSearchEnabled,
      webSearchContextSize: preset.webSearchContextSize,
      isDefault: preset.isDefault
    });
    setActiveTab('edit');
  };

  // Start creating from template
  const startCreateFromTemplate = (template: PresetTemplate) => {
    const webSearchEnabled = template.preset.webSearchEnabled && supportsWebSearch(template.preset.modelId);
    
    setTemplateNameHint(template.preset.name);
    setFormData({
      name: '', // Clear the name so user must provide their own
      modelId: template.preset.modelId,
      systemInstruction: template.preset.systemInstruction,
      temperature: template.preset.temperature,
      maxTokens: template.preset.maxTokens,
      webSearchEnabled: webSearchEnabled,
      webSearchContextSize: template.preset.webSearchContextSize,
      isDefault: template.preset.isDefault
    });
    setActiveTab('create');
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Preset name is required');
    }

    if (!formData.systemInstruction.trim()) {
      errors.push('System instruction is required');
    }

    // Validate web search configuration
    if (formData.webSearchEnabled && !supportsWebSearch(formData.modelId)) {
      errors.push(`Web search is not supported for ${formatApiRoute(formData.modelId)} models`);
    }

    // Check if models are still loading
    if (modelsLoading) {
      errors.push('Models are still loading, please wait...');
      setFormErrors(errors);
      return false;
    }

    // Validate parameters
    const modelInfo = getModelInfo(formData.modelId) || null;
    
    // If we can't find the model info even after loading is complete, warn the user
    if (!modelInfo) {
      console.warn(`Model info not found for ${formData.modelId}, available models:`, models.map(m => m.id));
      errors.push(`Model information not available for ${formData.modelId}. Please try refreshing or selecting a different model.`);
    }
    
    const validation = validatePresetParameters(
      modelInfo,
      formData.temperature,
      formData.maxTokens,
      formData.systemInstruction
    );

    if (!validation.valid) {
      errors.push(...validation.errors);
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setFormErrors([]);

      const submitData: CreatePresetData = {
        name: formData.name,
        modelId: formData.modelId,
        systemInstruction: formData.systemInstruction,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        webSearchEnabled: formData.webSearchEnabled,
        webSearchContextSize: formData.webSearchContextSize,
        isDefault: formData.isDefault
      };

      if (editingPreset) {
        await updatePreset(editingPreset.id, submitData);
      } else {
        await createPreset(submitData);
      }

      // Reset and close
      resetForm();
      setEditingPreset(null);
      setActiveTab('list');
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : 'Failed to save preset']);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle template creation
  const handleCreateFromTemplate = (template: PresetTemplate) => {
    // Instead of auto-creating with numbered names, open the create form
    // pre-filled with template data so user can customize name and settings
    startCreateFromTemplate(template);
  };

  // Handle preset deletion
  const handleDelete = async (preset: Preset) => {
    if (!confirm(`Are you sure you want to delete "${preset.name}"?`)) return;

    try {
      await deletePreset(preset.id);
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : 'Failed to delete preset']);
    }
  };

  // Handle sharing
  const handleShare = async (preset: Preset) => {
    try {
      const shareUrl = await sharePreset(preset.id);
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      alert('Failed to generate share link');
    }
  };

  // Handle setting as default
  const handleSetDefault = async (preset: Preset) => {
    try {
      await setDefaultPreset(preset.id);
    } catch (error) {
      alert('Failed to set as default');
    }
  };

  // Get model constraints for current selection
  const selectedModelInfo = getModelInfo(formData.modelId) || null;
  const modelConstraints = useMemo(() => {
    // If models are still loading, show reasonable defaults that don't restrict too much
    if (modelsLoading) {
      return {
        temperature: { min: 0, max: 2, default: 1 },
        maxTokens: { min: 1, max: 200000, default: 4096 }, // Use a high max to avoid false restrictions
        supportsSystemInstruction: true,
        maxSystemInstructionLength: 50000
      };
    }
    return getModelParameterConstraints(selectedModelInfo);
  }, [selectedModelInfo, modelsLoading]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl max-h-[90vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            Preset Manager
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="list" className="text-xs sm:text-sm px-2 py-2">My Presets</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm px-2 py-2">Templates</TabsTrigger>
            <TabsTrigger value="create" className="text-xs sm:text-sm px-2 py-2">Create New</TabsTrigger>
            <TabsTrigger value="edit" disabled={!editingPreset} className="text-xs sm:text-sm px-2 py-2">Edit</TabsTrigger>
          </TabsList>

          {/* Error Display */}
          {(error || formErrors.length > 0) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {error || formErrors.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* My Presets Tab */}
          <TabsContent value="list" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold">Your Presets ({presets.length})</h3>
              <Button 
                onClick={() => {
                  resetForm();
                  setActiveTab('create');
                }}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Preset
              </Button>
            </div>

            <ScrollArea className="h-[350px] sm:h-[400px]">
              <div className="space-y-3">
                {presets.map((preset) => (
                  <Card key={preset.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-wrap">
                            <span className="truncate">{preset.name}</span>
                            {preset.isDefault && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {activePreset?.id === preset.id && (
                              <Badge variant="default" className="text-xs shrink-0">
                                Active
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getProviderBadgeClass(getModelProvider(preset.modelId))}`}>
                              {getModelProvider(preset.modelId)}
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="hover:underline cursor-help truncate">
                                    {getModelName(preset.modelId)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs font-mono">Model ID: {preset.modelId}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0 overflow-x-auto sm:overflow-visible">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setActivePreset(preset)}
                            title="Use this preset"
                            className="h-8 w-8 shrink-0"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => startEdit(preset)}
                            title="Edit preset"
                            className="h-8 w-8 shrink-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleShare(preset)}
                            title="Share preset"
                            className="h-8 w-8 shrink-0"
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                          {!preset.isDefault && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleSetDefault(preset)}
                              title="Set as default"
                              className="h-8 w-8 shrink-0"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(preset)}
                            title="Delete preset"
                            className="h-8 w-8 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                        <div>
                          <span className="font-medium">API Route:</span> {formatApiRoute(preset.modelId)}
                        </div>
                        <div>
                          <span className="font-medium">Temperature:</span> {preset.temperature}
                        </div>
                        <div>
                          <span className="font-medium">Max Tokens:</span> {preset.maxTokens}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Web Search:</span> 
                          <span>{preset.webSearchEnabled ? 'Enabled' : 'Disabled'}</span>
                          {preset.webSearchEnabled && !supportsWebSearch(preset.modelId) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Issue
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Web search is enabled but not supported by this model</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="font-medium text-sm">System Instruction:</span>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {preset.systemInstruction}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {presets.length === 0 && !loading && (
                  <Card className="text-center py-8">
                    <CardContent>
                      <p className="text-muted-foreground">No presets yet.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => {
                          resetForm();
                          setActiveTab('templates');
                        }}
                        variant="outline"
                      >
                        Browse Templates
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-semibold">Preset Templates</h3>
            </div>

            <ScrollArea className="h-[350px] sm:h-[400px]">
              <div className="space-y-6">
                {getTemplateCategories().map((category) => (
                  <div key={category}>
                    <h4 className="font-medium mb-3 capitalize">{category}</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {getTemplatesByCategory(category).map((template) => (
                        <Card key={template.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                              <span className="text-lg shrink-0">{template.icon}</span>
                              <span className="truncate">{template.name}</span>
                            </CardTitle>
                            <CardDescription className="text-sm">{template.description}</CardDescription>
                          </CardHeader>
                          
                          <CardContent className="pt-2">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getProviderBadgeClass(getModelProvider(template.preset.modelId))}`}>
                                  {getModelProvider(template.preset.modelId)}
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="hover:underline cursor-help truncate">
                                        {getModelName(template.preset.modelId)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs font-mono">Model ID: {template.preset.modelId}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="flex gap-1.5 w-full">
                                <Button 
                                  size="sm"
                                  className="flex-1 text-xs px-2 py-1 h-7"
                                  onClick={() => handleCreateFromTemplate(template)}
                                >
                                  Use Template
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Create/Edit Form Tabs */}
          {(activeTab === 'create' || activeTab === 'edit') && (
            <TabsContent value={activeTab} className="space-y-4">
              <ScrollArea className="h-[350px] sm:h-[400px] pr-2 sm:pr-4">
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Preset Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={templateNameHint ? `Based on "${templateNameHint}"` : "My Custom Preset"}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <ModelPicker
                        selectedModel={formData.modelId}
                        setSelectedModel={(modelId) => setFormData(prev => ({ ...prev, modelId }))}
                        disabled={false}
                      />
                    </div>
                  </div>

                  {/* System Instruction */}
                  <div className="space-y-2">
                    <Label htmlFor="systemInstruction">System Instruction</Label>
                    <Textarea
                      id="systemInstruction"
                      value={formData.systemInstruction}
                      onChange={(e) => setFormData(prev => ({ ...prev, systemInstruction: e.target.value }))}
                      placeholder="You are a helpful assistant..."
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.systemInstruction.length} / {modelConstraints.maxSystemInstructionLength} characters
                    </p>
                  </div>

                  {/* Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">
                        Temperature ({modelConstraints.temperature.min} - {modelConstraints.temperature.max})
                      </Label>
                      <Input
                        id="temperature"
                        type="number"
                        min={modelConstraints.temperature.min}
                        max={modelConstraints.temperature.max}
                        step={0.1}
                        value={formData.temperature}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">
                        Max Tokens ({modelConstraints.maxTokens.min} - {modelConstraints.maxTokens.max})
                      </Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        min={modelConstraints.maxTokens.min}
                        max={modelConstraints.maxTokens.max}
                        value={formData.maxTokens}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  {/* Web Search Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="webSearch"
                        checked={formData.webSearchEnabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, webSearchEnabled: checked }))}
                        disabled={!supportsWebSearch(formData.modelId)}
                      />
                      <Label 
                        htmlFor="webSearch" 
                        className={!supportsWebSearch(formData.modelId) ? 'text-muted-foreground' : ''}
                      >
                        Enable Web Search
                      </Label>
                      {getWebSearchRestrictionMessage(formData.modelId) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{getWebSearchRestrictionMessage(formData.modelId)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    {/* Show restriction message below the switch */}
                    {getWebSearchRestrictionMessage(formData.modelId) && (
                      <div className="ml-6 text-sm text-muted-foreground flex items-center gap-2">
                        <Info className="h-4 w-4 shrink-0" />
                        <span>{getWebSearchRestrictionMessage(formData.modelId)}</span>
                      </div>
                    )}
                    
                    {formData.webSearchEnabled && supportsWebSearch(formData.modelId) && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="webSearchContext">Context Size</Label>
                        <Select 
                          value={formData.webSearchContextSize} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, webSearchContextSize: value as any }))}
                        >
                          <SelectTrigger className="w-full sm:w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Default Setting */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                    />
                    <Label htmlFor="isDefault">Set as default preset</Label>
                  </div>

                  {/* Form Actions */}
                  <Separator />
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        resetForm();
                        setEditingPreset(null);
                        setActiveTab('list');
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitting || modelsLoading}
                      className="w-full sm:w-auto"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : modelsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {modelsLoading ? 'Loading Models...' : editingPreset ? 'Update Preset' : 'Create Preset'}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}