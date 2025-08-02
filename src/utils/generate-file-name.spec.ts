import { describe, it, expect } from 'vitest';
import { generateFileName } from './generate-file-name';

describe('generateFileName', () => {
  it('should generate a filename from a basic URL and viewport', () => {
    const result = generateFileName('https://example.com/about', 'Desktop', 'png');
    expect(result).toBe('example-com-about-desktop.png');
  });

  it('should replace dots in hostname with dashes', () => {
    const result = generateFileName('https://sub.example.com/page', 'Mobile', 'jpg');
    expect(result).toBe('sub-example-com-page-mobile.jpg');
  });

  it('should handle trailing and leading slashes in pathname', () => {
    const result = generateFileName('https://example.com/blog/', 'Tablet', 'webp');
    expect(result).toBe('example-com-blog-tablet.webp');
  });

  it('should generate "home" if pathname is root', () => {
    const result = generateFileName('https://example.com/', 'Desktop', 'png');
    expect(result).toBe('example-com-home-desktop.png');
  });

  it('should handle nested paths by joining with dashes', () => {
    const result = generateFileName('https://example.com/products/view/item', 'Large Screen', 'png');
    expect(result).toBe('example-com-products-view-item-large-screen.png');
  });

  it('should lowercase the viewport and replace spaces with dashes', () => {
    const result = generateFileName('https://example.com/path', 'Big Tablet View', 'jpeg');
    expect(result).toBe('example-com-path-big-tablet-view.jpeg');
  });

  it('should ignore query parameters and hash fragments', () => {
    const result = generateFileName('https://example.com/page?sort=asc#top', 'Mobile', 'png');
    expect(result).toBe('example-com-page-mobile.png');
  });
});
