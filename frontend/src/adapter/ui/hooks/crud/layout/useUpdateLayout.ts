import { useState, useCallback } from 'react';
import { container } from 'tsyringe';
import { LayoutRepository } from '@application/repositories/layoutRepository';
import { LAYOUT_REPOSITORY_NAME } from '@common/constants';
import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { Layout } from '@domain/entities/Layout';

export const useUpdateLayout = (dashboardId: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateLayout = useCallback(
    async (layoutConfig: Layout, patchableProps: IPatchableProps) => {
      setIsLoading(true);
      try {
        const layoutConfigRepository = container.resolve<LayoutRepository>(
          LAYOUT_REPOSITORY_NAME,
        );
        const updatedLayout = await layoutConfigRepository.updateLayout(
          layoutConfig,
          dashboardId,
          patchableProps,
        );
        return updatedLayout;
      } catch (error: any) {
        console.error('Error updating layout config:', error);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { updateLayout, isLoading, error };
};
