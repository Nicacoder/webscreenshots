import { describe, it, expect } from 'vitest';
import { normalizeRoute } from './normalize-route';

describe('normalizeRoute', () => {
  it('should remove a single trailing slash', () => {
    expect(normalizeRoute('/about/')).toBe('/about');
  });

  it('should remove multiple trailing slashes', () => {
    expect(normalizeRoute('/contact///')).toBe('/contact');
  });

  it('should not affect routes without trailing slashes', () => {
    expect(normalizeRoute('/blog')).toBe('/blog');
  });

  it('should preserve leading slashes', () => {
    expect(normalizeRoute('/services/')).toBe('/services');
  });

  it('should return an empty string if input is "/"', () => {
    expect(normalizeRoute('/')).toBe('');
  });

  it('should not alter an empty string', () => {
    expect(normalizeRoute('')).toBe('');
  });

  it('should handle root-level paths correctly', () => {
    expect(normalizeRoute('/home/')).toBe('/home');
  });
});
