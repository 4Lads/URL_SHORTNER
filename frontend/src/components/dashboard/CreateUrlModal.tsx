import React, { useState } from 'react';
import { Modal, Input, Button } from '../common';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUrlStore } from '../../store/urlStore';
import toast from 'react-hot-toast';

interface CreateUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUrlModal: React.FC<CreateUrlModalProps> = ({ isOpen, onClose }) => {
  const { createUrl, isLoading } = useUrlStore();
  const [formData, setFormData] = useState({
    url: '',
    customAlias: '',
    title: '',
    expiresAt: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate URL
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = 'URL must start with http:// or https://';
    }

    // Validate custom alias (if provided)
    if (formData.customAlias && !/^[a-zA-Z0-9-_]+$/.test(formData.customAlias)) {
      newErrors.customAlias = 'Alias can only contain letters, numbers, hyphens, and underscores';
    }

    // Validate expiration date (if provided)
    if (formData.expiresAt) {
      const expiresDate = new Date(formData.expiresAt);
      if (expiresDate < new Date()) {
        newErrors.expiresAt = 'Expiration date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createUrl({
        url: formData.url,
        customAlias: formData.customAlias || undefined,
        title: formData.title || undefined,
        expiresAt: formData.expiresAt || undefined,
      });

      toast.success('Short link created successfully!');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create short link');
    }
  };

  const handleClose = () => {
    setFormData({ url: '', customAlias: '', title: '', expiresAt: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Create Short Link
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Original URL */}
          <Input
            label="Original URL"
            type="url"
            placeholder="https://example.com/your-long-url"
            value={formData.url}
            onChange={(e) => {
              setFormData({ ...formData, url: e.target.value });
              if (errors.url) setErrors({ ...errors, url: '' });
            }}
            error={errors.url}
            required
          />

          {/* Custom Alias (Optional) */}
          <Input
            label="Custom Alias (Optional)"
            type="text"
            placeholder="my-custom-link"
            value={formData.customAlias}
            onChange={(e) => {
              setFormData({ ...formData, customAlias: e.target.value });
              if (errors.customAlias) setErrors({ ...errors, customAlias: '' });
            }}
            error={errors.customAlias}
            helperText="Leave empty to auto-generate a short code"
          />

          {/* Title (Optional) */}
          <Input
            label="Title (Optional)"
            type="text"
            placeholder="My Awesome Link"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            helperText="A friendly name to help you identify this link"
          />

          {/* Expiration Date (Optional) */}
          <Input
            label="Expiration Date (Optional)"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => {
              setFormData({ ...formData, expiresAt: e.target.value });
              if (errors.expiresAt) setErrors({ ...errors, expiresAt: '' });
            }}
            error={errors.expiresAt}
            helperText="Leave empty for permanent link"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              Create Link
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
