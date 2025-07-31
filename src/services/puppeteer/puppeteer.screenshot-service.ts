import fs from 'fs/promises';
import path from 'path';
import puppeteer, { ImageFormat } from 'puppeteer';
import { ScreenshotService } from '../screenshot-service';

export class PuppeteerScreenshotService implements ScreenshotService {
  async capture(url: string, outputPath: string): Promise<void> {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.screenshot({
        path: outputPath as `${string}.${ImageFormat}`,
        fullPage: true,
      });
    } finally {
      await browser.close();
    }
  }
}
