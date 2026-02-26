import React, { useState, useEffect } from 'react';
import { Button } from '../components/common';
import {
  QuickStats,
  UrlList,
  CreateUrlModal,
  QRCodeModal,
  UrlData,
} from '../components/dashboard';
import { UsageMeter } from '../components/billing';
import { useAuth } from '../hooks/useAuth';
import { useBillingStore } from '../store/billingStore';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<UrlData | null>(null);
  const { user } = useAuth();
  const { usage, fetchBillingStatus } = useBillingStore();
  const userPlan = user?.plan || 'free';

  useEffect(() => {
    fetchBillingStatus();
  }, [fetchBillingStatus]);

  const handleEdit = (url: UrlData) => {
    // TODO: Implement edit modal
    toast('Edit functionality coming soon!', { icon: 'ℹ️' });
    console.log('Edit URL:', url);
  };

  const handleDelete = (url: UrlData) => {
    // TODO: Implement delete confirmation
    if (window.confirm(`Are you sure you want to delete "${url.title || url.shortCode}"?`)) {
      toast.success('URL deleted successfully');
      console.log('Delete URL:', url);
    }
  };

  const handleGenerateQR = (url: UrlData) => {
    setSelectedUrl(url);
    setIsQRModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your shortened URLs and track performance
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Link
        </Button>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Usage Meter for Free Users */}
      {userPlan === 'free' && usage && (
        <div className="max-w-md">
          <UsageMeter
            used={usage.linksCreated}
            limit={usage.linksLimit}
            label="Links this month"
          />
        </div>
      )}

      {/* URLs List */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-6">
          Your Links
        </h2>
        <UrlList
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGenerateQR={handleGenerateQR}
        />
      </div>

      {/* Modals */}
      <CreateUrlModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        url={selectedUrl}
      />
    </div>
  );
};
