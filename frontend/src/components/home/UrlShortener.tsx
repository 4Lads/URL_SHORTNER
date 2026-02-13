import React, { useState } from 'react';
import { Input, Button, Card } from '../common';
import { useClipboard } from '../../hooks/useClipboard';
import { urlService } from '../../services/url.service';
import toast from 'react-hot-toast';

interface ShortenedResult {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
}

export const UrlShortener: React.FC = () => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [result, setResult] = useState<ShortenedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { copyToClipboard } = useClipboard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validation
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setIsLoading(true);

    try {
      const data = await urlService.shorten(
        url.trim(),
        customAlias.trim() || undefined
      );

      setResult({
        shortCode: data.data.shortCode,
        shortUrl: data.data.shortUrl,
        originalUrl: data.data.originalUrl,
      });

      toast.success('Short URL created! 🎉');

      // Clear form
      setUrl('');
      setCustomAlias('');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create short URL';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      copyToClipboard(result.shortUrl);
      toast.success('Copied to clipboard! 📋');
    }
  };

  const handleReset = () => {
    setResult(null);
    setUrl('');
    setCustomAlias('');
    setError('');
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/30 to-transparent dark:via-primary-900/10 -z-10" />

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">
            Try It Now
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Shorten your first URL in seconds. No signup required.
          </p>
        </div>

        {/* Main Card with Glassmorphism */}
        <Card variant="glass" className="p-8 sm:p-10">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Input */}
              <div>
                <Input
                  label="Enter your long URL"
                  type="url"
                  name="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url-that-needs-shortening"
                  error={error}
                  disabled={isLoading}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  }
                />
              </div>

              {/* Custom Alias Input (Optional) */}
              <div>
                <Input
                  label="Custom alias (optional)"
                  type="text"
                  name="customAlias"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="my-custom-link"
                  helperText="Create a memorable custom short link"
                  disabled={isLoading}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  }
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
              >
                {isLoading ? 'Creating...' : 'Shorten URL'}
              </Button>

              {/* Privacy Note */}
              <p className="text-xs text-center text-neutral-500 dark:text-neutral-500">
                By shortening a URL, you agree to our Terms of Service and Privacy Policy.
                Your link will be publicly accessible.
              </p>
            </form>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              {/* Success Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                  <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Your Short URL is Ready! 🎉
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Share it anywhere and track its performance
                </p>
              </div>

              {/* Short URL Display */}
              <div className="relative">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-2 border-primary-200 dark:border-primary-800">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      Your short URL
                    </div>
                    <a
                      href={result.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-mono font-semibold text-primary-600 dark:text-primary-400 hover:underline truncate block"
                    >
                      {result.shortUrl}
                    </a>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleCopy}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Original URL */}
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Original URL
                </div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                  {result.originalUrl}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={handleReset}
                >
                  Shorten Another
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => window.open(result.shortUrl, '_blank')}
                >
                  Test Link →
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};
