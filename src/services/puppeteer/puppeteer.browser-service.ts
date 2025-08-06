import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import puppeteer, { Browser, ImageFormat, Viewport } from 'puppeteer';
import { BrowserOptions, CaptureOptions } from '../../config/config.types.js';
import { BrowserService } from '../browser-service.js';

export class PuppeteerBrowserService implements BrowserService {
  private browser?: Browser;
  private options: BrowserOptions;

  constructor(options: BrowserOptions) {
    this.options = options;
  }

  async extractLinks(url: string): Promise<string[]> {
    const browser = this.browser ?? (await this.initBrowser(this.options));
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      const links = await page.$$eval('a[href]', (anchors) => anchors.map((a) => (a as HTMLAnchorElement).href));
      return Array.from(new Set(links));
    } finally {
      await page.close();
    }
  }

  async captureScreenshot(
    url: string,
    outputPath: string,
    captureOptions: CaptureOptions,
    viewport?: Viewport
  ): Promise<void> {
    const browser = this.browser ?? (await this.initBrowser(this.options));
    const page = await browser.newPage();
    try {
      const dir = path.dirname(outputPath);
      if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true });
      if (viewport) await page.setViewport(viewport);
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.screenshot({
        path: outputPath as `${string}.${ImageFormat}`,
        fullPage: captureOptions.fullPage,
        type: captureOptions.imageType,
        quality: captureOptions.quality,
      });
    } finally {
      await page.close();
    }
  }

  async cleanup(): Promise<void> {
    if (!this.browser) return;
    await this.browser.close();
    this.browser = undefined;
  }

  private async initBrowser(overrideOptions: BrowserOptions): Promise<Browser> {
    if (this.browser) await this.cleanup();
    return (this.browser = await puppeteer.launch({
      headless: overrideOptions.headless,
      args: overrideOptions.args,
    }));
  }
}
