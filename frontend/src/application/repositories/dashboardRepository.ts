import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { Dashboard } from '@domain/entities/Dashboard';

export interface DashboardRepository {
  getDashboards(): Promise<Dashboard[]>;
  getDashboardById(dashboardId: string): Promise<Dashboard>;
  createDashboard(dashboard: Dashboard): Promise<Dashboard>;
  updateDashboard(
    dashboard: Dashboard,
    patchableProps: IPatchableProps,
  ): Promise<Dashboard>;
  deleteDashboard(dashboardId: string): Promise<void>;
}
