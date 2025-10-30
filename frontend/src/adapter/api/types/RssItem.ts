// Interne Typen für den Adapter
export interface Enclosure {
  url: string;
  type: string;
  length: string;
}

export interface RSSItem {
  guid: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category: string;
  enclosure: Enclosure;
}
