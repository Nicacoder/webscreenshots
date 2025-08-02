import ora from 'ora';
import { CrawlOptions } from '../config/config.types';
import { CrawlService } from '../services/crawl-service';
import { normalizeRoute } from '../utils/normalize-route';

export async function crawlSite(
  startUrl: string,
  options: CrawlOptions = {},
  crawlService: CrawlService
): Promise<string[]> {
  const limit = options.crawlLimit;
  const excludeRoutes = options.excludeRoutes?.map(normalizeRoute);

  console.log(`🔍 Crawling ${startUrl}`);
  const spinner = ora().start();

  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const origin = new URL(startUrl).origin;

  while (queue.length > 0 && (limit === undefined || visited.size < limit)) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;

    const relativePath = new URL(url).pathname;
    if (excludeRoutes?.some((pattern) => relativePath.startsWith(pattern))) continue;

    spinner.start();
    try {
      const links = await crawlService.extractLinks(url);
      visited.add(url);

      spinner.stop();
      spinner.info(limit ? `Found (${visited.size}/${limit}) - ${url}` : `Found (${visited.size}) - ${url}`);

      for (const link of links) {
        if (link.startsWith(origin) && !visited.has(link)) {
          queue.push(link);
        }
      }
    } catch (error) {
      spinner.warn(`Failed to crawl: ${url}`);
    } finally {
      spinner.stop();
    }
  }

  await crawlService.cleanup();
  return Array.from(visited);
}
