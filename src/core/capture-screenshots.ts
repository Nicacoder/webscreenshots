import { WebscreenshotsConfig, CaptureOptions, Viewport, RetryOptions } from '../config/config.types.js';
import { BrowserService } from '../services/browser-service.js';
import { LogService } from '../services/log-service.js';
import { generateFilePath } from '../utils/generate-file-path.js';
import { normalizeRoute } from '../utils/normalize-route.js';
import { normalizeUrl } from '../utils/normalize-url.js';
import { sleep } from '../utils/sleep.js';
import { crawlSite } from './crawl-site.js';

export async function captureScreenshots(
  config: WebscreenshotsConfig,
  browserService: BrowserService,
  logService: LogService
): Promise<void> {
  const baseUrl = normalizeUrl(config.url);
  let routes = config.routes.map(normalizeRoute);

  if (config.crawl) {
    const crawledUrls = await crawlSite(
      browserService,
      logService,
      baseUrl,
      config.crawlOptions ?? {},
      config.retryOptions
    );

    if (crawledUrls.length === 0) {
      logService.error('Unable to reach the URL. Aborting screenshot capture.');
      await browserService.cleanup();
      process.exit(1);
    }

    const crawledRoutes = crawledUrls.map((url) => normalizeRoute(new URL(url).pathname));
    routes = Array.from(new Set([...routes, ...crawledRoutes]));
  }

  logService.log('\n');
  logService.log(`📸 Capturing screenshots from ${baseUrl}`);
  let successCount = 0;
  let failureCount = 0;

  const viewports = config.viewports;
  const timestamp = new Date();

  for (const viewport of viewports) {
    logService.log(`\nViewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
    for (const route of routes) {
      const fullUrl = new URL(route, baseUrl).toString();
      const outputPath = generateFilePath({
        url: fullUrl,
        viewport: viewport.name,
        extension: config.captureOptions.imageType,
        pattern: config.outputPattern,
        outputDir: config.outputDir,
        timestamp: timestamp,
      });

      const success = await captureScreenshot(
        browserService,
        logService,
        fullUrl,
        outputPath,
        viewport,
        config.captureOptions,
        config.retryOptions
      );
      if (success) successCount++;
      else failureCount++;
    }
  }

  await cleanup(browserService, logService);
  printSummary(logService, successCount, failureCount);
}

async function captureScreenshot(
  broserService: BrowserService,
  logService: LogService,
  url: string,
  outputPath: string,
  viewport: Viewport,
  captureOptions: CaptureOptions,
  retryOptions: RetryOptions
): Promise<boolean> {
  const { maxAttempts = 1, delayMs = 0 } = retryOptions;
  let attempt = 0;

  logService.start(`📸 Capturing: ${url}`);

  while (attempt < maxAttempts) {
    attempt++;
    if (attempt > 1) {
      logService.log(`🔁 Retry (${attempt}/${retryOptions.maxAttempts}): ${url}`);
    }

    try {
      await broserService.captureScreenshot(url, outputPath, captureOptions, viewport);
      logService.success(`Saved ${url} → ${outputPath}\n`);
      return true;
    } catch (error) {
      if (attempt >= maxAttempts) {
        logService.error(`Failed to capture: ${url}`);
        logService.log(`↳ Reason: ${error instanceof Error ? error.message : String(error)}\n`);
      }
      if (attempt < maxAttempts && delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }

  return false;
}

async function cleanup(browserService: BrowserService, logService: LogService): Promise<void> {
  logService.log('\n');
  logService.start('🔄 Cleaning up');
  try {
    await browserService.cleanup();
    logService.success('Cleanup complete.');
  } catch {
    logService.error('Failed during cleanup.');
    process.exit(1);
  }
}

function printSummary(logService: LogService, successCount: number, failureCount: number): void {
  logService.log('\n📋 Summary');
  logService.log('---------------------');
  logService.log(`✅ Success: ${successCount}`);
  logService.log(`❌ Failures: ${failureCount}`);

  if (failureCount > 0) {
    process.exit(1);
  } else {
    logService.log('\nAll screenshots captured successfully!');
  }
}
