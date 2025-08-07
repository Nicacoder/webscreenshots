import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { LogService } from '../services/log-service';
import type { WebscreenshotsConfig } from './config.types';
import { getConfig, loadConfigFromEnv, loadConfigFromFile } from './get-config';

const fakeLogger: LogService = {
  start: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
};

const mockConfigPath = path.join(process.cwd(), 'webscreenshots.test.json');

const fakeFileConfig: Partial<WebscreenshotsConfig> = {
  url: 'https://from-file.com',
  outputDir: 'file-screenshots',
  routes: ['/home', '/about'],
};

beforeEach(() => {
  process.env = {};
  vi.clearAllMocks();
});

afterEach(() => {
  if (fs.existsSync(mockConfigPath)) fs.unlinkSync(mockConfigPath);
});

describe('loadConfigFromEnv', () => {
  it('parses flat and nested values from environment', () => {
    process.env.WEBSCREENSHOTS__URL = 'https://from-env.com';
    process.env.WEBSCREENSHOTS__OUTPUTDIR = 'env-screenshots';
    process.env.WEBSCREENSHOTS__BROWSEROPTIONS__HEADLESS = 'false';
    process.env.WEBSCREENSHOTS__VIEWPORTS = JSON.stringify([
      { name: 'mobile', width: 375, height: 667, deviceScaleFactor: 2 },
      { name: 'desktop', width: 1920, height: 1080 },
    ]);

    const config = loadConfigFromEnv(fakeLogger);

    expect(config.url).toBe('https://from-env.com');
    expect(config.outputDir).toBe('env-screenshots');
    expect(config.browserOptions?.headless).toBe(false);
    expect(config.viewports).toEqual([
      { name: 'mobile', width: 375, height: 667, deviceScaleFactor: 2 },
      { name: 'desktop', width: 1920, height: 1080 },
    ]);
  });

  it('cleans undefined values from the resulting config object', () => {
    process.env.WEBSCREENSHOTS__URL = 'https://example.com';
    process.env.WEBSCREENSHOTS__CAPTUREOPTIONS__FULLPAGE = 'true';

    const config = loadConfigFromEnv(fakeLogger);

    expect(config).toEqual({
      url: 'https://example.com',
      captureOptions: {
        fullPage: true,
      },
    });

    expect(config.outputDir).toBeUndefined();
    expect(config.captureOptions?.imageType).toBeUndefined();
  });

  it('parses all supported environment variables into full config', () => {
    Object.assign(process.env, {
      // Top-level
      WEBSCREENSHOTS__URL: 'https://example.com',
      WEBSCREENSHOTS__OUTPUTDIR: 'custom-screenshots',
      WEBSCREENSHOTS__OUTPUTPATTERN: '{host}/{route}/{viewport}.{ext}',
      WEBSCREENSHOTS__ROUTES: '/home,/about',

      // Browser options
      WEBSCREENSHOTS__BROWSEROPTIONS__HEADLESS: 'false',
      WEBSCREENSHOTS__BROWSEROPTIONS__ARGS: '--no-sandbox,--disable-gpu',

      // Capture options
      WEBSCREENSHOTS__CAPTUREOPTIONS__FULLPAGE: 'true',
      WEBSCREENSHOTS__CAPTUREOPTIONS__IMAGETYPE: 'jpeg',
      WEBSCREENSHOTS__CAPTUREOPTIONS__QUALITY: '80',

      // Viewports
      WEBSCREENSHOTS__VIEWPORTS: JSON.stringify([
        {
          name: 'mobile',
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
        },
        {
          name: 'desktop',
          width: 1920,
          height: 1080,
        },
      ]),

      // Crawl options
      WEBSCREENSHOTS__CRAWL: 'true',
      WEBSCREENSHOTS__CRAWLOPTIONS__CRAWLLIMIT: '10',
      WEBSCREENSHOTS__CRAWLOPTIONS__EXCLUDEROUTES: '/private,/login',
      WEBSCREENSHOTS__CRAWLOPTIONS__DYNAMICROUTESLIMIT: '5',

      // Retry options
      WEBSCREENSHOTS__RETRYOPTIONS__MAXATTEMPTS: '4',
      WEBSCREENSHOTS__RETRYOPTIONS__DELAYMS: '1000',
    });

    const config = loadConfigFromEnv(fakeLogger);

    expect(config).toEqual({
      url: 'https://example.com',
      outputDir: 'custom-screenshots',
      outputPattern: '{host}/{route}/{viewport}.{ext}',
      routes: ['/home', '/about'],

      browserOptions: {
        headless: false,
        args: ['--no-sandbox', '--disable-gpu'],
      },

      captureOptions: {
        fullPage: true,
        imageType: 'jpeg',
        quality: 80,
      },

      viewports: [
        { name: 'mobile', width: 375, height: 667, deviceScaleFactor: 2 },
        { name: 'desktop', width: 1920, height: 1080 },
      ],

      crawl: true,
      crawlOptions: {
        crawlLimit: 10,
        excludeRoutes: ['/private', '/login'],
        dynamicRoutesLimit: 5,
      },

      retryOptions: {
        maxAttempts: 4,
        delayMs: 1000,
      },
    });
  });
});

