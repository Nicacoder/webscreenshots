import { CrawlOptions, RetryOptions } from '../config/config.types.js';
import { BrowserService } from '../services/browser-service.js';
import { LogService } from '../services/log-service.js';
import { normalizeRoute } from '../utils/normalize-route.js';
import { sleep } from '../utils/sleep.js';
import { UrlRoutesAnalyzer } from '../utils/url-routes-analyzer.js';

export async function crawlSite(
  browserService: BrowserService,
  logService: LogService,
  startUrl: string,
  crawlOptions: CrawlOptions,
  retryOptions: RetryOptions
): Promise<string[]> {
  const { crawlLimit, excludeRoutes, dynamicRoutesLimit } = crawlOptions;
  const normalizedExcludeRoutes = excludeRoutes?.map(normalizeRoute);

  logService.log('\n');
  logService.log(`🔍 Starting crawl: ${startUrl}\n`);

  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const origin = new URL(startUrl).origin;

  const analyzer = new UrlRoutesAnalyzer();

  while (queue.length > 0 && (crawlLimit === undefined || visited.size < crawlLimit)) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;

    const relativePath = new URL(url).pathname;
    if (normalizedExcludeRoutes?.some((pattern) => relativePath.startsWith(pattern))) continue;

    if (dynamicRoutesLimit !== undefined) {
      const info = analyzer.getGroupInfo(url);
      if (info && info.count >= dynamicRoutesLimit) {
        logService.log(`Skipping (group limit reached) - ${url}`);
        continue;
      }
    }

    logService.start(`➡️  Visiting: ${url}`);

    let attempt = 0;
    const { maxAttempts = 1, delayMs = 0 } = retryOptions;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        if (attempt > 1) {
          logService.log(`🔁 Retry (${attempt}/${maxAttempts}): ${url}`);
        }

        const links = await browserService.extractLinks(url);
        visited.add(url);
        analyzer.addUrls([url]);

        const msg = crawlLimit
          ? `🔗 Found page ${visited.size} of ${crawlLimit}\n`
          : `🔗 Found page ${visited.size} (no limit)\n`;
        logService.log(msg);

        for (const link of links) {
          if (link.startsWith(origin) && !visited.has(link)) {
            queue.push(link);
          }
        }
        break;
      } catch (error) {
        if (attempt >= maxAttempts) {
          logService.error(`Unreachable after ${attempt} attempts: ${url}`);
          logService.log(`↳ Reason: ${error instanceof Error ? error.message : String(error)}\n`);
        } else if (delayMs > 0) {
          await sleep(delayMs);
        }
      }
    }
  }

  return Array.from(visited);
}
