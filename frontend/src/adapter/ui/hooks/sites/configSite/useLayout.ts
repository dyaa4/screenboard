import { useCallback, useState, useEffect } from 'react';
import { useGetLayout } from '@hooks/crud/layout/useGetLayout';
import { useUpdateLayout } from '@hooks/crud/layout/useUpdateLayout';
import debounce from 'lodash/debounce';
import { Layout } from '@domain/entities/Layout';

export const useLayout = (dashboardId: string | undefined) => {
  if (!dashboardId) {
    throw new Error('Dashboard ID is required');
  }

  const { layout: initialLayout, isLoading, error } = useGetLayout(dashboardId);
  const { updateLayout } = useUpdateLayout(dashboardId);
  const [layout, setLayout] = useState<Layout | undefined>(initialLayout);

  useEffect(() => {
    if (initialLayout) {
      setLayout(initialLayout);
    }
  }, [initialLayout]);

  const debouncedUpdate = useCallback(
    debounce(async (updatedLayout: Layout) => {
      try {
        const patchableProps = {
          brightness: updatedLayout.backgroundBrightness,
          fontSize: updatedLayout.fontSize,
          pinProtectionEnabled: updatedLayout.pinProtectionEnabled,
          pinCode: updatedLayout.pinCode,
          backgroundImages: updatedLayout.backgroundImages,
        };
        await updateLayout(updatedLayout, patchableProps);
      } catch (error) {
        console.error('Failed to update layout config:', error);
      }
    }, 500),
    [updateLayout],
  );

  const handleChange = useCallback(
    (field: keyof Layout, value: any) => {
      setLayout((prev) => {
        if (!prev) return undefined;
        const updatedLayout = { ...prev, [field]: value };
        debouncedUpdate(updatedLayout);
        return updatedLayout;
      });
    },
    [debouncedUpdate],
  );

  return { layout, isLoading, error, handleChange };
};
