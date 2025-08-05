import { describe, it, expect, vi, beforeEach } from 'vitest';
import { crawlSite } from './crawl-site';
import { CrawlService } from '../services/crawl-service';
import { LogService } from '../services/log-service';

function createMockCrawlService(linkMap: Record<string, string[]>): CrawlService {
  return {
    extractLinks: vi.fn(async (url: string) => linkMap[url] || []),
    cleanup: vi.fn(async () => {}),
  };
}

const defaultBrowserOptions = { headless: true };
const defaultCrawlOptions = {};
const defaultRetryOptions = { maxAttempts: 1, delayMs: 0 };

const mockLogService: LogService = {
  start: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
};

describe('crawlSite', () => {
  let crawlService: CrawlService;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should crawl all linked pages from startUrl', async () => {
    crawlService = createMockCrawlService({
      'https://example.com': ['https://example.com/about', 'https://example.com/contact'],
      'https://example.com/about': ['https://example.com/team'],
      'https://example.com/contact': [],
      'https://example.com/team': [],
    });

    const result = await crawlSite(
      crawlService,
      mockLogService,
      'https://example.com',
      defaultBrowserOptions,
      defaultCrawlOptions,
      defaultRetryOptions
    );

    expect(result.sort()).toEqual([
      'https://example.com',
      'https://example.com/about',
      'https://example.com/contact',
      'https://example.com/team',
    ]);
  });

  it('should respect crawlLimit', async () => {
    crawlService = createMockCrawlService({
      'https://example.com': ['https://example.com/a', 'https://example.com/b'],
      'https://example.com/a': [],
      'https://example.com/b': [],
    });

    const result = await crawlSite(
      crawlService,
      mockLogService,
      'https://example.com',
      defaultBrowserOptions,
      { crawlLimit: 2 },
      defaultRetryOptions
    );

    expect(result.length).toBe(2);
  });

  it('should skip already visited URLs', async () => {
    crawlService = createMockCrawlService({
      'https://example.com': ['https://example.com/a', 'https://example.com'],
      'https://example.com/a': ['https://example.com'],
    });

    const result = await crawlSite(
      crawlService,
      mockLogService,
      'https://example.com',
      defaultBrowserOptions,
      defaultCrawlOptions,
      defaultRetryOptions
    );

    expect(result).toContain('https://example.com/a');
    expect(result.length).toBe(2);
  });

  it('should exclude URLs matching excludeRoutes', async () => {
    crawlService = createMockCrawlService({
      'https://example.com': ['https://example.com/private', 'https://example.com/public'],
      'https://example.com/public': [],
      'https://example.com/private': [],
    });

    const result = await crawlSite(
      crawlService,
      mockLogService,
      'https://example.com',
      defaultBrowserOptions,
      { excludeRoutes: ['/private'] },
      defaultRetryOptions
    );

    expect(result).toContain('https://example.com');
    expect(result).toContain('https://example.com/public');
    expect(result).not.toContain('https://example.com/private');
  });

  it('should handle errors gracefully and continue crawling', async () => {
    const extractLinks = vi.fn(async (url: string) => {
      if (url === 'https://example.com/bad') throw new Error('Oops!');
      return ['https://example.com/good'];
    });

    crawlService = {
      extractLinks,
      cleanup: vi.fn(async () => {}),
    };

    const result = await crawlSite(
      crawlService,
      mockLogService,
      'https://example.com/bad',
      defaultBrowserOptions,
      defaultCrawlOptions,
      defaultRetryOptions
    );

    expect(result).toEqual([]);
  });

  it('should respect dynamicRoutesLimit', async () => {
    crawlService = createMockCrawlService({
      'https://example.com': [
        'https://example.com/products',
        'https://example.com/products/1',
        'https://example.com/products/2',
        'https://example.com/products/3',
        'https://example.com/products/4',
        'https://example.com/products/5',
        'https://example.com/about',
      ],
      'https://example.com/products/1': [],
      'https://example.com/products/2': [],
      'https://example.com/products/3': [],
      'https://example.com/products/4': [],
      'https://example.com/products/5': [],
      'https://example.com/about': [],
    });

    const result = await crawlSite(
      crawlService,
      mockLogService,
      'https://example.com',
      defaultBrowserOptions,
      { dynamicRoutesLimit: 3 },
      defaultRetryOptions
    );

    const expected = [
      'https://example.com',
      'https://example.com/products',
      'https://example.com/products/1',
      'https://example.com/products/2',
      'https://example.com/products/3',
      'https://example.com/about',
    ];

    expect(result.sort()).toEqual(expected.sort());
  });

  it('should respect dynamicRoutesLimit with nested routes', async () => {
    crawlService = createMockCrawlService({
      'https://example.com': [
        'https://example.com/products/1',
        'https://example.com/products/2',
        'https://example.com/products/3',
        'https://example.com/products/4',
        'https://example.com/products/5',
      ],
      'https://example.com/products/1': [
        'https://example.com/products/1/edit',
        'https://example.com/products/1/delete',
      ],
      'https://example.com/products/2': [
        'https://example.com/products/2/edit',
        'https://example.com/products/2/delete',
      ],
      'https://example.com/products/3': [],
      'https://example.com/products/4': [],
      'https://example.com/products/5': [],
      'https://example.com/products/1/edit': [],
      'https://example.com/products/1/delete': [],
      'https://example.com/products/2/edit': [],
      'https://example.com/products/2/delete': [],
    });

    const result = await crawlSite(
      crawlService,
      mockLogService,
      'https://example.com',
      defaultBrowserOptions,
      { dynamicRoutesLimit: 2 },
      defaultRetryOptions
    );

    const expected = [
      'https://example.com',
      'https://example.com/products/1',
      'https://example.com/products/2',
      'https://example.com/products/1/edit',
      'https://example.com/products/1/delete',
      'https://example.com/products/2/edit',
      'https://example.com/products/2/delete',
    ];

    expect(result.sort()).toEqual(expected.sort());
  });

  it('should retry crawling on failure according to retryOptions', async () => {
    const extractLinks = vi.fn();
    extractLinks
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce(['https://example.com/next'])
      .mockResolvedValueOnce([]);

    crawlService = {
      extractLinks,
      cleanup: vi.fn(async () => {}),
    };

    const retryOptions = { maxAttempts: 3, delayMs: 10 };

    const result = await crawlSite(
      crawlService,
      mockLogService,
      'https://example.com',
      defaultBrowserOptions,
      defaultCrawlOptions,
      retryOptions
    );

    expect(extractLinks).toHaveBeenCalledTimes(3);
    expect(result).toContain('https://example.com');
    expect(result).toContain('https://example.com/next');
  });

  it('should stop retrying after maxAttempts', async () => {
    const extractLinks = vi.fn().mockRejectedValue(new Error('Persistent failure'));

    crawlService = {
      extractLinks,
      cleanup: vi.fn(async () => {}),
    };

    const retryOptions = { maxAttempts: 2, delayMs: 0 };

    const result = await crawlSite(
      crawlService,
      mockLogService,
      'https://example.com',
      defaultBrowserOptions,
      defaultCrawlOptions,
      retryOptions
    );

    expect(extractLinks).toHaveBeenCalledTimes(2);
    expect(result).toEqual([]);
  });
});
