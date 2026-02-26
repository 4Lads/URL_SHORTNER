import React, { useState } from 'react';
import { Card } from '../common';
import {
  ClipboardDocumentIcon,
  QrCodeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export interface UrlData {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  title?: string;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface UrlCardProps {
  url: UrlData;
  onEdit: (url: UrlData) => void;
  onDelete: (url: UrlData) => void;
  onGenerateQR: (url: UrlData) => void;
}

export const UrlCard: React.FC<UrlCardProps> = ({
  url,
  onEdit,
  onDelete,
  onGenerateQR,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

  return (
    <Card variant="elevated" className="hover-lift transition-all duration-300">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title or Original URL */}
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate">
              {url.title || 'Untitled Link'}
            </h3>

            {/* Short URL with copy button */}
            <div className="mt-1 flex items-center gap-2">
              <code className="text-sm font-mono text-primary-600 dark:text-primary-400">
                {url.shortUrl}
              </code>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Copy link"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4 text-neutral-500" />
                )}
              </button>
            </div>

            {/* Original URL */}
            <a
              href={url.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 truncate block"
              title={url.originalUrl}
            >
              {url.originalUrl}
            </a>
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0 ml-4">
            {isExpired ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            ) : url.isActive ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1">
            <ChartBarIcon className="h-4 w-4" />
            <span className="font-medium">{url.clickCount.toLocaleString()}</span>
            <span>clicks</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Created {formatDate(url.createdAt)}</span>
          </div>
          {url.expiresAt && !isExpired && (
            <div className="flex items-center gap-1">
              <span>Expires {formatDate(url.expiresAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => navigate(`/analytics/${url.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChartBarIcon className="h-4 w-4" />
            Analytics
          </button>

          <button
            onClick={() => onGenerateQR(url)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <QrCodeIcon className="h-4 w-4" />
            QR Code
          </button>

          <button
            onClick={() => onEdit(url)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </button>

          <button
            onClick={() => onDelete(url)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </Card>
  );
};
