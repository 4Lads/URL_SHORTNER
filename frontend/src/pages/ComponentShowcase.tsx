import React, { useState } from 'react';
import { Button, Input, Card, Modal, LoadingSpinner } from '../components/common';
import { useClipboard } from '../hooks/useClipboard';
import { useUiStore } from '../store/uiStore';

export const ComponentShowcase: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { copyToClipboard, isCopied } = useClipboard();
  const { theme, toggleTheme } = useUiStore();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Component Showcase
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Testing Phase 2.1 & 2.2 Implementation
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="mt-4"
          >
            Toggle {theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode
          </Button>
        </div>

        {/* Design System Colors */}
        <Card header={<h2 className="text-2xl font-semibold">Color Palette</h2>}>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Primary (Indigo)</p>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-primary-400" />
                <div className="w-12 h-12 rounded-lg bg-primary-600" />
                <div className="w-12 h-12 rounded-lg bg-primary-800" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Secondary (Teal)</p>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-secondary-400" />
                <div className="w-12 h-12 rounded-lg bg-secondary-600" />
                <div className="w-12 h-12 rounded-lg bg-secondary-800" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Accent (Purple)</p>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-accent-400" />
                <div className="w-12 h-12 rounded-lg bg-accent-600" />
                <div className="w-12 h-12 rounded-lg bg-accent-800" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Semantic</p>
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-success" />
                <div className="w-12 h-12 rounded-lg bg-warning" />
                <div className="w-12 h-12 rounded-lg bg-error" />
              </div>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <Card header={<h2 className="text-2xl font-semibold">Buttons</h2>}>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">States</p>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button icon={<span>🚀</span>} iconPosition="left">
                  With Icon
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Inputs */}
        <Card header={<h2 className="text-2xl font-semibold">Inputs</h2>}>
          <div className="space-y-6">
            <Input
              label="Default Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <Input
              label="With Helper Text"
              helperText="This is some helpful information"
              placeholder="Type something..."
            />

            <Input
              label="With Error"
              error="This field is required"
              placeholder="Error state..."
            />

            <Input
              label="With Icon"
              icon={<span>🔍</span>}
              iconPosition="left"
              placeholder="Search..."
            />
          </div>
        </Card>

        {/* Cards */}
        <Card header={<h2 className="text-2xl font-semibold">Cards</h2>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="default" padding="md">
              <h3 className="font-semibold mb-2">Default Card</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Standard card with soft shadow
              </p>
            </Card>

            <Card variant="elevated" padding="md" hover>
              <h3 className="font-semibold mb-2">Elevated Card</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Hover to see scale effect
              </p>
            </Card>

            <Card variant="glass" padding="md">
              <h3 className="font-semibold mb-2">Glass Card</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Glassmorphism effect
              </p>
            </Card>

            <Card variant="bordered" padding="md">
              <h3 className="font-semibold mb-2">Bordered Card</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Border style variant
              </p>
            </Card>
          </div>
        </Card>

        {/* Glassmorphism & Gradients */}
        <Card header={<h2 className="text-2xl font-semibold">Special Effects</h2>}>
          <div className="space-y-6">
            <div className="gradient-mesh p-8 rounded-2xl">
              <div className="glass p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">Glassmorphism on Gradient Mesh</h3>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Frosted glass effect with backdrop blur
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="gradient-primary p-6 rounded-xl text-white text-center">
                <p className="font-semibold">Primary Gradient</p>
              </div>
              <div className="gradient-secondary p-6 rounded-xl text-white text-center">
                <p className="font-semibold">Secondary Gradient</p>
              </div>
              <div className="gradient-accent p-6 rounded-xl text-white text-center">
                <p className="font-semibold">Accent Gradient</p>
              </div>
            </div>

            <div className="text-center py-8">
              <h3 className="text-6xl font-bold gradient-text">
                Gradient Text Effect
              </h3>
            </div>
          </div>
        </Card>

        {/* Loading States */}
        <Card header={<h2 className="text-2xl font-semibold">Loading States</h2>}>
          <div className="flex flex-wrap gap-8 justify-center">
            <LoadingSpinner size="xs" label="Extra Small" />
            <LoadingSpinner size="sm" label="Small" />
            <LoadingSpinner size="md" label="Medium" />
            <LoadingSpinner size="lg" label="Large" />
            <LoadingSpinner size="xl" label="Extra Large" />
          </div>
        </Card>

        {/* Modal & Clipboard */}
        <Card header={<h2 className="text-2xl font-semibold">Modal & Clipboard</h2>}>
          <div className="space-y-4">
            <Button onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>

            <div className="flex gap-4">
              <Input
                value="https://example.com/very-long-url"
                readOnly
                fullWidth
              />
              <Button
                variant={isCopied ? 'secondary' : 'primary'}
                onClick={() => copyToClipboard('https://example.com/very-long-url')}
              >
                {isCopied ? '✓ Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </Card>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example Modal"
          size="md"
          footer={
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-neutral-700 dark:text-neutral-300">
              This is a glassmorphism modal with backdrop blur.
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Press ESC or click outside to close.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};
