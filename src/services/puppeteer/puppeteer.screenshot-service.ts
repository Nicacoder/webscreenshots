import fs from 'fs/promises';
import path from 'path';
import puppeteer, { Browser, ImageFormat, Viewport } from 'puppeteer';
import { ScreenshotService } from '../screenshot-service';
import { BrowserOptions, CaptureOptions } from '../../config/config.types';

export class PuppeteerScreenshotService implements ScreenshotService {
  private browser?: Browser;

  async capture(
    url: string,
    outputPath: string,
    viewport: Viewport,
    browserOptions: BrowserOptions,
    captureOptions: CaptureOptions
  ): Promise<void> {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    if (!this.browser) this.browser = await puppeteer.launch({ headless: browserOptions.headless ?? true });
    const page = await this.browser.newPage();
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.deviceScaleFactor,
    });

    try {
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

  async release() {
    await this.browser?.close();
    this.browser = undefined;
  }
}
