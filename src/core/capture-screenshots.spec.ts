import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CaptureOptions, WebscreenshotsConfig } from '../config/config.types';
import { BrowserService } from '../services/browser-service';
import { LogService } from '../services/log-service';
import { captureScreenshots } from './capture-screenshots';
import * as crawlSiteModule from './crawl-site';

const createMockLogService = (): LogService => ({
  start: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
});

const viewport = { name: 'desktop', width: 1200, height: 800 };
const browserOptions = { headless: true };
const captureOptions: CaptureOptions = { imageType: 'png', fullPage: true, quality: undefined };
const retryOptions = { maxAttempts: 1, delayMs: 0 };

const defaultConfig: WebscreenshotsConfig = {
  url: 'https://example.com',
  outputDir: 'screenshots',
  outputPattern: '{host}/{viewport}/{host}-{viewport}-{route}.{ext}',
  routes: ['/'],
  crawl: false,
  viewports: [viewport],
  browserOptions,
  captureOptions,
  retryOptions,
};

describe('captureScreenshots', () => {
  let browserService: BrowserService;
  let logService: LogService;

  beforeEach(() => {
    vi.clearAllMocks();

    browserService = {
      captureScreenshot: vi.fn(),
      extractLinks: vi.fn(),
      cleanup: vi.fn(),
    };

    logService = createMockLogService();
  });

  it('captures screenshots for provided routes without crawling', async () => {
    await captureScreenshots(defaultConfig, browserService, logService);

    expect(browserService.captureScreenshot).toHaveBeenCalledOnce();
    expect(browserService.cleanup).toHaveBeenCalled();
    expect(logService.success).toHaveBeenCalled();
  });

  it('captures screenshots with crawl enabled', async () => {
    const config = { ...defaultConfig, crawl: true };
    vi.spyOn(crawlSiteModule, 'crawlSite').mockResolvedValue(['https://example.com/page']);

    await captureScreenshots(config, browserService, logService);

    expect(crawlSiteModule.crawlSite).toHaveBeenCalled();
    expect(browserService.captureScreenshot).toHaveBeenCalledTimes(2); // original + crawled
  });

  it('retries failed screenshot capture and succeeds', async () => {
    const config = {
      ...defaultConfig,
      retryOptions: { maxAttempts: 2, delayMs: 0 },
    };

    (browserService.captureScreenshot as any).mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined);

    await captureScreenshots(config, browserService, logService);

    expect(browserService.captureScreenshot).toHaveBeenCalledTimes(2);
    expect(logService.error).not.toHaveBeenCalledWith(expect.stringContaining('Failed to capture'));
  });

  it('logs error after maxAttempts fail', async () => {
    const config = {
      ...defaultConfig,
      retryOptions: { maxAttempts: 2, delayMs: 0 },
    };

    (browserService.captureScreenshot as any).mockRejectedValue(new Error('Always fails'));

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    try {
      await captureScreenshots(config, browserService, logService);
    } catch (err) {
      expect((err as Error).message).toBe('process.exit called');
    }

    expect(logService.error).toHaveBeenCalledWith(expect.stringContaining('Failed to capture'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits early if crawling returns no results', async () => {
    const config = { ...defaultConfig, crawl: true };
    vi.spyOn(crawlSiteModule, 'crawlSite').mockResolvedValue([]);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit called');
    });

    try {
      await captureScreenshots(config, browserService, logService);
    } catch (err) {
      expect((err as Error).message).toBe('exit called');
    }

    expect(logService.error).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('logs cleanup error and exits on release failure', async () => {
    vi.spyOn(browserService, 'cleanup').mockRejectedValue(new Error('cleanup failed'));

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit called');
    });

    try {
      await captureScreenshots(defaultConfig, browserService, logService);
    } catch (err) {
      expect((err as Error).message).toBe('exit called');
    }

    expect(logService.error).toHaveBeenCalledWith('Failed during cleanup.');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
