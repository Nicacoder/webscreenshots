import { Viewport } from 'puppeteer';
import { AuthOptions, CaptureOptions } from '../config/config.types.js';

export interface BrowserService {
  setAuthentication(authOptions?: AuthOptions): Promise<boolean>;

  extractLinks(url: string): Promise<string[]>;

  captureScreenshot(
    url: string,
    outputPath: string,
    captureOptions: CaptureOptions,
    viewport?: Viewport
  ): Promise<void>;

  cleanup(): Promise<void>;
}