describe('loadConfigFromFile', () => {
  it('loads a config from a JSON file', async () => {
    fs.writeFileSync(mockConfigPath, JSON.stringify(fakeFileConfig), 'utf-8');
    const config = await loadConfigFromFile(fakeLogger, 'webscreenshots.test.json');

    expect(config).toEqual(fakeFileConfig);
    expect(fakeLogger.success).toHaveBeenCalledWith(expect.stringContaining('Loaded config from'));
  });

  it('fails and exists if provided file is not found', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });
    await expect(loadConfigFromFile(fakeLogger, 'nonexistent.json')).rejects.toThrow('exit');
    expect(fakeLogger.error).toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  it('fails and exits on invalid JSON', async () => {
    fs.writeFileSync(mockConfigPath, '{bad json}', 'utf-8');
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });

    await expect(loadConfigFromFile(fakeLogger, 'webscreenshots.test.json')).rejects.toThrow('exit');
    expect(fakeLogger.error).toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  it('loads all supported configuration values from JSON file', async () => {
    const fullFileConfig: Partial<WebscreenshotsConfig> = {
      url: 'https://from-file.com',
      outputDir: 'file-screenshots',
      outputPattern: '{host}/{route}/{viewport}.{ext}',
      routes: ['/home', '/about'],

      browserOptions: {
        headless: false,
        args: ['--no-sandbox', '--disable-gpu'],
      },

      captureOptions: {
        fullPage: true,
        imageType: 'jpeg',
        quality: 80,
      },

      crawl: true,
      crawlOptions: {
        crawlLimit: 10,
        excludeRoutes: ['/private', '/login'],
        dynamicRoutesLimit: 5,
      },

      viewports: [
        { name: 'mobile', width: 375, height: 667, deviceScaleFactor: 2 },
        { name: 'desktop', width: 1920, height: 1080 },
      ],

      retryOptions: {
        maxAttempts: 4,
        delayMs: 1000,
      },
    };

    fs.writeFileSync(mockConfigPath, JSON.stringify(fullFileConfig), 'utf-8');

    const config = await loadConfigFromFile(fakeLogger, 'webscreenshots.test.json');

    expect(config).toEqual(fullFileConfig);
  });
});

describe('getConfig', () => {
  it('merges config from default, file, env, and overrides', async () => {
    fs.writeFileSync(mockConfigPath, JSON.stringify({ url: 'https://file.com' }), 'utf-8');
    process.env.WEBSCREENSHOTS__OUTPUTDIR = 'env-output';
    const overrides = { outputDir: 'override-output' };

    const config = await getConfig(fakeLogger, overrides, 'webscreenshots.test.json');

    expect(config.url).toBe('https://file.com'); // from file
    expect(config.outputDir).toBe('override-output'); // from override
    expect(config.routes).toEqual(['']); // from default
  });

  it('returns default config when nothing else is provided', async () => {
    const config = await getConfig(fakeLogger);
    expect(config.url).toBe('');
    expect(config.outputDir).toBe('screenshots');
  });
});
