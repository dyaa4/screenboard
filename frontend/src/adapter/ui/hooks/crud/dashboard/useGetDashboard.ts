import { DashboardRepository } from '../../../../../application/repositories/dashboardRepository';
import { DASHBOARD_REPOSITORY_NAME } from '@common/constants';
import { Dashboard } from '../../../../../domain/entities/Dashboard';
import { useState, useCallback, useEffect } from 'react';
import { container } from 'tsyringe';

export const useGetDashboard = (dashboardId: string | undefined) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!dashboardId) {
      return;
    }

    try {
      const fetchedDashboard = await container
        .resolve<DashboardRepository>(DASHBOARD_REPOSITORY_NAME)
        .getDashboardById(dashboardId);

      setDashboard(fetchedDashboard);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    return fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, isLoading, error, refetch };
};
