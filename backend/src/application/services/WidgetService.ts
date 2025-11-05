// @domain/services/WidgetService.ts
import { EventSubscriptionMapper } from '../../application/mappers/EventSubscriptionMapper';
import { EventSubscription } from '../../domain/entities/EventSubscription';
import { SERVICES } from '../../domain/valueObjects/serviceToken';
import { updateWidgetPositions } from '../../application/utils/updateWidgetPositions';
import { IWidgetRepository } from '../../domain/repositories/IWidgetRepository';
import { IoTWidgetSettings, IWidgetDocument, WidgetTypeEnum } from '../../domain/types';
import { EventType } from '../../domain/types/widget/EventWidgetSettings';
import logger from '../../utils/logger';
import { EventSubscriptionService } from './EventSubscriptionService';
import { GoogleService } from './GoogleService';
import { SmartThingsService } from './SmartThingsService';


export class WidgetService {
  constructor(private widgetRepository: IWidgetRepository, private googleService: GoogleService, private smartthingsService: SmartThingsService, private eventSubscriptionService: EventSubscriptionService) { }


  async createWidget(widget: IWidgetDocument): Promise<IWidgetDocument> {
    return this.widgetRepository.create(widget);
  }

  async getWidgetById(
    id: string,
    dashboardId: string,
  ): Promise<IWidgetDocument | null> {
    return this.widgetRepository.findWidgetByIdAndDashboardId(id, dashboardId);
  }

  async getWidgetsByDashboardId(dashboardId: string): Promise<IWidgetDocument[]> {
    return this.widgetRepository.findWidgetListByDashboardId(dashboardId);
  }

  async updateWidget(widget: IWidgetDocument): Promise<IWidgetDocument | null> {
    return this.widgetRepository.update(widget);
  }


  async updateWidgetAndHandleEvents(
    id: string,
    dashboardId: string,
    userId: string,
    props: Partial<IWidgetDocument>
  ): Promise<IWidgetDocument | null> {
    const widget = await this.widgetRepository.findWidgetByIdAndDashboardId(id, dashboardId);
    if (!widget) {
      throw new Error('Widget not found');
    }

    const widgets = await this.widgetRepository.findWidgetListByDashboardId(dashboardId);

    if (props.position !== undefined && props.position !== widget.position) {
      // updateWidgetPositions ist eine Helferfunktion, die neue Positionen berechnet
      const updatedWidgets = updateWidgetPositions(
        widgets,
        id,
        props.position,
        widget.position,
      );

      // Alle betroffenen Widgets updaten (auch das aktuelle Widget ist dabei)
      await Promise.all(
        updatedWidgets.map(w => this.widgetRepository.update(w))
      );
    }
    try {

      await this.handleGoogleCalendarEventRegistry(widget, userId, dashboardId);
      await this.handleMicrosoftCalendarEventRegistry(widget, userId, dashboardId);
      await this.handleSmartthingsEventRegistry(widget, userId, dashboardId);
    } catch (error) {
      logger.error('Error subscribing to Widget Events', error);
    }

    // Restliche Props auf das Widget anwenden
    Object.assign(widget, props);

    // Widget updaten (falls es nicht schon in updatedWidgets war)
    if (!props.position || props.position === widget.position) {
      await this.widgetRepository.update(widget);
    }

    return widget;
  }

  /**
   *  Handles the registration of Google Calendar Event Subscriptions.
   * @param widget  The widget document
   * @param userId  The user ID
   * @param dashboardId  The dashboard ID
   * @returns  {Promise<void>}
   */
  private async handleGoogleCalendarEventRegistry(widget: IWidgetDocument, userId: string, dashboardId: string) {
    const isGoogleEventWidget =
      widget.type === WidgetTypeEnum.EVENTS &&
      widget.settings.type === EventType.GOOGLE &&
      widget.settings.calendarId;

    if (!isGoogleEventWidget) return;

    const googleSubscription = await this.googleService.subscribeToCalendarEvents(
      userId,
      dashboardId,
      widget.settings.calendarId
    );

    if (!googleSubscription) return;

    const entity = new EventSubscription(
      userId,
      dashboardId,
      SERVICES.GOOGLE,
      widget.settings.calendarId,
      new Date(googleSubscription.expiration),
      googleSubscription.resourceId,
    );

    const doc = EventSubscriptionMapper.toData(entity);
    await this.eventSubscriptionService.createSubscription(doc);
  }

  /**
   *  Handles the registration of Microsoft Calendar Event Subscriptions.
   * @param widget  The widget document
   * @param userId  The user ID
   * @param dashboardId  The dashboard ID
   * @returns  {Promise<void>}
   */
  private async handleMicrosoftCalendarEventRegistry(widget: IWidgetDocument, _userId: string, dashboardId: string) {
    const isMicrosoftEventWidget =
      widget.type === WidgetTypeEnum.EVENTS &&
      widget.settings.type === EventType.MICROSOFT &&
      widget.settings.calendarId;

    if (!isMicrosoftEventWidget) return;

    // Microsoft Calendar doesn't need event subscriptions like Google Calendar
    // Microsoft Calendar events are fetched on-demand via Microsoft Graph API
    // No additional event subscription setup required
    logger.info(`Microsoft Calendar widget configured for dashboard ${dashboardId} with calendar ${widget.settings.calendarId}`);
  }

  /**
   *  Handles the registration of SmartThings IoT Subscriptions.
   * @param widget  The widget document
   * @param userId  The user ID
   * @param dashboardId  The dashboard ID
   * @returns  {Promise<void>}
   */
  private async handleSmartthingsEventRegistry(widget: IWidgetDocument, userId: string, dashboardId: string) {
    const devices = (widget.settings as IoTWidgetSettings).devices;
    const isSmartthingsiOTWidget =
      widget.type === WidgetTypeEnum.IOT &&
      devices.length > 0;
    if (!isSmartthingsiOTWidget) return;

    for (const device of devices) {
      try {
        const smartthingsSubscription =
          await this.smartthingsService.subscribeToDeviceEvents(
            userId,
            dashboardId,
            device.deviceId
          );

        if (!smartthingsSubscription) continue;

        const entity = new EventSubscription(
          userId,
          dashboardId,
          SERVICES.SMARTTHINGS,
          device.deviceId,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),// 30 Tage,
          smartthingsSubscription.resourceId,

        );

        const doc = EventSubscriptionMapper.toData(entity);
        await this.eventSubscriptionService.createSubscription(doc);
      } catch (error) {
        console.error(`Fehler bei Device ${device.deviceId}:`, error);
        continue; // explizit zum nächsten Device springen
      }

    }
  }
}

