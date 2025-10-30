import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { Layout } from '@domain/entities/Layout';

export interface LayoutRepository {
  getLayout(dashboardId: string): Promise<Layout>;
  updateLayout(
    layout: Layout,
    dashboardId: string,
    patchableProps: IPatchableProps,
  ): Promise<Layout>;
}
