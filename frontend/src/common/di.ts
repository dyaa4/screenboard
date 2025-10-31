import CommunicationAdapter from '@adapter/api/CommunicationAdapter';
import { DashboardAdapter } from '@adapter/api/DashboardAdapter';
import GoogleCalendarAdapter from '@adapter/api/GoogleCalendarAdapter';
import { LayoutAdapter } from '@adapter/api/LayoutAdapter';
import NewWidgetAdapter from '@adapter/api/NewsWidgetAdapter';
import SmartThingsAdapter from '@adapter/api/SmartthingsAdapter';
import SpotifyAdapter from '@adapter/api/SpotifyAdapter';
import { WidgetsAdapter } from '@adapter/api/WidgetsAdapter';
import SmartThingsAuthAdapter from '@adapter/api/SmartThingsAuthAdapter';
import { CommunicationRepository } from '@application/repositories/communicationRepository';
import { WidgetRepository } from '@application/repositories/widgetRepository';

import FetchAccessTokenUseCase from '@application/useCases/app/fetchAccessTokenUseCase/FetchAccessTokenUseCase';
import { CompleteSmartThingsAuthUseCase } from '@application/useCases/app/completeSmartThingsAuthUseCase/CompleteSmartThingsAuthUseCase';
import { FetchNewsRssFeedsUseCase } from '@application/useCases/fetchNewsRssFeeds/FetchNewsRssFeedsUseCase';

import {
  COMMUNICATION_REPOSITORY_NAME,
  COMPLETE_SMARTTHINGS_AUTH_INPUT_PORT,
  COMPLETE_SMARTTHINGS_AUTH_OUTPUT_PORT,
  DASHBOARD_REPOSITORY_NAME,
  FETCH_ACCESS_TOKEN_INPUT_PORT,
  FETCH_NEWS_RSS_FEEDS_INPUT_PORT,
  FETCH_NEWS_RSS_FEEDS_OUTPUT_PORT,
  GOOGLE_REPOSITORY_NAME,
  LAYOUT_REPOSITORY_NAME,
  SMARTTHINGS_REPOSITORY_NAME,
  SPOTIFY_REPOSITORY_NAME,
  WIDGET_REPOSITORY_NAME,
} from '@common/constants';
import { container } from 'tsyringe';

export function registerDi() {
  try {
    //Access Token
    //Der Output Port wird in der AuthContext.tsx registriert
    container.register(FETCH_ACCESS_TOKEN_INPUT_PORT, {
      useClass: FetchAccessTokenUseCase,
    });

    container.register<WidgetRepository>(WIDGET_REPOSITORY_NAME, {
      useClass: WidgetsAdapter,
    });

    container.register(LAYOUT_REPOSITORY_NAME, {
      useClass: LayoutAdapter,
    });

    container.register(DASHBOARD_REPOSITORY_NAME, {
      useClass: DashboardAdapter,
    });

    // SmartThings Auth
    container.register(COMPLETE_SMARTTHINGS_AUTH_OUTPUT_PORT, {
      useClass: SmartThingsAuthAdapter,
    });
    container.register(COMPLETE_SMARTTHINGS_AUTH_INPUT_PORT, {
      useClass: CompleteSmartThingsAuthUseCase,
    });

    container.register(GOOGLE_REPOSITORY_NAME, {
      useClass: GoogleCalendarAdapter,
    });

    // UseCase News Rss Feeds
    container.register(FETCH_NEWS_RSS_FEEDS_INPUT_PORT, {
      useClass: FetchNewsRssFeedsUseCase,
    });

    container.register(FETCH_NEWS_RSS_FEEDS_OUTPUT_PORT, {
      useClass: NewWidgetAdapter,
    });

    container.registerSingleton<CommunicationRepository>(
      COMMUNICATION_REPOSITORY_NAME,
      CommunicationAdapter,
    );

    //SPOTIFY
    container.register(SPOTIFY_REPOSITORY_NAME, {
      useClass: SpotifyAdapter,
    });

    //SmartThings
    container.register(SMARTTHINGS_REPOSITORY_NAME, {
      useClass: SmartThingsAdapter,
    });
  } catch (error) {
    console.error('Error registering DI:', error);
  }
}
