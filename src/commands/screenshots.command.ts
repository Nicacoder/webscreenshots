import { CommandModule, ArgumentsCamelCase } from 'yargs';
import { captureScreenshots } from '../core/capture-screenshots';
import { PuppeteerScreenshotService } from '../services/puppeteer/puppeteer.screenshot-service';
import { WebscreenshotsConfig } from '../config/config.types';

type Args = {
  site: string;
};

export const screenshotsCommand: CommandModule<{}, Args> = {
  command: '$0',
  describe: 'Capture screenshots of the specified website',
  builder: {
    site: {
      type: 'string',
      describe: 'The website URL to capture',
      demandOption: true,
    },
    output: {
      type: 'string',
      describe: 'Folder to save the screenshot in',
      default: 'screenshots',
    },
  },

  handler: async (args: ArgumentsCamelCase<Args>) => {
    const config: WebscreenshotsConfig = {
      url: args.site as string,
      outputDir: args.output as string,
    };

    const screenshotService = new PuppeteerScreenshotService();
    await captureScreenshots(config, screenshotService);
  },
};
