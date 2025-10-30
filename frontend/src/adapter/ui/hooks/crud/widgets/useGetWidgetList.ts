import { WIDGET_REPOSITORY_NAME } from '@common/constants';
import {
  getPropertyName,
  sortListByProperty,
} from '@common/helpers/objectHelper';
import { Widget } from '@domain/entities/Widget';

import { WidgetRepository } from 'application/repositories/widgetRepository';
import { useCallback, useEffect, useState } from 'react';

import { container } from 'tsyringe';

export const useGetWidgetList = (dashboardId: string | undefined) => {
  if (!dashboardId) {
    throw new Error('Dashboard ID is required');
  }
  const [widgetList, setWidgetList] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWidgetList = useCallback(async () => {
    try {
      const widgets = await container
        .resolve<WidgetRepository>(WIDGET_REPOSITORY_NAME)
        .getAll(dashboardId);

      const sortWidgets = sortListByProperty(
        widgets,
        getPropertyName<Widget>((widget) => widget.position),
      );
      setWidgetList(sortWidgets);
    } catch (error: any) {
      console.error('Error fetching widget list:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWidgetList();
  }, []);

  return { widgetList, setWidgetList, isLoading, error };
};
