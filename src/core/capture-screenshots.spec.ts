import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CrawlService } from '../services/crawl-service';
import { LogService } from '../services/log-service';
import { ScreenshotService } from '../services/screenshot-service';
import { CaptureOptions, WebscreenshotsConfig } from '../config/config.types';
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
  routes: ['/'],
  crawl: false,
  viewports: [viewport],
  browserOptions,
  captureOptions,
  retryOptions,
};

describe('captureScreenshots', () => {
  let screenshotService: ScreenshotService;
  let crawlService: CrawlService;
  let logService: LogService;

  beforeEach(() => {
    vi.clearAllMocks();

    screenshotService = {
      capture: vi.fn(),
      release: vi.fn(),
    };

    crawlService = {
      extractLinks: vi.fn(),
      cleanup: vi.fn(),
    };

    logService = createMockLogService();
  });

  it('captures screenshots for provided routes without crawling', async () => {
    await captureScreenshots(defaultConfig, screenshotService, crawlService, logService);

    expect(screenshotService.capture).toHaveBeenCalledOnce();
    expect(screenshotService.release).toHaveBeenCalled();
    expect(logService.success).toHaveBeenCalled();
  });

  it('captures screenshots with crawl enabled', async () => {
    const config = { ...defaultConfig, crawl: true };
    crawlService.extractLinks = vi.fn().mockResolvedValue([]);

    vi.spyOn(crawlService, 'extractLinks').mockImplementation(async () => []);
    vi.spyOn(crawlService, 'cleanup').mockResolvedValue();
    vi.spyOn(screenshotService, 'capture').mockResolvedValue();

    await captureScreenshots(config, screenshotService, crawlService, logService);

    expect(crawlService.extractLinks).toHaveBeenCalled();
    expect(screenshotService.capture).toHaveBeenCalledOnce();
  });

  it('retries failed screenshot capture and succeeds', async () => {
    const config = {
      ...defaultConfig,
      retryOptions: { maxAttempts: 2, delayMs: 0 },
    };

    (screenshotService.capture as any).mockRejectedValueOnce(new Error('Fail once')).mockResolvedValueOnce(undefined);

    await captureScreenshots(config, screenshotService, crawlService, logService);

    expect(screenshotService.capture).toHaveBeenCalledTimes(2);
    expect(logService.error).not.toHaveBeenCalled();
  });

  it('logs error after maxAttempts fail', async () => {
    const config = {
      ...defaultConfig,
      retryOptions: { maxAttempts: 2, delayMs: 0 },
    };

    (screenshotService.capture as any).mockRejectedValue(new Error('Always fails'));

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    try {
      await captureScreenshots(config, screenshotService, crawlService, logService);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toBe('process.exit called');
    }

    expect(logService.error).toHaveBeenCalledWith(expect.stringContaining('Failed to capture'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits early if crawling returns no results', async () => {
    const config = { ...defaultConfig, crawl: true };
    vi.spyOn(crawlSiteModule, 'crawlSite').mockImplementation(async () => {
      return [];
    });

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit called');
    });

    try {
      await captureScreenshots(config, screenshotService, crawlService, logService);
    } catch (err) {
      expect((err as Error).message).toBe('exit called');
    }

    expect(logService.error).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('logs cleanup error and exits on release failure', async () => {
    vi.spyOn(screenshotService, 'release').mockRejectedValue(new Error('cleanup failed'));

    const config = {
      ...defaultConfig,
    };

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit called');
    });

    try {
      await captureScreenshots(config, screenshotService, crawlService, logService);
    } catch (err) {
      expect((err as Error).message).toBe('exit called');
    }

    expect(logService.error).toHaveBeenCalledWith('Failed during cleanup.');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
