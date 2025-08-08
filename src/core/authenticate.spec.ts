import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate } from './authenticate';
import type { BrowserService } from '../services/browser-service';
import type { LogService } from '../services/log-service';
import type { AuthOptions } from '../config/config.types';
import * as sleepUtils from '../utils/sleep';

const mockSleep = vi.spyOn(sleepUtils, 'sleep').mockResolvedValue(undefined);

const mockLogService: LogService = {
  start: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
};

function createMockBrowserService(authenticateImpl: (options: AuthOptions) => Promise<boolean>): BrowserService {
  return {
    setAuthentication: vi.fn(authenticateImpl),
    extractLinks: vi.fn(),
    captureScreenshot: vi.fn(),
    cleanup: vi.fn(),
  };
}

describe('authenticate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when method is not provided', async () => {
    const browserService = createMockBrowserService(() => Promise.resolve(true));
    const result = await authenticate(browserService, mockLogService, {} as AuthOptions, {
      maxAttempts: 1,
      delayMs: 0,
    });
    expect(result).toBe(false);
    expect(mockLogService.info).toHaveBeenCalledWith('No authentication method has been configured');
  });

  it('returns false on unsupported method', async () => {
    const browserService = createMockBrowserService(() => Promise.resolve(true));
    const result = await authenticate(
      browserService,
      mockLogService,
      { method: 'unsupported' as any },
      { maxAttempts: 1, delayMs: 0 }
    );
    expect(result).toBe(false);
    expect(mockLogService.info).toHaveBeenCalledWith(`'unsupported' is not supported`);
  });

  it('returns false if basic auth config is incomplete', async () => {
    const browserService = createMockBrowserService(() => Promise.resolve(true));
    const result = await authenticate(
      browserService,
      mockLogService,
      { method: 'basic', basic: {} as any },
      {
        maxAttempts: 1,
        delayMs: 0,
      }
    );
    expect(result).toBe(false);
    expect(mockLogService.error).toHaveBeenCalledWith(`Missing 'username' or 'password' in basic auth configuration`);
  });

  it('returns false if token auth config is incomplete', async () => {
    const browserService = createMockBrowserService(() => Promise.resolve(true));
    const result = await authenticate(
      browserService,
      mockLogService,
      { method: 'token', token: {} as any },
      {
        maxAttempts: 1,
        delayMs: 0,
      }
    );
    expect(result).toBe(false);
    expect(mockLogService.error).toHaveBeenCalledWith(`Missing 'header' or 'value' in token auth configuration`);
  });

  it('returns false if cookiesPath is missing', async () => {
    const browserService = createMockBrowserService(() => Promise.resolve(true));
    const result = await authenticate(
      browserService,
      mockLogService,
      { method: 'cookie' },
      {
        maxAttempts: 1,
        delayMs: 0,
      }
    );
    expect(result).toBe(false);
    expect(mockLogService.error).toHaveBeenCalledWith(`Missing 'cookiesPath' in cookie auth configuration`);
  });

  it('returns false if form config is incomplete', async () => {
    const browserService = createMockBrowserService(() => Promise.resolve(true));
    const result = await authenticate(
      browserService,
      mockLogService,
      {
        method: 'form',
        form: { loginUrl: '', inputs: {}, submit: '', timeoutMs: 100 },
      },
      { maxAttempts: 1, delayMs: 0 }
    );
    expect(result).toBe(false);
    expect(mockLogService.error).toHaveBeenCalledWith(
      `Invalid form configuration. Ensure 'loginUrl', 'inputs' and 'submit' are set`
    );
  });

  it('calls setAuthentication once and succeeds (basic auth)', async () => {
    const browserService = createMockBrowserService(() => Promise.resolve(true));
    const result = await authenticate(
      browserService,
      mockLogService,
      {
        method: 'basic',
        basic: { username: 'user', password: 'pass' },
      },
      { maxAttempts: 3, delayMs: 100 }
    );

    expect(result).toBe(true);
    expect(browserService.setAuthentication).toHaveBeenCalledTimes(1);
    expect(mockSleep).not.toHaveBeenCalled();
  });

  it('calls setAuthentication once and succeeds (token auth)', async () => {
    const browserService = createMockBrowserService(() => Promise.resolve(true));
    const result = await authenticate(
      browserService,
      mockLogService,
      {
        method: 'token',
        token: { header: 'Authorization', value: '123' },
      },
      { maxAttempts: 2, delayMs: 0 }
    );

    expect(result).toBe(true);
    expect(browserService.setAuthentication).toHaveBeenCalledTimes(1);
    expect(mockSleep).not.toHaveBeenCalled();
  });

  it('retries for form auth and eventually succeeds', async () => {
    const authMock = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const browserService = createMockBrowserService(authMock);
    const result = await authenticate(
      browserService,
      mockLogService,
      {
        method: 'form',
        form: {
          loginUrl: 'https://example.com',
          inputs: { 'input[name=email]': 'test@example.com' },
          submit: 'button[type=submit]',
          timeoutMs: 1000,
        },
      },
      { maxAttempts: 3, delayMs: 100 }
    );

    expect(result).toBe(true);
    expect(authMock).toHaveBeenCalledTimes(2);
    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(mockLogService.log).toHaveBeenCalledWith('🔁 Retry (2/3)');
  });

  it('fails after max attempts with cookie auth', async () => {
    const browserService = createMockBrowserService(() => Promise.resolve(false));
    const result = await authenticate(
      browserService,
      mockLogService,
      {
        method: 'cookie',
        cookiesPath: './fake.json',
      },
      { maxAttempts: 2, delayMs: 50 }
    );

    expect(result).toBe(false);
    expect(browserService.setAuthentication).toHaveBeenCalledTimes(2);
    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(mockLogService.error).toHaveBeenCalledWith(expect.stringContaining('Failed to authenticate'));
  });

  it('handles error and logs it on final attempt', async () => {
    const error = new Error('Network failed');
    const authMock = vi.fn().mockRejectedValue(error);
    const browserService = createMockBrowserService(authMock);

    const result = await authenticate(
      browserService,
      mockLogService,
      {
        method: 'cookie',
        cookiesPath: 'something.json',
      },
      { maxAttempts: 2, delayMs: 10 }
    );

    expect(result).toBe(false);
    expect(authMock).toHaveBeenCalledTimes(2);
    expect(mockLogService.log).toHaveBeenCalledWith(expect.stringContaining('Reason: Network failed'));
    expect(mockLogService.error).toHaveBeenCalledWith(expect.stringContaining('Failed to authenticate'));
  });
});
