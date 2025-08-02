export interface CrawlService {
  extractLinks(url: string): Promise<string[]>;
  cleanup(): Promise<void>;
}
