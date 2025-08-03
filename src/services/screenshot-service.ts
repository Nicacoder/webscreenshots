import { Viewport } from 'puppeteer';
import { BrowserOptions, CaptureOptions } from '../config/config.types.js';

export interface ScreenshotService {
  capture: (
    url: string,
    outputPath: string,
    viewport: Viewport,
    browserOptions: BrowserOptions,
    captureOptions: CaptureOptions
  ) => Promise<void>;

  release: () => Promise<void>;
}
