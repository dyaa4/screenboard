import { DashboardRepository } from '@application/repositories/dashboardRepository';
import { DASHBOARD_REPOSITORY_NAME } from '@common/constants';
import { useState, useCallback } from 'react';
import { container } from 'tsyringe';

export const useDeleteDashboard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteDashboard = useCallback(async (dashboardId: string) => {
    setIsLoading(true);
    try {
      await container
        .resolve<DashboardRepository>(DASHBOARD_REPOSITORY_NAME)
        .deleteDashboard(dashboardId);
      // Wichtig: Return das Promise von deleteDashboard
    } catch (error: any) {
      console.error('Error deleting dashboard:', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteDashboard, isLoading, error };
};
