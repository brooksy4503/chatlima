'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpgradePage() {
  const { user, isAuthenticated, isAnonymous } = useAuth();
  const router = useRouter();
  const [subscriptionType, setSubscriptionType] = useState<'monthly' | 'yearly' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !isAnonymous && user?.id) {
      // Fetch subscription info
      fetch('/api/usage/messages')
        .then(res => res.json())
        .then(data => {
          setSubscriptionType(data.subscriptionType || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAnonymous, user]);

  const handleCheckout = (planSlug: string) => {
    if (isAnonymous || !isAuthenticated) {
      router.push('/api/auth/sign-in/google');
    } else {
      window.location.href = `/api/auth/checkout/${planSlug}`;
    }
  };

  const handleManageSubscription = () => {
    window.location.href = '/api/portal';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600">
              Select the subscription that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Monthly Plan</h2>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">$10</span>
                  <span className="text-xl text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mt-2">Billed monthly</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">1,000 messages per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Access to all models (premium + free)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Premium model access</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Web search capabilities</span>
                </li>
              </ul>

              {subscriptionType === 'monthly' ? (
                <Button onClick={handleManageSubscription} className="w-full" variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  onClick={() => handleCheckout('ai-usage')}
                  className="w-full"
                  disabled={loading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isAnonymous || !isAuthenticated ? 'Sign In to Subscribe' : 'Subscribe Now'}
                </Button>
              )}
            </div>

            {/* Yearly Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                BEST VALUE
              </div>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Yearly Plan</h2>
                </div>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">$10</span>
                  <span className="text-xl text-gray-600 ml-2">/year</span>
                </div>
                <p className="text-gray-600 mt-2">Save 92% vs monthly</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-semibold">Unlimited messages</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited access to free models</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">All OpenRouter :free models</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500 line-through">Premium models</span>
                  <span className="text-gray-600 ml-2 text-sm">(upgrade to monthly for access)</span>
                </li>
              </ul>

              {subscriptionType === 'yearly' ? (
                <Button onClick={handleManageSubscription} className="w-full" variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  onClick={() => handleCheckout('free-models-unlimited')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isAnonymous || !isAuthenticated ? 'Sign In to Subscribe' : 'Subscribe Now'}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Already have a subscription?{' '}
              <button
                onClick={handleManageSubscription}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Manage your subscription
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Subscriptions can be canceled at any time. One subscription replaces the other.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

