import ora from 'ora';
import path from 'path';
import { WebscreenshotsConfig } from '../config/config.types';
import { ScreenshotService } from '../services/screenshot-service';
import { generateFileName } from '../utils/generate-file-name';
import { normalizeUrl } from '../utils/normalize-url';

export async function captureScreenshots(
  config: WebscreenshotsConfig,
  screenshotService: ScreenshotService
): Promise<void> {
  const url = normalizeUrl(config.url);
  const viewports = config.viewports;
  const captureOptions = config.captureOptions;
  const browserOptions = config.browserOptions;

  for (const viewport of viewports) {
    const fileName = generateFileName(url, viewport.name, captureOptions.imageType);
    const outputPath = path.join(config.outputDir, viewport.name, fileName);

    const spinner = ora(`📸 Capturing: ${url} → ${viewport.name}`).start();
    try {
      await screenshotService.capture(url, outputPath, viewport, browserOptions, captureOptions);
      spinner.succeed(`Saved ${url} → ${outputPath}`);
    } catch (error) {
      spinner.fail(`Failed to capture ${url}: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  await screenshotService.release();
}
