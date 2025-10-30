import { DashboardRepository } from '@application/repositories/dashboardRepository';
import { DASHBOARD_REPOSITORY_NAME } from '@common/constants';
import { Dashboard } from '@domain/entities/Dashboard';
import { useState, useCallback } from 'react';
import { container } from 'tsyringe';

export const useCreateDashboard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createDashboard = useCallback(async (dashboard: Dashboard) => {
    setIsLoading(true);
    try {
      const dashboardRepository = container.resolve<DashboardRepository>(
        DASHBOARD_REPOSITORY_NAME,
      );
      const newDashboard = await dashboardRepository.createDashboard(dashboard);
      return newDashboard;
    } catch (error: any) {
      console.error('Error creating dashboard:', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createDashboard, isLoading, error };
};
