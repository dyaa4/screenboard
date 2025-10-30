import { IPatchableProps } from '@domain/dtos/ipatchableProp';
import { WidgetRepository } from 'application/repositories/widgetRepository';
import { inject, singleton } from 'tsyringe';
import { getApiUrl } from './helper';
import type { FetchAccessTokenInputPort } from '@application/useCases/app/fetchAccessTokenUseCase/ports/input';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import { Widget } from '@domain/entities/Widget';
import { WidgetFactory } from '@domain/widget/WidgetFactory';

@singleton()
export class WidgetsAdapter implements WidgetRepository {
  private accessTokenUseCase: FetchAccessTokenInputPort;

  constructor(
    @inject(FETCH_ACCESS_TOKEN_INPUT_PORT)
    fetchAccessTokenUseCase: FetchAccessTokenInputPort,
  ) {
    this.accessTokenUseCase = fetchAccessTokenUseCase;
  }

  async get(id: string, dashboardId: string): Promise<Widget | null> {
    try {
      const response = await fetch(
        getApiUrl(`/api/dashboard/${dashboardId}/widgets/${id}`),
      );
      if (!response.ok) throw new Error('Failed to fetch widget');
      return await response.json();
    } catch (error) {
      console.error('Fetch failed:', error);
      return null;
    }
  }

  async getAll(dashboardId: string): Promise<Widget[]> {
    const token = await this.getToken();
    try {
      const response = await fetch(
        getApiUrl(`/api/dashboard/${dashboardId}/widgets`),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error('Failed to fetch widgets');

      const widgetData = await response.json();

      return widgetData.map((widget: Widget) => {
        const widgetFactory = new WidgetFactory();
        return widgetFactory.createWidget(widget);
      });
    } catch (error) {
      console.error('Fetch failed:', error);
      return [];
    }
  }

  async update(
    widget: Widget,
    dashboardId: string,
    patchableProps: IPatchableProps,
  ): Promise<Widget> {
    //const updatedWidget = { ...widget, ...patchableProps };

    //TODO: Validate updatedWidget
    try {
      const response = await fetch(
        getApiUrl(`/api/dashboard/${dashboardId}/widgets/${widget.id}`),
        {
          method: 'PUT',
          body: JSON.stringify(patchableProps),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getToken()}`,
          },
        },
      );
      if (!response.ok) throw new Error('Failed to update widget');
      return await response.json();
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }

  private async getToken(): Promise<string | null> {
    return await this.accessTokenUseCase.getAccessToken();
  }
}
