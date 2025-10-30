import { RSSItemDto } from '../dtos/RssItemDto';

export interface FetchNewsRssFeedsInputPort {
  fetchNewsRssFeeds(rssUrl: string): Promise<RSSItemDto[]>;
}
