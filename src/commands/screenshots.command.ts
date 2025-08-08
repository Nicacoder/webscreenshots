import { CommandModule, ArgumentsCamelCase } from 'yargs';
import { getConfig } from '../config/get-config.js';
import { captureScreenshots } from '../core/capture-screenshots.js';
import { LogService } from '../services/log-service.js';
import { PuppeteerBrowserService } from '../services/puppeteer/puppeteer.browser-service.js';

type Args = {
  url?: string;
  routes?: string[];
  crawl?: boolean;
  crawlLimit?: number;
  dynamicRoutesLimit?: number;
  excludeRoutes?: string[];

  output?: string;
  outputPattern?: string;

  headless?: boolean;
  browserArgs?: string[];
  viewports?: string;

  fullPage?: boolean;
  imageType?: 'png' | 'jpeg' | 'webp';
  quality?: number;

  maxAttempts?: number;
  delayMs?: number;

  config?: string;
};

export const screenshotsCommand: CommandModule<{}, Args> = {
  command: '$0',
  describe: 'Capture screenshots of the specified website',
  builder: {
    url: { type: 'string', describe: 'The website URL to capture' },
    routes: { type: 'array', describe: 'List of specific routes to capture' },
    crawl: { type: 'boolean', describe: 'Enable crawling to discover internal routes' },
    crawlLimit: { type: 'number', describe: 'Max number of pages to crawl' },
    dynamicRoutesLimit: { type: 'number', describe: 'Max dynamic routes per group' },
    excludeRoutes: { type: 'array', describe: 'List of routes to exclude during crawl' },

    output: { type: 'string', describe: 'Folder to save the screenshot in' },
    outputPattern: {
      type: 'string',
      describe: 'Pattern for generated file names (default: {host}/{viewport}/{host}-{viewport}-{route}.{ext})',
    },

    headless: { type: 'boolean', describe: 'Run browser in headless mode' },
    browserArgs: { type: 'array', describe: 'Arguments passed to puppeteer.launch' },
    viewports: { type: 'string', describe: 'List of viewports in JSON: [{name,width,height,deviceScaleFactor}]' },

    fullPage: { type: 'boolean', describe: 'Capture full page screenshots' },
    imageType: { type: 'string', choices: ['png', 'jpeg', 'webp'] as const, describe: 'Screenshot format' },
    quality: { type: 'number', describe: 'Image quality (only for jpeg/webp)' },

    maxAttemtps: { type: 'number', describe: 'Maximum number of attempts (default: 1)' },
    delayMs: { type: 'number', describe: 'Delay (ms) between retries' },

    config: { type: 'string', describe: 'Path to the config file' },
  },

  handler: async (args: ArgumentsCamelCase<Args>) => {
    const configOverrides: any = {};

    if (args.url) configOverrides.url = args.url;
    if (args.routes) configOverrides.routes = args.routes as string[];
    if (args.crawl !== undefined) configOverrides.crawl = args.crawl;
    if (args.crawlLimit !== undefined || args.dynamicRoutesLimit !== undefined || args.excludeRoutes !== undefined) {
      configOverrides.crawlOptions = {
        ...(args.crawlLimit !== undefined && { crawlLimit: args.crawlLimit }),
        ...(args.dynamicRoutesLimit !== undefined && { dynamicRoutesLimit: args.dynamicRoutesLimit }),
        ...(args.excludeRoutes && { excludeRoutes: args.excludeRoutes as string[] }),
      };
    }

    if (args.output) configOverrides.outputDir = args.output;
    if (args.outputPattern) configOverrides.outputPattern = args.outputPattern;

    configOverrides.browserOptions = {
      ...(args.headless !== undefined && { headless: args.headless }),
      ...(args.browserArgs && { args: args.browserArgs as string[] }),
    };

    if (args.viewports) {
      try {
        configOverrides.viewports = JSON.parse(args.viewports);
      } catch {
        throw new Error(`Invalid JSON for viewports: "${args.viewports}"`);
      }
    }

    configOverrides.captureOptions = {
      ...(args.fullPage !== undefined && { fullPage: args.fullPage }),
      ...(args.imageType && { imageType: args.imageType }),
      ...(args.quality !== undefined && { quality: args.quality }),
    };

    if (args.maxAttempts || args.delayMs) {
      configOverrides.retryOptions = {
        ...(args.maxAttempts !== undefined && { maxAttempts: args.maxAttempts }),
        ...(args.delayMs !== undefined && { delayMs: args.delayMs }),
      };
    }

    const logService = new LogService();

    const config = await getConfig(logService, configOverrides, args.config);
    if (!config.url) {
      logService.error('Missing required "url". Provide it via CLI, config file or enviroment variables.');
      process.exit(1);
    }

    const browserService = new PuppeteerBrowserService(logService, config.browserOptions);
    await captureScreenshots(config, browserService, logService);
  },
};
