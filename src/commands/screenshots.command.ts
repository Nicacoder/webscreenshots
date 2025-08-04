import { CommandModule, ArgumentsCamelCase } from 'yargs';
import { getConfig } from '../config/get-config.js';
import { captureScreenshots } from '../core/capture-screenshots.js';
import { PuppeteerCrawlService } from '../services/puppeteer/puppeteer.crawl-service.js';
import { PuppeteerScreenshotService } from '../services/puppeteer/puppeteer.screenshot-service.js';

type Args = {
  url?: string;
  output?: string;
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
};

export const screenshotsCommand: CommandModule<{}, Args> = {
  command: '$0',
  describe: 'Capture screenshots of the specified website',
  builder: {
    url: { type: 'string', describe: 'The website URL to capture' },
    output: { type: 'string', describe: 'Folder to save the screenshot in' },
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
  },

  handler: async (args: ArgumentsCamelCase<Args>) => {
    const configOverrides: any = {};

    if (args.url) configOverrides.url = args.url;
    if (args.output) configOverrides.outputDir = args.output;
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

    const config = await getConfig(configOverrides, args.config);
    if (!config.url) {
      console.error('❌ Missing required "url". Provide it via CLI or config file.');
      process.exit(1);
    }

    const screenshotService = new PuppeteerScreenshotService();
    const crawlService = new PuppeteerCrawlService();
    await captureScreenshots(config, screenshotService, crawlService);
  },
};
