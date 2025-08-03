import { describe, it, expect, vi, beforeEach } from 'vitest';
import { crawlSite } from './crawl-site';
import { CrawlService } from '../services/crawl-service';

function createMockCrawlService(linkMap: Record<string, string[]>): CrawlService {
  return {
    extractLinks: vi.fn(async (url: string) => linkMap[url] || []),
    cleanup: vi.fn(async () => {}),
  };
}

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

    const result = await crawlSite('https://example.com', {}, crawlService);
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

    const result = await crawlSite('https://example.com', { crawlLimit: 2 }, crawlService);
    expect(result.length).toBe(2);
  });

  it('should skip already visited URLs', async () => {
    crawlService = createMockCrawlService({
      'https://example.com': ['https://example.com/a', 'https://example.com'],
      'https://example.com/a': ['https://example.com'],
    });

    const result = await crawlSite('https://example.com', {}, crawlService);
    expect(result).toContain('https://example.com/a');
    expect(result.length).toBe(2);
  });

  it('should exclude URLs matching excludeRoutes', async () => {
    crawlService = createMockCrawlService({
      'https://example.com': ['https://example.com/private', 'https://example.com/public'],
      'https://example.com/public': [],
      'https://example.com/private': [],
    });

    const result = await crawlSite('https://example.com', { excludeRoutes: ['/private'] }, crawlService);

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

    const result = await crawlSite('https://example.com/bad', {}, crawlService);

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

    const result = await crawlSite('https://example.com', { dynamicRoutesLimit: 3 }, crawlService);

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
      'https://example.com/products/3': [
        'https://example.com/products/3/edit',
        'https://example.com/products/3/delete',
      ],
      'https://example.com/products/4': [
        'https://example.com/products/4/edit',
        'https://example.com/products/4/delete',
      ],
      'https://example.com/products/5': [
        'https://example.com/products/5/edit',
        'https://example.com/products/5/delete',
      ],
      'https://example.com/products/1/edit': [],
      'https://example.com/products/1/delete': [],
      'https://example.com/products/2/edit': [],
      'https://example.com/products/2/delete': [],
      'https://example.com/products/3/edit': [],
      'https://example.com/products/3/delete': [],
      'https://example.com/products/4/edit': [],
      'https://example.com/products/4/delete': [],
      'https://example.com/products/5/edit': [],
      'https://example.com/products/5/delete': [],
    });

    const result = await crawlSite('https://example.com', { dynamicRoutesLimit: 2 }, crawlService);

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
});
