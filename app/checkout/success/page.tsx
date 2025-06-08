import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Your AI credits have been added to your account and are ready to use.
          </p>
          <p className="text-sm text-muted-foreground">
            It may take a moment for your credits to appear in your account.
          </p>
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