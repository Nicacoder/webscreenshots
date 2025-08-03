import { CommandModule, ArgumentsCamelCase } from 'yargs';
import { getConfig } from '../config/get-config.js';
import { captureScreenshots } from '../core/capture-screenshots.js';
import { PuppeteerCrawlService } from '../services/puppeteer/puppeteer.crawl-service.js';
import { PuppeteerScreenshotService } from '../services/puppeteer/puppeteer.screenshot-service.js';
import { WebscreenshotsConfig } from '../config/config.types.js';

type Args = {
  site?: string;
  output?: string;
  config?: string;
  crawl?: boolean;
  crawlLimit?: number;
  dynamicRoutesLimit?: number;
};

export const screenshotsCommand: CommandModule<{}, Args> = {
  command: '$0',
  describe: 'Capture screenshots of the specified website',
  builder: {
    site: {
      type: 'string',
      describe: 'The website URL to capture',
    },
    output: {
      type: 'string',
      describe: 'Folder to save the screenshot in',
    },
    config: {
      type: 'string',
      describe: 'Path to the config file',
    },
    crawl: {
      type: 'boolean',
      describe: 'Enable crawling to discover internal routes',
    },
    crawlLimit: {
      type: 'number',
      describe: 'Maximum number of pages to crawl',
    },
    dynamicRoutesLimit: {
      type: 'number',
      describe: 'Maximum number of dynamic routes to include per group',
    },
  },

  handler: async (args: ArgumentsCamelCase<Args>) => {
    const configOverrides: Partial<WebscreenshotsConfig> = {};

    if (args.site) configOverrides.url = args.site;
    if (args.output) configOverrides.outputDir = args.output;
    if (args.crawl !== undefined) configOverrides.crawl = args.crawl;

    if (args.crawlLimit !== undefined || args.dynamicRoutesLimit !== undefined) {
      configOverrides.crawlOptions = {
        ...(configOverrides.crawlOptions ?? {}),
        ...(args.crawlLimit !== undefined && { crawlLimit: args.crawlLimit }),
        ...(args.dynamicRoutesLimit !== undefined && { dynamicRoutesLimit: args.dynamicRoutesLimit }),
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
