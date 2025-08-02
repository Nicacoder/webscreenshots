import puppeteer, { Browser } from 'puppeteer';
import { CrawlService } from '../crawl-service';

export class PuppeteerCrawlService implements CrawlService {
  private browser!: Browser;

  async extractLinks(url: string): Promise<string[]> {
    if (!this.browser) this.browser = await puppeteer.launch({ headless: true });
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
