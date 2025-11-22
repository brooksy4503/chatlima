'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type PurchaseType = 'credits' | 'subscription' | 'yearly' | 'monthly' | null;

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isAnonymous } = useAuth();
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First, try to get purchase type from query parameters
    const typeParam = searchParams.get('type');
    const productSlug = searchParams.get('product_slug');
    const checkoutId = searchParams.get('checkout_id');

    // Determine purchase type from query params
    if (typeParam) {
      setPurchaseType(typeParam as PurchaseType);
      setLoading(false);
      return;
    }

    // Check product slug
    if (productSlug === 'free-models-unlimited') {
      setPurchaseType('yearly');
      setLoading(false);
      return;
    } else if (productSlug === 'ai-usage') {
      // ai-usage could be credits OR monthly subscription
      // We'll check subscription status to determine
    }

    // If no type param, try to infer from user's subscription status
    if (isAuthenticated && !isAnonymous && user?.id) {
      fetch('/api/usage/messages')
        .then(res => res.json())
        .then(data => {
          const subscriptionType = data.subscriptionType;
          if (subscriptionType === 'yearly') {
            setPurchaseType('yearly');
          } else if (subscriptionType === 'monthly') {
            setPurchaseType('monthly');
          } else {
            // No subscription, assume credits purchase
            setPurchaseType('credits');
          }
          setLoading(false);
        })
        .catch(() => {
          // On error, default to credits (backward compatibility)
          setPurchaseType('credits');
          setLoading(false);
        });
    } else {
      // Not authenticated or anonymous, default to credits
      setPurchaseType('credits');
      setLoading(false);
    }
  }, [searchParams, isAuthenticated, isAnonymous, user]);

  const getPurchaseMessage = () => {
    switch (purchaseType) {
      case 'yearly':
        return {
          title: 'Subscription Activated!',
          description: 'Your yearly subscription has been activated successfully.',
          message: 'You now have unlimited access to free models. Your subscription is active and ready to use.',
          subMessage: 'It may take a moment for your subscription to fully activate.',
        };
      case 'monthly':
        return {
          title: 'Subscription Activated!',
          description: 'Your monthly subscription has been activated successfully.',
          message: 'You now have access to 1,000 messages per month and all premium features.',
          subMessage: 'It may take a moment for your subscription to fully activate.',
        };
      case 'subscription':
        return {
          title: 'Subscription Activated!',
          description: 'Your subscription has been activated successfully.',
          message: 'Your subscription is active and ready to use.',
          subMessage: 'It may take a moment for your subscription to fully activate.',
        };
      case 'credits':
      default:
        return {
          title: 'Payment Successful!',
          description: 'Thank you for your purchase',
          message: 'Your AI credits have been added to your account and are ready to use.',
          subMessage: 'It may take a moment for your credits to appear in your account.',
        };
    }
  };

  const purchaseInfo = getPurchaseMessage();

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {purchaseType === 'yearly' ? (
              <Sparkles size={48} className="text-blue-500" />
            ) : (
              <CheckCircle size={48} className="text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">{purchaseInfo.title}</CardTitle>
          <CardDescription>
            {purchaseInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {loading ? (
            <p className="mb-4 text-muted-foreground">Loading...</p>
          ) : (
            <>
              <p className="mb-4">
                {purchaseInfo.message}
              </p>
              <p className="text-sm text-muted-foreground">
                {purchaseInfo.subMessage}
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button size="lg">
              Return to Chat
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 