'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, ArrowLeft, Copy, Check } from 'lucide-react';
import { usePresets } from '@/lib/context/preset-context';
import { useModels } from '@/hooks/use-models';
import { toast } from 'sonner';

interface SharedPreset {
  id: string;
  name: string;
  modelId: string;
  systemInstruction: string;
  temperature: number;
  maxTokens: number;
  webSearchEnabled: boolean;
  webSearchContextSize: 'low' | 'medium' | 'high';
  shareId: string;
  visibility: 'shared';
  createdAt: string;
}

export default function SharedPresetPage() {
  const params = useParams();
  const router = useRouter();
  const { importSharedPreset } = usePresets();
  const { models } = useModels();
  
  const [preset, setPreset] = useState<SharedPreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareId = params.shareId as string;

  // Helper function to get model info
  const getModelInfo = (modelId: string) => {
    return models.find(model => model.id === modelId);
  };

  // Helper function to get model name
  const getModelName = (modelId: string) => {
    const modelInfo = getModelInfo(modelId);
    return modelInfo?.name || modelId;
  };

  // Helper function to get provider name
  const getModelProvider = (modelId: string): string => {
    const modelInfo = getModelInfo(modelId);
    return modelInfo?.provider || 'Unknown';
  };

  // Load shared preset
  useEffect(() => {
    const loadSharedPreset = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/presets/shared/${shareId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('This shared preset is no longer available or has been removed.');
          } else {
            setError('Failed to load shared preset. Please try again.');
          }
          return;
        }

        const data = await response.json();
        setPreset(data);
      } catch (error) {
        console.error('Error loading shared preset:', error);
        setError('Failed to load shared preset. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      loadSharedPreset();
    }
  }, [shareId]);

  // Handle import
  const handleImport = async () => {
    if (!preset) return;

    try {
      setImporting(true);
      await importSharedPreset(shareId);
      toast.success('Preset imported successfully!');
      router.push('/'); // Redirect to home page
    } catch (error) {
      console.error('Error importing preset:', error);
      toast.error('Failed to import preset. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading shared preset...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Preset Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!preset) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Shared Preset</h1>
            <p className="text-muted-foreground">Import this preset to your collection</p>
          </div>
        </div>

        {/* Preset Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl">{preset.name}</CardTitle>
                <CardDescription className="mt-2">
                  A shared preset from ChatLima
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Model Info */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{getModelProvider(preset.modelId)}</Badge>
              <span className="text-sm text-muted-foreground">{getModelName(preset.modelId)}</span>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Temperature</label>
                <p className="text-sm">{preset.temperature}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Max Tokens</label>
                <p className="text-sm">{preset.maxTokens.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Web Search</label>
                <p className="text-sm">{preset.webSearchEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>

            {/* System Instruction */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">System Instruction</label>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{preset.systemInstruction}</p>
              </div>
            </div>

            {/* Import Button */}
            <div className="pt-4">
              <Button
                onClick={handleImport}
                disabled={importing}
                className="w-full"
                size="lg"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import Preset
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 