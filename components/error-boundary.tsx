"use client";

import React from 'react';
import { toast } from 'sonner';
import { RefreshCw, AlertCircle, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    errorInfo: React.ErrorInfo;
    resetError: () => void;
    errorId: string;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Note: Not showing toast here to avoid duplicate error messages
    // The chat component's error handling already shows appropriate toasts

    // Attempt auto-recovery after 5 seconds
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError();
    }, 5000);
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = () => {
    console.log('Resetting error boundary');
    
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });

    toast.success('Interface reset successfully', {
      position: 'top-center',
      duration: 3000
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            errorInfo={this.state.errorInfo!}
            resetError={this.resetError}
            errorId={this.state.errorId}
          />
        );
      }

      // Default fallback UI
      return <DefaultErrorFallback 
        error={this.state.error!}
        errorInfo={this.state.errorInfo!}
        resetError={this.resetError}
        errorId={this.state.errorId}
      />;
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ 
  error, 
  resetError, 
  errorId 
}: {
  error: Error;
  errorInfo: React.ErrorInfo;
  resetError: () => void;
  errorId: string;
}) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleReportError = () => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        toast.success('Error details copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy error details');
      });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. The interface will attempt to recover automatically, 
            or you can try the options below.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </button>
        </div>

        <details className="text-left">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            Technical Details
          </summary>
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              Error ID: {errorId}
            </p>
            <p className="text-xs font-mono text-foreground break-all">
              {error.message}
            </p>
            <button
              onClick={handleReportError}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Copy error details
            </button>
          </div>
        </details>

        <p className="text-xs text-muted-foreground">
          Auto-recovery in progress...
        </p>
      </div>
    </div>
  );
}

// Hook for using error boundary in functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError
  };
} 