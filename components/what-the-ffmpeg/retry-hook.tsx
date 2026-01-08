'use client';

import * as React from 'react';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

export function useRetry<T>(
  asyncFn: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    onSuccess,
    onFailure,
  } = options;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<T | null>(null);
  const [attempt, setAttempt] = React.useState(0);

  const execute = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    let currentAttempt = 0;

    while (currentAttempt <= maxRetries) {
      try {
        if (currentAttempt > 0) {
          onRetry?.(currentAttempt);
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, currentAttempt - 1))
          );
        }

        const result = await asyncFn();
        setData(result);
        setError(null);
        setAttempt(0);
        setLoading(false);
        onSuccess?.();
        return result;
      } catch (err) {
        currentAttempt++;
        setAttempt(currentAttempt);
        
        if (currentAttempt > maxRetries) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setLoading(false);
          onFailure?.(error);
          throw error;
        }
      }
    }
  }, [asyncFn, maxRetries, retryDelay, onRetry, onSuccess, onFailure]);

  const reset = React.useCallback(() => {
    setError(null);
    setData(null);
    setAttempt(0);
    setLoading(false);
  }, []);

  return {
    execute,
    reset,
    loading,
    error,
    data,
    attempt,
    canRetry: attempt < maxRetries,
  };
}
