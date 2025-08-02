export interface WebscreenshotsConfig {
  url: string;
  outputDir: string;
  routes: string[];
  browserOptions: BrowserOptions;
  captureOptions: CaptureOptions;
  viewports: Viewport[];
  crawl?: boolean;
  crawlOptions?: CrawlOptions;
}

export interface BrowserOptions {
  headless: boolean;
}

export interface CaptureOptions {
  fullPage: boolean;
  imageType: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

export interface Viewport {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor?: number;
}

export interface CrawlOptions {
  crawlLimit?: number;
  excludeRoutes?: string[];
}
