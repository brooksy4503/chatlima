'use client';

import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface IOSInstallPromptProps {
  onDismiss?: () => void;
}

export function IOSInstallPrompt({ onDismiss }: IOSInstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const userAgent = navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isiOS);

    // Check if already running in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('chatlima-ios-install-dismissed');
    
    // Only show if: iOS Safari, not in standalone mode, not previously dismissed
    if (isiOS && !isStandaloneMode && !dismissed) {
      // Show after a short delay to ensure user has interacted with the page
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('chatlima-ios-install-dismissed', 'true');
    onDismiss?.();
  };

  const handleNeverShow = () => {
    setIsVisible(false);
    localStorage.setItem('chatlima-ios-install-dismissed', 'permanent');
    onDismiss?.();
  };

  if (!isVisible || !isIOS || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">CL</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Add to Home Screen</h3>
                <p className="text-xs text-muted-foreground">Quick access to ChatLima</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-4 border rounded flex items-center justify-center">1</span>
              <span>Tap the</span>
              <Share className="h-4 w-4" />
              <span>Share button below</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-4 border rounded flex items-center justify-center">2</span>
              <span>Select</span>
              <div className="flex items-center gap-1 px-1 py-0.5 bg-muted rounded text-xs">
                <Plus className="h-3 w-3" />
                <span>Add to Home Screen</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNeverShow}
              className="text-xs flex-1"
            >
              Don&apos;t show again
            </Button>
            <Button
              size="sm"
              onClick={handleDismiss}
              className="text-xs flex-1"
            >
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 