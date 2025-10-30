import { RSSItemDto } from '@application/useCases/fetchNewsRssFeeds/dtos/RssItemDto';
import axios, { AxiosResponse } from 'axios';
import { inject, singleton } from 'tsyringe';
import { getApiUrl } from './helper';
import { Enclosure, RSSItem } from './types';
import { FetchNewsRssFeedsOutputPort } from '@application/useCases/fetchNewsRssFeeds/ports/outputs';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import type { FetchAccessTokenInputPort } from '@application/useCases/app/fetchAccessTokenUseCase/ports/input';

@singleton()
export default class FlexibleRSSAdapter implements FetchNewsRssFeedsOutputPort {
  private accessTokenUseCase: FetchAccessTokenInputPort;

  constructor(
    @inject(FETCH_ACCESS_TOKEN_INPUT_PORT)
    fetchAccessTokenUseCase: FetchAccessTokenInputPort,
  ) {
    this.accessTokenUseCase = fetchAccessTokenUseCase;
  }

  async fetchNewsRssFeeds(rssUrl: string): Promise<RSSItemDto[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Kein Auth-Token verfügbar');
      }

      const xmlData = await this.fetchXmlData(rssUrl, token);
      const rssItems = this.parseXmlToRssItems(xmlData);

      return this.mapToRSSItemDto(rssItems);
    } catch (error) {
      this.handleError(error as Error);
      return [];
    }
  }

  private async getToken(): Promise<string | null> {
    return await this.accessTokenUseCase.getAccessToken();
  }

  private async fetchXmlData(rssUrl: string, token: string): Promise<string> {
    const proxyUrl = getApiUrl('/proxy');
    const response: AxiosResponse<string> = await axios.get(proxyUrl, {
      headers: { Authorization: `Bearer ${token}` },
      params: { url: rssUrl },
    });
    return response.data;
  }

  private parseXmlToRssItems(xmlData: string): RSSItem[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    const items = xmlDoc.querySelectorAll('item, entry');
    return Array.from(items).map((item) => this.parseItem(item));
  }

  private parseItem(item: Element): RSSItem {
    const getElementContent = (selectors: string[]): string => {
      for (const selector of selectors) {
        const content = item.querySelector(selector)?.textContent;
        if (content) return content.trim();
      }
      return '';
    };

    const getElementAttribute = (
      selectors: string[],
      attribute: string,
    ): string => {
      for (const selector of selectors) {
        const element = item.querySelector(selector);
        if (element && element.getAttribute(attribute)) {
          return element.getAttribute(attribute) || '';
        }
      }
      return '';
    };

    return {
      guid: getElementContent(['guid', 'id']),
      title: getElementContent(['title']),
      link:
        getElementAttribute(['link'], 'href') || getElementContent(['link']),
      description: this.parseDescription(item),
      category: this.parseCategories(item),
      enclosure: this.parseEnclosure(item),
      pubDate: getElementContent(['pubDate', 'published', 'updated']),
    };
  }

  private parseDescription(item: Element): string {
    const description =
      item.querySelector('description, summary, content')?.textContent || '';
    // Entferne HTML-Tags aus der Beschreibung
    return description.replace(/<[^>]*>/g, '').trim();
  }

  private parseCategories(item: Element): string {
    const categories = item.querySelectorAll('category');
    return Array.from(categories)
      .map((category) => category.textContent?.trim())
      .filter(Boolean)
      .join(', ');
  }

  private parseEnclosure(item: Element): Enclosure {
    const enclosureSelectors = [
      'enclosure',
      'media\\:content',
      'media\\:thumbnail',
      'content',
      'thumbnail',
    ];

    for (const selector of enclosureSelectors) {
      const enclosure = item.querySelector(selector);
      if (enclosure) {
        return {
          url: enclosure.getAttribute('url') || '',
          type: enclosure.getAttribute('type') || '',
          length: enclosure.getAttribute('length') || '',
        };
      }
    }

    return { url: '', type: '', length: '' };
  }

  private mapToRSSItemDto(rssItems: RSSItem[]): RSSItemDto[] {
    return rssItems.map((item) => ({
      guid: item.guid,
      title: item.title,
      link: item.link,
      description: item.description,
      category: item.category,
      enclosure: item.enclosure,
      pubDate: new Date(item.pubDate).toISOString(),
    }));
  }

  private handleError(error: Error): void {
    console.error('Fehler beim Abrufen des RSS-Feeds:', error);
    throw error;
  }
}
