import ora from 'ora';
import { BrowserOptions, CrawlOptions } from '../config/config.types.js';
import { CrawlService } from '../services/crawl-service.js';
import { normalizeRoute } from '../utils/normalize-route.js';
import { UrlRoutesAnalyzer } from '../utils/url-routes-analyzer.js';

export async function crawlSite(
  startUrl: string,
  browserOptions: BrowserOptions,
  crawlOptions: CrawlOptions,
  crawlService: CrawlService
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

    spinner.start();
    try {
      const links = await crawlService.extractLinks(url, browserOptions);
      visited.add(url);
      analyzer.addUrls([url]);

      spinner.stop();
      spinner.info(crawlLimit ? `Found (${visited.size}/${crawlLimit}) - ${url}` : `Found (${visited.size}) - ${url}`);

      for (const link of links) {
        if (link.startsWith(origin) && !visited.has(link)) {
          queue.push(link);
        }
      }
    } catch (error) {
      spinner.warn(`⚠️ Failed to crawl: ${url}`);
    } finally {
      spinner.stop();
    }
  }

  await crawlService.cleanup();
  return Array.from(visited);
}
