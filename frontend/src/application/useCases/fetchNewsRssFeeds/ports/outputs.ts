import { RSSItemDto } from '../dtos/RssItemDto';

export interface FetchNewsRssFeedsOutputPort {
  fetchNewsRssFeeds(rssUrl: string): Promise<RSSItemDto[]>;
}
