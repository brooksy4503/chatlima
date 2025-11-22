'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';

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
  const { user, isAnonymous, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (isAnonymous || !isAuthenticated) {
      // Guide anonymous users to sign in first
      router.push('/api/auth/sign-in/google');
    } else {
      // Redirect authenticated users to the upgrade page
      router.push('/upgrade');
    }
  };

  return (
    <Button onClick={handleCheckout} className={className} variant={variant}>
      <CreditCard className="mr-2 h-4 w-4" />
      {children || (isAnonymous || !isAuthenticated ? 'Sign In to Purchase Credits' : 'Upgrade')}
    </Button>
  );
}; 