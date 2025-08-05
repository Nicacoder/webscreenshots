import path from 'path';
import { describe, it, expect } from 'vitest';
import { generateFilePath } from './generate-file-path';

describe('generateFilePath', () => {
  const outputDir = 'screenshots';
  const pattern = '{host}/{viewport}/{host}-{viewport}-{route}.{ext}';
  const timestamp = new Date('2025-08-05T12:34:56.789Z');
  const formattedTimestamp = timestamp.toISOString().replace(/[:.]/g, '-');

  it.each([
    [
      'https://example.com/about',
      'Desktop',
      'png',
      path.join('screenshots', 'example-com', 'desktop', 'example-com-desktop-about.png'),
    ],
    [
      'https://sub.example.com/page',
      'Mobile',
      'jpg',
      path.join('screenshots', 'sub-example-com', 'mobile', 'sub-example-com-mobile-page.jpg'),
    ],
    [
      'https://example.com/blog/',
      'Tablet',
      'webp',
      path.join('screenshots', 'example-com', 'tablet', 'example-com-tablet-blog.webp'),
    ],
    [
      'https://example.com/',
      'Desktop',
      'png',
      path.join('screenshots', 'example-com', 'desktop', 'example-com-desktop-home.png'),
    ],
    [
      'https://example.com/docs/about',
      'Desktop',
      'png',
      path.join('screenshots', 'example-com', 'desktop', 'example-com-desktop-docs-about.png'),
    ],
    [
      'https://example.com/path',
      'Big Tablet View',
      'jpeg',
      path.join('screenshots', 'example-com', 'big-tablet-view', 'example-com-big-tablet-view-path.jpeg'),
    ],
    [
      'https://example.com/page?sort=asc#top',
      'Mobile',
      'png',
      path.join('screenshots', 'example-com', 'mobile', 'example-com-mobile-page.png'),
    ],
  ])('should generate correct path for %s with viewport %s and extension %s', (url, viewport, extension, expected) => {
    const result = generateFilePath({
      url,
      viewport,
      extension,
      pattern,
      outputDir,
      timestamp,
    });
    expect(result).toBe(expected);
  });

  it('should replace dots in hostname with dashes', () => {
    const result = generateFilePath({
      url: 'https://sub.example.com/page',
      viewport: 'Mobile',
      extension: 'jpg',
      pattern,
      outputDir,
      timestamp,
    });
    expect(result).toBe(path.join('screenshots', 'sub-example-com', 'mobile', 'sub-example-com-mobile-page.jpg'));
  });

  it('should handle trailing and leading slashes in pathname', () => {
    const result = generateFilePath({
      url: 'https://example.com/blog/',
      viewport: 'Tablet',
      extension: 'webp',
      pattern,
      outputDir,
      timestamp,
    });
    expect(result).toBe(path.join('screenshots', 'example-com', 'tablet', 'example-com-tablet-blog.webp'));
  });

  it('should generate "home" if pathname is root', () => {
    const result = generateFilePath({
      url: 'https://example.com/',
      viewport: 'Desktop',
      extension: 'png',
      pattern,
      outputDir,
      timestamp,
    });
    expect(result).toBe(path.join('screenshots', 'example-com', 'desktop', 'example-com-desktop-home.png'));
  });

  it('should replace slashes in route with dashes', () => {
    const result = generateFilePath({
      url: 'https://example.com/docs/about',
      viewport: 'Desktop',
      extension: 'png',
      pattern,
      outputDir,
      timestamp,
    });
    expect(result).toBe(path.join('screenshots', 'example-com', 'desktop', 'example-com-desktop-docs-about.png'));
  });

  it('should lowercase the viewport and replace spaces with dashes', () => {
    const result = generateFilePath({
      url: 'https://example.com/path',
      viewport: 'Big Tablet View',
      extension: 'jpeg',
      pattern,
      outputDir,
      timestamp,
    });
    expect(result).toBe(
      path.join('screenshots', 'example-com', 'big-tablet-view', 'example-com-big-tablet-view-path.jpeg')
    );
  });

  it('should ignore query parameters and hash fragments', () => {
    const result = generateFilePath({
      url: 'https://example.com/page?sort=asc#top',
      viewport: 'Mobile',
      extension: 'png',
      pattern,
      outputDir,
      timestamp,
    });
    expect(result).toBe(path.join('screenshots', 'example-com', 'mobile', 'example-com-mobile-page.png'));
  });

  it('should include timestamp if pattern contains {timestamp}', () => {
    const patternWithTimestamp = '{host}/{viewport}/{host}-{viewport}-{route}-{timestamp}.{ext}';
    const result = generateFilePath({
      url: 'https://example.com/blog/',
      viewport: 'Tablet',
      extension: 'png',
      pattern: patternWithTimestamp,
      outputDir,
      timestamp,
    });

    expect(result).toBe(
      path.join('screenshots', 'example-com', 'tablet', `example-com-tablet-blog-${formattedTimestamp}.png`)
    );
  });
});
