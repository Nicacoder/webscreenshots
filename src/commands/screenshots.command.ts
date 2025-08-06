import { CommandModule, ArgumentsCamelCase } from 'yargs';
import { getConfig } from '../config/get-config.js';
import { captureScreenshots } from '../core/capture-screenshots.js';
import { LogService } from '../services/log-service.js';
import { PuppeteerBrowserService } from '../services/puppeteer/puppeteer.browser-service.js';

type Args = {
  url?: string;
  output?: string;
  outputPattern?: string;
  config?: string;
  crawl?: boolean;
  crawlLimit?: number;
  dynamicRoutesLimit?: number;
  routes?: string[];
  excludeRoutes?: string[];
  fullPage?: boolean;
  imageType?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  headless?: boolean;
  browserArgs?: string[];
  maxAttempts?: number;
  delayMs?: number;
};

export const screenshotsCommand: CommandModule<{}, Args> = {
  command: '$0',
  describe: 'Capture screenshots of the specified website',
  builder: {
    url: { type: 'string', describe: 'The website URL to capture' },
    output: { type: 'string', describe: 'Folder to save the screenshot in' },
    outputPattern: {
      type: 'string',
      describe: 'Pattern for generated file names (default: {host}/{viewport}/{host}-{viewport}-{route}.{ext})',
    },
    config: { type: 'string', describe: 'Path to the config file' },
    crawl: { type: 'boolean', describe: 'Enable crawling to discover internal routes' },
    crawlLimit: { type: 'number', describe: 'Max number of pages to crawl' },
    dynamicRoutesLimit: { type: 'number', describe: 'Max dynamic routes per group' },
    routes: { type: 'array', describe: 'List of specific routes to capture' },
    excludeRoutes: { type: 'array', describe: 'List of routes to exclude during crawl' },
    fullPage: { type: 'boolean', describe: 'Capture full page screenshots' },
    imageType: { type: 'string', choices: ['png', 'jpeg', 'webp'] as const, describe: 'Screenshot format' },
    quality: { type: 'number', describe: 'Image quality (only for jpeg/webp)' },
    headless: { type: 'boolean', describe: 'Run browser in headless mode' },
    browserArgs: { type: 'array', describe: 'Arguments passed to puppeteer.launch' },
    maxAttemtps: { type: 'number', describe: 'Maximum number of attempts (default: 1)' },
    delayMs: { type: 'number', describe: 'Delay (ms) between retries' },
  },

  handler: async (args: ArgumentsCamelCase<Args>) => {
    const configOverrides: any = {};

    if (args.url) configOverrides.url = args.url;
    if (args.output) configOverrides.outputDir = args.output;
    if (args.outputPattern) configOverrides.outputPattern = args.outputPattern;
    if (args.routes) configOverrides.routes = args.routes as string[];
    if (args.crawl !== undefined) configOverrides.crawl = args.crawl;

    configOverrides.captureOptions = {
      ...(args.fullPage !== undefined && { fullPage: args.fullPage }),
      ...(args.imageType && { imageType: args.imageType }),
      ...(args.quality !== undefined && { quality: args.quality }),
    };

    configOverrides.browserOptions = {
      ...(args.headless !== undefined && { headless: args.headless }),
      ...(args.browserArgs && { args: args.browserArgs as string[] }),
    };

    if (args.crawlLimit !== undefined || args.dynamicRoutesLimit !== undefined || args.excludeRoutes !== undefined) {
      configOverrides.crawlOptions = {
        ...(args.crawlLimit !== undefined && { crawlLimit: args.crawlLimit }),
        ...(args.dynamicRoutesLimit !== undefined && { dynamicRoutesLimit: args.dynamicRoutesLimit }),
        ...(args.excludeRoutes && { excludeRoutes: args.excludeRoutes as string[] }),
      };
    }

    if (args.maxAttempts || args.delayMs) {
      configOverrides.retryOptions = {
        ...(args.maxAttempts !== undefined && { maxAttempts: args.maxAttempts }),
        ...(args.delayMs !== undefined && { delayMs: args.delayMs }),
      };
    }

    const logService = new LogService();

    const config = await getConfig(logService, configOverrides, args.config);
    if (!config.url) {
      logService.error('Missing required "url". Provide it via CLI or config file.');
      process.exit(1);
    }

    const browserService = new PuppeteerBrowserService(config.browserOptions);
    await captureScreenshots(config, browserService, logService);
  },
};
