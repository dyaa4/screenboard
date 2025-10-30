export interface RSSItemDto {
  guid: string;
  title: string;
  link: string;
  description: string;
  category: string;
  pubDate: string;
  enclosure: {
    url: string;
    type: string;
    length: string;
  };
}
