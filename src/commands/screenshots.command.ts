import { CommandModule, ArgumentsCamelCase } from 'yargs';
import { getConfig } from '../config/get-config';
import { captureScreenshots } from '../core/capture-screenshots';
import { PuppeteerScreenshotService } from '../services/puppeteer/puppeteer.screenshot-service';

type Args = {
  site: string;
  config: string;
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
  },

  handler: async (args: ArgumentsCamelCase<Args>) => {
    const configOverrides: Partial<{ url: string; outputDir: string }> = {
      url: args.site as string,
      outputDir: args.output as string,
    };
    const config = await getConfig(configOverrides, args.config);
    if (!config.url) {
      console.error('❌ Missing required "url". Provide it via CLI or config file.');
      process.exit(1);
    }

    const screenshotService = new PuppeteerScreenshotService();
    await captureScreenshots(config, screenshotService);
  },
};
