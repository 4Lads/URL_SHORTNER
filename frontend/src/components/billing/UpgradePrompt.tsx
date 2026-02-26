import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../common';

interface UpgradePromptProps {
  feature: string;
  description: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature, description }) => {
  const navigate = useNavigate();

  return (
    <Card variant="glass" className="p-6 border-l-4 border-primary-500">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-neutral-900 dark:text-white">{feature}</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/pricing')}>
          Upgrade to Pro
        </Button>
      </div>
    </Card>
  );
};
