import { LayoutRepository } from '@application/repositories/layoutRepository';

import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { getApiUrl } from './helper';
import type { FetchAccessTokenInputPort } from '@application/useCases/app/fetchAccessTokenUseCase/ports/input';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import { inject, singleton } from 'tsyringe';
import { Layout } from '@domain/entities/Layout';

@singleton()
export class LayoutAdapter implements LayoutRepository {
  private accessTokenUseCase: FetchAccessTokenInputPort;

  constructor(
    @inject(FETCH_ACCESS_TOKEN_INPUT_PORT)
    fetchAccessTokenUseCase: FetchAccessTokenInputPort,
  ) {
    this.accessTokenUseCase = fetchAccessTokenUseCase;
  }

  async getLayout(dashboardId: string): Promise<Layout> {
    const token = await this.getToken();
    const response = await fetch(
      getApiUrl(`/api/dashboard/${dashboardId}/layout`),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error('Failed to fetch layout config');
    return response.json();
  }
  async updateLayout(
    layoutConfig: Layout,
    dashboardId: string,
    patchableProps: IPatchableProps,
  ): Promise<Layout> {
    const token = await this.getToken();
    const updatedLayoutConfig = { ...layoutConfig, ...patchableProps };
    try {
      const response = await fetch(
        getApiUrl(`/api/dashboard/ ${dashboardId}/layout`),
        {
          method: 'PUT',
          body: JSON.stringify(updatedLayoutConfig),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error('Failed to update layout config');
      return response.json();
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }

  private async getToken(): Promise<string | null> {
    return await this.accessTokenUseCase.getAccessToken();
  }
}
