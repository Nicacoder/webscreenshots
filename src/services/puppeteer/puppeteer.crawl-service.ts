import puppeteer, { Browser } from 'puppeteer';
import { BrowserOptions } from '../../config/config.types.js';
import { CrawlService } from '../crawl-service.js';

export class PuppeteerCrawlService implements CrawlService {
  private browser!: Browser;

  async extractLinks(url: string, browserOptions: BrowserOptions): Promise<string[]> {
    if (!this.browser)
      this.browser = await puppeteer.launch({ headless: browserOptions.headless, args: browserOptions.args });

    const page = await this.browser.newPage();
    let links: string[] = [];
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      links = await page.$$eval('a[href]', (anchors) => anchors.map((a) => new URL(a.href, document.baseURI).href));
    } finally {
      await page.close();
    }

    return links;
  }

  async cleanup(): Promise<void> {
    await this.browser?.close();
  }
}
