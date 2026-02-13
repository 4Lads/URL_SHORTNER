import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  timeout?: number; // Reset copied state after timeout (ms)
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for copying text to clipboard
 * Returns [copyToClipboard, isCopied, error]
 */
export const useClipboard = (options: UseClipboardOptions = {}) => {
  const { timeout = 2000, onSuccess, onError } = options;

  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copyToClipboard = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        const err = new Error('Clipboard API not supported');
        setError(err);
        onError?.(err);
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setError(null);
        onSuccess?.();

        // Reset copied state after timeout
        setTimeout(() => {
          setIsCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to copy');
        setError(error);
        setIsCopied(false);
        onError?.(error);
        return false;
      }
    },
    [timeout, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsCopied(false);
    setError(null);
  }, []);

  return {
    copyToClipboard,
    isCopied,
    error,
    reset,
  };
};
