import { DashboardRepository } from '@application/repositories/dashboardRepository';
import { DASHBOARD_REPOSITORY_NAME } from '@common/constants';
import { Dashboard } from '@domain/entities/Dashboard';
import { useCallback, useEffect, useState } from 'react';
import { container } from 'tsyringe';

// Hook zum Abrufen aller Dashboards
export const useGetDashboards = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboards = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedDashboards = await container
        .resolve<DashboardRepository>(DASHBOARD_REPOSITORY_NAME)
        .getDashboards();
      console.log('Dashboards nach dem Abruf:', fetchedDashboards);
      setDashboards(fetchedDashboards);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching dashboards:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  return { dashboards, isLoading, error, fetchDashboards };
};
