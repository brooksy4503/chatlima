'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';

export const CheckoutButton = () => {
  const { user, isAnonymous, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (isAnonymous || !isAuthenticated) {
      // Guide anonymous users to sign in first
      router.push('/api/auth/sign-in/google');
    } else {
      // Redirect authenticated users to the Polar checkout page
      // The slug 'ai-usage' must match the one defined in lib/auth.ts
      window.location.href = '/api/auth/checkout/ai-usage';
    }
  };

  return (
    <Button onClick={handleCheckout} className="w-full">
      <CreditCard className="mr-2 h-4 w-4" />
      {isAnonymous || !isAuthenticated ? 'Sign In to Purchase Credits' : 'Purchase More Credits'}
    </Button>
  );
}; 