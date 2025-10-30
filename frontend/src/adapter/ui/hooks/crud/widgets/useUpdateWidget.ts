import { WIDGET_REPOSITORY_NAME } from '@common/constants';
import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { Widget } from '@domain/entities/Widget';
import { WidgetRepository } from 'application/repositories/widgetRepository';
import { useCallback, useState } from 'react';
import { container } from 'tsyringe';

const useUpdateWidget = (dashboardId: string | undefined) => {
  if (!dashboardId) {
    throw new Error('Dashboard ID is required');
  }
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateWidget = useCallback(
    async (widget: Widget, patchableProps: IPatchableProps) => {
      try {
        setIsLoading(true);
        await container
          .resolve<WidgetRepository>(WIDGET_REPOSITORY_NAME)
          .update(widget, dashboardId, patchableProps);

        setIsLoading(false);
      } catch (error: any) {
        console.error('Error updating widget:', error);
        setError(error);
      }
    },
    [],
  );

  return { isLoading, error, updateWidget };
};

export { useUpdateWidget };
