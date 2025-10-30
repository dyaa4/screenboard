import { Button } from '@heroui/react';
import { FiAlertTriangle, FiRefreshCcw } from 'react-icons/fi';

interface ErrorStateProps {
  title: string;
  onRetry?: () => void;
}

const ErrorState = ({ title, onRetry }: ErrorStateProps) => (
  <div className="max-w-[1200px] mx-auto mt-auto">
    <div className="flex flex-col items-center justify-center py-20">
      <div className="p-8 rounded-xl bg-danger/10 text-center max-w-md">
        <FiAlertTriangle className="w-12 h-12 text-danger mx-auto mb-4" />
        <p className="text-xl font-semibold text-danger mb-2">{title}</p>
        <p className="text-sm text-danger-500 mb-6">
          Bitte versuchen Sie später ernuet oder kontaktieren Sie den Support.
        </p>
        {onRetry && (
          <Button
            className="bg-danger/20 hover:bg-danger/30 text-danger"
            onPress={onRetry}
            startContent={<FiRefreshCcw />}
          >
            Erneut versuchen
          </Button>
        )}
      </div>
    </div>
  </div>
);

export default ErrorState;
