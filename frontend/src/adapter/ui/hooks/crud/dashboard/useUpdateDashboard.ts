import { DashboardRepository } from '@application/repositories/dashboardRepository';
import { DASHBOARD_REPOSITORY_NAME } from '@common/constants';
import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { Dashboard } from '@domain/entities/Dashboard';
import { useState, useCallback } from 'react';
import { container } from 'tsyringe';

export const useUpdateDashboard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateDashboard = useCallback(
    async (dashboard: Dashboard, patchableProps: IPatchableProps) => {
      setIsLoading(true);
      try {
        const dashboardRepository = container.resolve<DashboardRepository>(
          DASHBOARD_REPOSITORY_NAME,
        );
        const updatedDashboard = await dashboardRepository.updateDashboard(
          dashboard,
          patchableProps,
        );
        return updatedDashboard;
      } catch (error: any) {
        console.error('Error updating dashboard:', error);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { updateDashboard, isLoading, error };
};
