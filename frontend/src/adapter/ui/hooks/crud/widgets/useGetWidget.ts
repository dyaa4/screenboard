import { WIDGET_REPOSITORY_NAME } from '@common/constants';
import { WidgetRepository } from 'application/repositories/widgetRepository';
import { useCallback, useEffect, useState } from 'react';
import { IWidget } from '@domain/widget/entities/iwidget';
import { container } from 'tsyringe';

export const useGetWidget = (widgetId: string) => {
  const [widget, setWidget] = useState<IWidget | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWidget = useCallback(async () => {
    try {
      const fetchedWidget = await container
        .resolve<WidgetRepository>(WIDGET_REPOSITORY_NAME)
        .get(widgetId);

      setWidget(fetchedWidget);
    } catch (error: any) {
      console.error('Error fetching widget:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [widgetId]);

  useEffect(() => {
    fetchWidget();
  }, [fetchWidget]);

  return { fetchWidget, widget, isLoading, error };
};
