'use client';

import { useAuth } from '@/hooks/useAuth';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UpgradePage() {
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
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground">
              Select the subscription that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                  <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">1,000 messages per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">Access to all models (premium + free)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">Premium model access</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
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
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground font-semibold">Unlimited messages</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">Unlimited access to free models</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-card-foreground">All OpenRouter :free models</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground line-through">Premium models</span>
                  <span className="text-muted-foreground ml-2 text-sm">(upgrade to monthly for access)</span>
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

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Already have a subscription?{' '}
              <button
                onClick={handleManageSubscription}
                className="text-primary hover:text-primary/80 underline"
              >
                Manage your subscription
              </button>
            </p>
            <p className="text-sm text-muted-foreground">
              Subscriptions can be canceled at any time. One subscription replaces the other.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

