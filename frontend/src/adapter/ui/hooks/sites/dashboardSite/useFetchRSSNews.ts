import { useState, useEffect } from 'react';
import { RSSItemDto } from '@application/useCases/fetchNewsRssFeeds/dtos/RssItemDto';
import { FetchNewsRssFeedsInputPort } from '@application/useCases/fetchNewsRssFeeds/ports/input';
import { FETCH_NEWS_RSS_FEEDS_INPUT_PORT } from '@common/constants';
import { IWidget } from '@domain/widget/entities/iwidget';
import { container } from 'tsyringe';
import { NewsWidgetSettings } from '@domain/widget/entities/widgetSettings';

export const useFetchNews = (widget: IWidget) => {
  const [rssData, setRssData] = useState<RSSItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const settings = widget.settings as NewsWidgetSettings;
      const rssURL = settings.rssUrl || '';

      if (!rssURL) {
        throw new Error('RSS URL is missing.');
      }

      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 500));

      const items = await container
        .resolve<FetchNewsRssFeedsInputPort>(FETCH_NEWS_RSS_FEEDS_INPUT_PORT)
        .fetchNewsRssFeeds(rssURL);

      setRssData(items);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data on component mount
    fetchData();

    // Update data every 30 minutes
    const intervalId = setInterval(fetchData, 30 * 60 * 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [widget]);

  return { rssData, loading, error };
};
