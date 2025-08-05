import ora from 'ora';
import path from 'path';
import {
  WebscreenshotsConfig,
  BrowserOptions,
  CaptureOptions,
  Viewport,
  RetryOptions,
} from '../config/config.types.js';
import { CrawlService } from '../services/crawl-service.js';
import { ScreenshotService } from '../services/screenshot-service.js';
import { generateFileName } from '../utils/generate-file-name.js';
import { normalizeRoute } from '../utils/normalize-route.js';
import { normalizeUrl } from '../utils/normalize-url.js';
import { sleep } from '../utils/sleep.js';
import { crawlSite } from './crawl-site.js';

export async function captureScreenshots(
  config: WebscreenshotsConfig,
  screenshotService: ScreenshotService,
  crawlService: CrawlService
): Promise<void> {
  const baseUrl = normalizeUrl(config.url);
  let routes = config.routes.map(normalizeRoute);

  if (config.crawl) {
    const crawledUrls = await crawlSite(
      crawlService,
      baseUrl,
      config.browserOptions,
      config.crawlOptions ?? {},
      config.retryOptions
    );
    const crawledRoutes = crawledUrls.map((url) => normalizeRoute(new URL(url).pathname));
    routes = Array.from(new Set([...routes, ...crawledRoutes]));
  }

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
        screenshotService,
        fullUrl,
        outputPath,
        viewport,
        config.browserOptions,
        config.captureOptions,
        config.retryOptions
      );
      if (success) successCount++;
      else failureCount++;
    }
  }
  await cleanup(screenshotService);
  printSummary(successCount, failureCount);
}

async function captureScreenshot(
  screenshotService: ScreenshotService,
  url: string,
  outputPath: string,
  viewport: Viewport,
  browserOptions: BrowserOptions,
  captureOptions: CaptureOptions,
  retryOptions: RetryOptions
): Promise<boolean> {
  const { maxAttempts = 1, delayMs = 0 } = retryOptions;
  let attempt = 0;

  const spinner = ora(`📸 Capturing: ${url}`).start();
  while (attempt < maxAttempts) {
    attempt++;
    if (attempt > 1) spinner.start(`📸 Capturing: ${url} (attempt ${attempt}/${retryOptions.maxAttempts})`);
    try {
      await screenshotService.capture(url, outputPath, viewport, browserOptions, captureOptions);
      spinner.succeed(`Saved ${url} → ${outputPath}`);
      return true;
    } catch (error) {
      if (attempt >= maxAttempts) spinner.fail(`Failed to capture ${url}`);
      if (attempt < maxAttempts && delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }

  return false;
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
