import { LayoutRepository } from '@application/repositories/layoutRepository';
import { LAYOUT_REPOSITORY_NAME } from '@common/constants';
import { Layout } from '@domain/entities/Layout';

import { useCallback, useEffect, useState } from 'react';
import { container } from 'tsyringe';

export const useGetLayout = (dashboardId: string | undefined) => {
  if (!dashboardId) {
    throw new Error('Dashboard ID is required');
  }

  const [layout, setLayout] = useState<Layout | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLayoutConfig = useCallback(async () => {
    try {
      const fetchedLayout = await container
        .resolve<LayoutRepository>(LAYOUT_REPOSITORY_NAME)
        .getLayout(dashboardId);

      setLayout(fetchedLayout);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching layout config:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLayoutConfig();
  }, [fetchLayoutConfig]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    return fetchLayoutConfig();
  }, [fetchLayoutConfig]);

  return { layout, isLoading, error, refetch };
};
