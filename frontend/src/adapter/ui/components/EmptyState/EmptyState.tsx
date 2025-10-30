import { Button } from '@heroui/react';
import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Keine Daten verfügbar',
  description = 'Es wurden noch keine Einträge gefunden.',
  actionLabel = 'Erstellen',
  onAction,
  icon: Icon = () => <i className="fas fa-exclamation-triangle"></i>,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6">
        <div className="rounded-full bg-gray-100 p-4">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-gray-500">{description}</p>
        </div>

        {onAction && (
          <Button color="primary" onPress={onAction} className="mt-4">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
