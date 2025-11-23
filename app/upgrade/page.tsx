'use client';

import { useAuth } from '@/hooks/useAuth';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, Sparkles, MessageSquare, Brain, Search, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function UpgradeContent() {
  const { user, isAuthenticated, isAnonymous, usageData, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasHandledError, setHasHandledError] = useState(false);
  
  // Get subscription type from context provider (which already fetches from API)
  const subscriptionType = usageData?.subscriptionType || null;

  // Handle OAuth errors and clean up URL parameters
  useEffect(() => {
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    const code = searchParams.get('code');
    
    // If there's an error parameter (like from OAuth state mismatch), clean up the URL
    if (error && !hasHandledError) {
      setHasHandledError(true);
      // Clear any stale OAuth state from sessionStorage
      sessionStorage.removeItem('pendingPlanSlug');
      
      // Clean up URL by removing error parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      console.log('OAuth error detected and cleaned up:', error);
    }
    
    // If there are OAuth callback parameters but no error, and user is not authenticated,
    // it might be a stale callback - clean it up
    if ((state || code) && !isAuthenticated && !isLoading && !hasHandledError) {
      // Wait a bit to see if auth completes, then clean up if still not authenticated
      const timeoutId = setTimeout(() => {
        if (!isAuthenticated) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          sessionStorage.removeItem('pendingPlanSlug');
        }
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams, hasHandledError, isAuthenticated, isLoading]);

  // Auto-proceed with checkout if user just signed in with a pending plan
  useEffect(() => {
    if (isAuthenticated && !isAnonymous && !isLoading) {
      const pendingPlanSlug = sessionStorage.getItem('pendingPlanSlug');
      if (pendingPlanSlug) {
        sessionStorage.removeItem('pendingPlanSlug');
        // Small delay to ensure auth state is fully updated
        setTimeout(() => {
          window.location.href = `/api/auth/checkout/${pendingPlanSlug}`;
        }, 100);
      }
    }
  }, [isAuthenticated, isAnonymous, isLoading]);

  const handleCheckout = async (planSlug: string) => {
    if (isAnonymous || !isAuthenticated) {
      try {
        // Clear any stale OAuth state before starting a new sign-in flow
        // This prevents issues when users navigate back and try again
        const url = new URL(window.location.href);
        if (url.searchParams.has('error') || url.searchParams.has('state') || url.searchParams.has('code')) {
          // Clean up URL parameters
          window.history.replaceState({}, '', '/upgrade');
        }
        
        // Store the plan slug to proceed with checkout after sign-in
        sessionStorage.setItem('pendingPlanSlug', planSlug);
        setHasHandledError(false); // Reset error handling flag for new attempt
        
        await signIn.social({
          provider: 'google',
          callbackURL: '/upgrade',
        });
      } catch (error) {
        console.error('Sign-in error:', error);
        // Clear pending plan on error to prevent stuck state
        sessionStorage.removeItem('pendingPlanSlug');
      }
    } else {
      // Better Auth will handle redirects and errors via errorUrl configuration
      window.location.href = `/api/auth/checkout/${planSlug}`;
    }
  };

  const handleManageSubscription = () => {
    window.location.href = '/api/portal';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-screen bg-background">
        <div className="w-full px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground">
              Select the subscription that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 w-full max-w-7xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-card border border-border rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-card-foreground mb-2">Monthly Plan</h2>
                {subscriptionType === 'monthly' && (
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">✓ Active</p>
                )}
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-card-foreground">$10</span>
                  <span className="text-xl text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">Billed monthly</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">1,000 messages per month</span>
                </li>
                <li className="flex items-start">
                  <Brain className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">Access to all models (premium + free)</span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">
                    Premium model access{' '}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 inline-block ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Access to GPT-5.1 Chat, Claude Sonnet 4.5, Grok 4.1 Fast, Gemini 3 Pro Preview, Kimi K2 Thinking, MiniMax M2, and GLM-4.6</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </li>
                <li className="flex items-start">
                  <Search className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">Web search capabilities</span>
                </li>
              </ul>

              {subscriptionType === 'monthly' ? (
                <Button onClick={handleManageSubscription} className="w-full" variant="default">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  onClick={() => handleCheckout('ai-usage')}
                  className="w-full"
                  disabled={isLoading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isAnonymous || !isAuthenticated ? 'Sign In to Subscribe' : 'Subscribe Now'}
                </Button>
              )}
            </div>

            {/* Yearly Plan */}
            <div className="bg-card border-2 border-primary rounded-lg shadow-lg p-8 relative">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                BEST VALUE
              </div>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-primary mr-2" />
                  <h2 className="text-2xl font-bold text-card-foreground">Yearly Plan</h2>
                </div>
                {subscriptionType === 'yearly' && (
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">✓ Active</p>
                )}
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-card-foreground">$10</span>
                  <span className="text-xl text-muted-foreground ml-2">/year</span>
                </div>
                <p className="text-muted-foreground mt-2">Save 92% vs monthly</p>
                <p className="text-sm text-muted-foreground mt-3 italic">
                  Perfect for everyday use: Brainstorm ideas, write emails, or explore with AI tools like maps & search
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground font-semibold">Unlimited messages</span>
                </li>
                <li className="flex items-start">
                  <Brain className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">
                    Unlimited chats with top free AI models{' '}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 inline-block ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Access to powerful free models like Grok 4.1 Fast, GPT-OSS-20B, Kimi K2, DeepSeek R1, GLM-4.5 Air, and more—no setup or extra fees needed</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">
                    Premium models available anytime{' '}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 inline-block ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Easy upgrade to monthly for GPT-5.1, Claude Sonnet 4.5, Grok 4.1 & more</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </li>
              </ul>

              {subscriptionType === 'yearly' ? (
                <Button onClick={handleManageSubscription} className="w-full" variant="default">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  onClick={() => handleCheckout('free-models-unlimited')}
                  className="w-full"
                  disabled={isLoading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isAnonymous || !isAuthenticated ? 'Sign In to Subscribe' : 'Subscribe Now'}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 w-full max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
              Free models power 80% of chats (smart, fast AI like writing helpers). Need heavy premium use? Monthly&apos;s your flex pass.
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Get started in seconds—no credit card needed for the first chat
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Already have a subscription?{' '}
              <button
                onClick={handleManageSubscription}
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                Manage your subscription
              </button>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Subscriptions can be canceled at any time. One subscription replaces the other.
            </p>
            <p className="text-sm text-muted-foreground">
              Have questions?{' '}
              <Link href="/faq" className="text-primary hover:text-primary/80 underline">
                Visit our FAQ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="h-full overflow-y-auto">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  );
}

