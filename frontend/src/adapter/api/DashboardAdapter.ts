import { DashboardRepository } from '@application/repositories/dashboardRepository';
import type { FetchAccessTokenInputPort } from '@application/useCases/app/fetchAccessTokenUseCase/ports/input';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { Dashboard } from '@domain/entities/Dashboard';
import { inject, singleton } from 'tsyringe';
import { getApiUrl } from './helper';

@singleton()
export class DashboardAdapter implements DashboardRepository {
  private accessTokenUseCase: FetchAccessTokenInputPort;

  constructor(
    @inject(FETCH_ACCESS_TOKEN_INPUT_PORT)
    fetchAccessTokenUseCase: FetchAccessTokenInputPort,
  ) {
    this.accessTokenUseCase = fetchAccessTokenUseCase;
  }

  async getDashboards(): Promise<Dashboard[]> {
    const token = await this.getToken();
    const response = await fetch(getApiUrl('/api/dashboardList'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch dashboards');
    return response.json();
  }

  async getDashboardById(dashboardId: string): Promise<Dashboard> {
    const token = await this.getToken();
    const response = await fetch(getApiUrl(`/api/dashboard/${dashboardId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    return response.json();
  }

  async createDashboard(dashboard: Dashboard): Promise<Dashboard> {
    const token = await this.getToken();
    const response = await fetch(getApiUrl('/api/dashboard'), {
      method: 'POST',
      body: JSON.stringify(dashboard),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to create dashboard');
    return response.json();
  }

  async updateDashboard(
    dashboard: Dashboard,
    patchableProps: IPatchableProps,
  ): Promise<Dashboard> {
    const token = await this.getToken();
    const updatedDashboard = { ...patchableProps, _id: dashboard._id };
    try {
      const response = await fetch(
        getApiUrl(`/api/dashboard/${dashboard._id}`),
        {
          method: 'PUT',
          body: JSON.stringify(updatedDashboard),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error('Failed to update dashboard');
      return response.json();
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }
  async deleteDashboard(dashboardId: string): Promise<void> {
    const token = await this.getToken();

    try {
      const response = await fetch(getApiUrl(`/api/dashboard/${dashboardId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete dashboard: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw new Error('Failed to delete dashboard');
    }
  }
  private async getToken(): Promise<string | null> {
    return await this.accessTokenUseCase.getAccessToken();
  }
}
