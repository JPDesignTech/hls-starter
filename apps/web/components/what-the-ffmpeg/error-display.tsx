'use client';

import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: string | Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  title?: string;
  retryLabel?: string;
  dismissible?: boolean;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className,
  title = 'Error',
  retryLabel = 'Retry',
  dismissible = false,
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;
  const isNetworkError = errorMessage.toLowerCase().includes('fetch') || 
                         errorMessage.toLowerCase().includes('network') ||
                         errorMessage.toLowerCase().includes('timeout');
  const isServerError = errorMessage.toLowerCase().includes('500') ||
                        errorMessage.toLowerCase().includes('server error');

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'Network error. Please check your connection and try again.';
    }
    if (isServerError) {
      return 'Server error. Please try again in a moment.';
    }
    return errorMessage;
  };

  return (
    <Alert 
      className={cn(
        "bg-red-500/20 border-red-500/50",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{getErrorMessage()}</p>
            {(onRetry ?? onDismiss) && (
              <div className="flex gap-2 mt-4">
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 hover:bg-red-500/20"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {retryLabel}
                  </Button>
                )}
                {onDismiss && dismissible && (
                  <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-500/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
