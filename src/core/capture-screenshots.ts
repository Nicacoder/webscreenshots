import ora from 'ora';
import path from 'path';
import { Viewport } from 'puppeteer';
import { WebscreenshotsConfig, BrowserOptions, CaptureOptions } from '../config/config.types';
import { ScreenshotService } from '../services/screenshot-service';
import { generateFileName } from '../utils/generate-file-name';
import { normalizeUrl } from '../utils/normalize-url';

export async function captureScreenshots(
  config: WebscreenshotsConfig,
  screenshotService: ScreenshotService
): Promise<void> {
  const baseUrl = normalizeUrl(config.url);
  const routes = config.routes?.length ? config.routes : [''];

  let successCount = 0;
  let failureCount = 0;

  const viewports = config.viewports;
  for (const viewport of viewports) {
    console.log(`\nViewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
    for (const route of routes) {
      const fullUrl = new URL(route, baseUrl).toString();
      const fileName = generateFileName(fullUrl, viewport.name, config.captureOptions.imageType);
      const outputPath = path.join(config.outputDir, viewport.name, fileName);
      const success = await captureScreenshot(
        fullUrl,
        outputPath,
        viewport,
        config.browserOptions,
        config.captureOptions,
        screenshotService
      );
      if (success) successCount++;
      else failureCount++;
    }
  }
  await cleanup(screenshotService);
  printSummary(successCount, failureCount);
}

async function captureScreenshot(
  url: string,
  outputPath: string,
  viewport: Viewport,
  browserOptions: BrowserOptions,
  captureOptions: CaptureOptions,
  screenshotService: ScreenshotService
): Promise<boolean> {
  const spinner = ora(`📸 Capturing: ${url}`).start();
  try {
    await screenshotService.capture(url, outputPath, viewport, browserOptions, captureOptions);
    spinner.succeed(`Saved ${url} → ${outputPath}`);
    return true;
  } catch (error) {
    spinner.fail(`Failed to capture ${url}`);
    return false;
  }
}

async function cleanup(screenshotService: ScreenshotService): Promise<void> {
  console.log('');
  const spinner = ora('🔄 Cleaning up...').start();
  try {
    await screenshotService.release();
    spinner.succeed('Cleanup complete.');
  } catch {
    spinner.fail('Failed during cleanup.');
    process.exit(1);
  }
}

function printSummary(successCount: number, failureCount: number): void {
  console.log('\n📋 Summary');
  console.log('---------------------');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failures: ${failureCount}`);

  if (failureCount > 0) {
    process.exit(1);
  } else {
    console.log('\nAll screenshots captured successfully!');
  }
}
