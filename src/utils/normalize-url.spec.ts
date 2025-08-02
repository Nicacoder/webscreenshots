import { describe, it, expect } from 'vitest';
import { normalizeUrl } from './normalize-url';

describe('normalizeUrl', () => {
  it('should return the same valid URL if it already has a protocol', () => {
    const input = 'https://example.com/path';
    const output = normalizeUrl(input);
    expect(output).toBe('https://example.com/path');
  });

  it('should add https:// to URLs without a protocol', () => {
    const input = 'example.com/path';
    const output = normalizeUrl(input);
    expect(output).toBe('https://example.com/path');
  });

  it('should correctly normalize HTTP URLs without protocol', () => {
    const input = 'localhost:3000/api';
    const output = normalizeUrl(input);
    expect(output).toBe('https://localhost:3000/api');
  });

  it('should correctly normalize a domain without path', () => {
    const input = 'example.com';
    const output = normalizeUrl(input);
    expect(output).toBe('https://example.com/');
  });

  it('should throw an error for an invalid URL', () => {
    expect(() => normalizeUrl('%%%')).toThrow('Invalid URL: "%%%');
  });

  it('should support custom protocols like ftp://', () => {
    const input = 'ftp://example.com/files';
    const output = normalizeUrl(input);
    expect(output).toBe('ftp://example.com/files');
  });
});
