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
  const fileName = generateFileName(url);
  const outputPath = path.join(config.outputDir, fileName);

  const spinner = ora(`📸 Capturing: ${url}`).start();
  try {
    await screenshotService.capture(url, outputPath);
    spinner.succeed(`Saved ${url} → ${outputPath}`);
  } catch (error) {
    spinner.fail(`Failed to capture ${url}: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
