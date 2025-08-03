import { describe, it, expect } from 'vitest';
import { UrlRoutesAnalyzer } from './url-routes-analyzer';

describe('UrlRoutesAnalyzer ', () => {
  it('should group simple dynamic segments', () => {
    const urls = [
      'https://localhost/products/1',
      'https://localhost/products/2',
      'https://localhost/products/3',
      'https://localhost/products/4',
    ];
    const grouper = new UrlRoutesAnalyzer(urls);

    const info = grouper.getGroupInfo('https://localhost/products/1');
    expect(info).toEqual({
      groupPattern: '/products/:dynamic',
      count: 4,
    });
  });

  it('should handle nested dynamic segments correctly', () => {
    const urls = [
      'https://localhost/orders/1/products/1',
      'https://localhost/orders/1/products/2',
      'https://localhost/orders/2/products/3',
      'https://localhost/orders/2/products/4',
    ];
    const grouper = new UrlRoutesAnalyzer(urls);

    const info1 = grouper.getGroupInfo('https://localhost/orders/1/products/a');
    expect(info1).toEqual({
      groupPattern: '/orders/1/products/:dynamic',
      count: 2,
    });

    const info2 = grouper.getGroupInfo('https://localhost/orders/2/products/b');
    expect(info2).toEqual({
      groupPattern: '/orders/2/products/:dynamic',
      count: 2,
    });
  });

  it('should ignore query strings and hashes in URLs', () => {
    const urls = [
      'https://example.com/orders/1/edit?sort=asc',
      'https://example.com/orders/2/edit#section',
      'https://example.com/products/abc-123-xyz/view?filter=active',
    ];
    const grouper = new UrlRoutesAnalyzer(urls);

    expect(grouper.getGroupInfo('https://example.com/orders/1/edit?sort=asc')).toEqual({
      groupPattern: '/orders/1/edit',
      count: 1,
    });
    expect(grouper.getGroupInfo('https://example.com/orders/2/edit#section')).toEqual({
      groupPattern: '/orders/2/edit',
      count: 1,
    });
    expect(grouper.getGroupInfo('https://example.com/products/abc-123-xyz/view?filter=active')).toEqual({
      groupPattern: '/products/abc-123-xyz/view',
      count: 1,
    });
  });

  it('should accept additional URLs via addUrls()', () => {
    const grouper = new UrlRoutesAnalyzer([
      'https://localhost/api/v1/customers/123',
      'https://localhost/api/v1/customers/456',
    ]);

    grouper.addUrls(['https://localhost/api/v1/customers/789', 'https://localhost/api/v1/customers/101']);

    const info = grouper.getGroupInfo('https://localhost/api/v1/customers/789');
    expect(info).toEqual({
      groupPattern: '/api/v1/customers/:dynamic',
      count: 4,
    });
  });

  it('should return null for URLs not in any group', () => {
    const urls = ['https://localhost/products/1', 'https://localhost/products/2'];
    const grouper = new UrlRoutesAnalyzer(urls);

    const info = grouper.getGroupInfo('https://localhost/nonexistent/path');
    expect(info).toBeNull();
  });
});
