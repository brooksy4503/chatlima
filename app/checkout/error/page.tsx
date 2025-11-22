import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CheckoutErrorPageProps {
  searchParams: {
    reason?: string;
    checkout_id?: string;
  };
}

export default function CheckoutErrorPage({ searchParams }: CheckoutErrorPageProps) {
  const { reason, checkout_id } = searchParams;
  
  const getErrorMessage = (reason?: string) => {
    switch (reason) {
      case 'canceled':
        return {
          title: 'Checkout Canceled',
          description: 'You canceled the payment process.',
          suggestion: 'No worries! You can try again whenever you\'re ready.'
        };
      case 'failed':
        return {
          title: 'Checkout Failed',
          description: 'There was an issue creating your checkout session.',
          suggestion: 'This may be due to a configuration issue. Please try again or contact support.'
        };
      default:
        return {
          title: 'Checkout Error',
          description: 'Something went wrong during the checkout process.',
          suggestion: 'Please try again or contact support if the issue persists.'
        };
    }
  };

  const errorInfo = getErrorMessage(reason);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle size={48} className="text-red-500" />
          </div>
          <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
          <CardDescription>
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">
            {errorInfo.suggestion}
          </p>
          {checkout_id && (
            <p className="text-xs text-muted-foreground border-t pt-4">
              Reference ID: {checkout_id}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/" className="w-full">
            <Button variant="default" size="lg" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Chat
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={() => window.location.href = '/api/auth/checkout/ai-usage'}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 