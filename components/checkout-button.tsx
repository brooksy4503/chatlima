'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { signIn } from '@/lib/auth-client';

interface CheckoutButtonProps {
  planSlug?: 'ai-usage' | 'free-models-unlimited';
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
}

export const CheckoutButton = ({ 
  planSlug = 'ai-usage', 
  children,
  className = 'w-full',
  variant = 'default'
}: CheckoutButtonProps) => {
  const { isAnonymous, isAuthenticated } = useAuth();

  const handleCheckout = async () => {
    if (isAnonymous || !isAuthenticated) {
      try {
        // Store the plan slug to proceed with checkout after sign-in
        sessionStorage.setItem('pendingPlanSlug', planSlug);
        
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
      // Redirect authenticated users directly to checkout for the specified plan
      window.location.href = `/api/auth/checkout/${planSlug}`;
    }
  };

  return (
    <Button onClick={handleCheckout} className={className} variant={variant}>
      <CreditCard className="mr-2 h-4 w-4" />
      {children || (isAnonymous || !isAuthenticated ? 'Sign In to Purchase Credits' : 'Upgrade')}
    </Button>
  );
}; 