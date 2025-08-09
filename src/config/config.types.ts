export interface WebscreenshotsConfig {
  url: string;
  outputDir: string;
  outputPattern: string;
  routes: string[];
  browserOptions: BrowserOptions;
  captureOptions: CaptureOptions;
  viewports: Viewport[];
  crawl: boolean;
  crawlOptions?: CrawlOptions;
  retryOptions: RetryOptions;
  authOptions?: AuthOptions;
}

export interface BrowserOptions {
  headless: boolean;
  args?: string[];
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
  dynamicRoutesLimit?: number;
}

export interface RetryOptions {
  maxAttempts: number;
  delayMs?: number;
}

export type AuthMethod = 'basic' | 'cookie' | 'form' | 'token';

export interface AuthOptions {
  method: AuthMethod;

  basic?: {
    username: string;
    password: string;
  };

  cookiesPath?: string;

  form?: {
    loginUrl: string;
    inputs: Record<string, string>;
    submit: string;
    errorSelector?: string;
    successSelector?: string;
    timeoutMs?: number;
  };

  token?: {
    header: string;
    value: string;
  };
}
