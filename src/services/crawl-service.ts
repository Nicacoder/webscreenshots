import { BrowserOptions } from '../config/config.types.js';

export interface CrawlService {
  extractLinks(url: string, browserOptions: BrowserOptions): Promise<string[]>;
  cleanup(): Promise<void>;
}
