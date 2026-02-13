import React, { useEffect, useState } from 'react';
import { UrlCard, UrlData } from './UrlCard';
import { LoadingSpinner } from '../common';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useUrlStore } from '../../store/urlStore';

interface UrlListProps {
  onEdit: (url: UrlData) => void;
  onDelete: (url: UrlData) => void;
  onGenerateQR: (url: UrlData) => void;
}

export const UrlList: React.FC<UrlListProps> = ({ onEdit, onDelete, onGenerateQR }) => {
  const { urls, isLoading, pagination, fetchUrls } = useUrlStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchUrls();
  }, []);

  const filteredUrls = urls.filter((url) => {
    // Filter by status
    if (filterStatus === 'active' && !url.isActive) return false;
    if (filterStatus === 'inactive' && url.isActive) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        url.shortCode.toLowerCase().includes(query) ||
        url.originalUrl.toLowerCase().includes(query) ||
        url.title?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by title, URL, or short code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-neutral-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Links</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        Showing {filteredUrls.length} of {urls.length} links
      </div>

      {/* URL list */}
      {filteredUrls.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-2">
            No links found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first short link to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUrls.map((url) => (
            <UrlCard
              key={url.id}
              url={url}
              onEdit={onEdit}
              onDelete={onDelete}
              onGenerateQR={onGenerateQR}
            />
          ))}
        </div>
      )}

      {/* Pagination (if needed) */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => fetchUrls(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => fetchUrls(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
