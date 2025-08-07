import { Viewport } from 'puppeteer';
import { CaptureOptions } from '../config/config.types.js';

export interface BrowserService {
  extractLinks(url: string): Promise<string[]>;

  captureScreenshot(
    url: string,
    outputPath: string,
    captureOptions: CaptureOptions,
    viewport?: Viewport
  ): Promise<void>;

  cleanup(): Promise<void>;
}
