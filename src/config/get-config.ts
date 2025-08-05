import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { WebscreenshotsConfig } from './config.types.js';
import { LogService } from '../services/log-service.js';

const DEFAULT_CONFIG: WebscreenshotsConfig = {
  url: '',
  outputDir: 'screenshots',
  routes: [''],
  browserOptions: {
    headless: true,
    args: undefined,
  },
  captureOptions: {
    fullPage: true,
    imageType: 'png',
    quality: undefined,
  },
  viewports: [
    {
      name: 'desktop',
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
  ],
  crawl: false,
  crawlOptions: undefined,
  retryOptions: {
    maxAttempts: 3,
    delayMs: 0,
  },
};

export async function getConfig(
  logService: LogService,
  overrides: Partial<WebscreenshotsConfig> = {},
  configPath?: string
): Promise<WebscreenshotsConfig> {
  const defaultPaths = ['webscreenshots.json', 'webscreenshots.config.js', 'webscreenshots.config.ts'];
  const resolvedPath = configPath
    ? path.resolve(process.cwd(), configPath)
    : defaultPaths.map((p) => path.resolve(process.cwd(), p)).find((p) => fs.existsSync(p));

  let fileConfig: Partial<WebscreenshotsConfig> = {};
  if (resolvedPath) {
    try {
      if (resolvedPath.endsWith('.json')) {
        const raw = fs.readFileSync(resolvedPath, 'utf-8');
        fileConfig = JSON.parse(raw);
      } else {
        const imported = await import(pathToFileURL(resolvedPath).href);
        fileConfig = imported.default ?? imported;
      }
      logService.success(`Loaded config from ${resolvedPath}`);
    } catch (err) {
      logService.error(`Failed to load config from ${resolvedPath}:`);
      process.exit();
    }
  } else {
    logService.warning('No config file found, using defaults');
  }

  return {
    url: overrides.url ?? fileConfig.url ?? DEFAULT_CONFIG.url,
    outputDir: overrides.outputDir ?? fileConfig.outputDir ?? DEFAULT_CONFIG.outputDir,
    routes: overrides.routes ?? fileConfig.routes ?? DEFAULT_CONFIG.routes,
    browserOptions: { ...DEFAULT_CONFIG.browserOptions, ...fileConfig.browserOptions, ...overrides.browserOptions },
    captureOptions: { ...DEFAULT_CONFIG.captureOptions, ...fileConfig.captureOptions, ...overrides.captureOptions },
    viewports: overrides.viewports ?? fileConfig.viewports ?? DEFAULT_CONFIG.viewports,
    crawl: overrides.crawl ?? fileConfig.crawl ?? DEFAULT_CONFIG.crawl,
    crawlOptions: {
      ...DEFAULT_CONFIG.crawlOptions,
      ...fileConfig.crawlOptions,
      ...overrides.crawlOptions,
    },
    retryOptions: {
      ...DEFAULT_CONFIG.retryOptions,
      ...fileConfig.retryOptions,
      ...overrides.retryOptions,
    },
  };
}
