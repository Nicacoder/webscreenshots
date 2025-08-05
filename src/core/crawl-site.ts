import ora from 'ora';
import { BrowserOptions, CrawlOptions, RetryOptions } from '../config/config.types.js';
import { CrawlService } from '../services/crawl-service.js';
import { normalizeRoute } from '../utils/normalize-route.js';
import { UrlRoutesAnalyzer } from '../utils/url-routes-analyzer.js';
import { sleep } from '../utils/sleep.js';

export async function crawlSite(
  crawlService: CrawlService,
  startUrl: string,
  browserOptions: BrowserOptions,
  crawlOptions: CrawlOptions,
  retryOptions: RetryOptions
): Promise<string[]> {
  const { crawlLimit, excludeRoutes, dynamicRoutesLimit } = crawlOptions;
  const normalizedExcludeRoutes = excludeRoutes?.map(normalizeRoute);

  console.log(`🔍 Crawling ${startUrl}`);
  const spinner = ora().start();

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
        spinner.info(`Skipping (group limit reached) - ${url}`);
        continue;
      }
    }

    spinner.text = url;
    spinner.start();

    let attempt = 0;
    const { maxAttempts = 1, delayMs = 0 } = retryOptions;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        if (attempt > 1) spinner.start(`${url} (attempt ${attempt}/${retryOptions.maxAttempts})`);

        const links = await crawlService.extractLinks(url, browserOptions);
        visited.add(url);
        analyzer.addUrls([url]);

        spinner.stop();
        spinner.info(
          crawlLimit ? `Found (${visited.size}/${crawlLimit}) - ${url}` : `Found (${visited.size}) - ${url}`
        );

        for (const link of links) {
          if (link.startsWith(origin) && !visited.has(link)) {
            queue.push(link);
          }
        }
        break;
      } catch (error) {
        if (attempt >= maxAttempts) spinner.fail(`Failed to crawl: ${url}`);

        if (attempt < maxAttempts && delayMs > 0) {
          await sleep(delayMs);
        }
      } finally {
        spinner.stop();
      }
    }
  }

  await crawlService.cleanup();
  return Array.from(visited);
}
