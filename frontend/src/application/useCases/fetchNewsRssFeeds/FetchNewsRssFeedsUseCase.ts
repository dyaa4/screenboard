import { inject, singleton } from 'tsyringe';
import { FetchNewsRssFeedsInputPort } from './ports/input';
import { RSSItemDto } from './dtos/RssItemDto';

import type { FetchNewsRssFeedsOutputPort } from './ports/outputs';
import { FETCH_NEWS_RSS_FEEDS_OUTPUT_PORT } from '@common/constants';

@singleton()
export class FetchNewsRssFeedsUseCase implements FetchNewsRssFeedsInputPort {
  constructor(
    @inject(FETCH_NEWS_RSS_FEEDS_OUTPUT_PORT)
    protected fetchNewsRssFeedsCustomUrlOutputPort: FetchNewsRssFeedsOutputPort,
  ) {}
  async fetchNewsRssFeeds(rssUrl: string): Promise<RSSItemDto[]> {
    if (!rssUrl) {
      throw new Error('Invalid rss url');
    }

    return await this.fetchNewsRssFeedsCustomUrlOutputPort.fetchNewsRssFeeds(
      rssUrl,
    );
  }
}
