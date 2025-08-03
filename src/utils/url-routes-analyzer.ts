export interface RouteGroupInfo {
  groupPattern: string;
  count: number;
}

export class UrlRoutesAnalyzer {
  private urls: string[] = [];
  private groupedPathCounts: Map<string, number> = new Map();

  constructor(initialUrls: string[] = []) {
    initialUrls.forEach((url) => this.validateUrl(url));
    this.urls.push(...new Set(initialUrls)); // prevent duplicates
    this.rebuildGroups();
  }

  public addUrls(urls: string[]): void {
    urls.forEach((url) => this.validateUrl(url));
    for (const url of urls) {
      if (!this.urls.includes(url)) {
        this.urls.push(url);
      }
    }
    this.rebuildGroups();
  }

  public getGroupInfo(url: string): RouteGroupInfo | null {
    const inputPath = this.extractPathname(url);
    const inputSegments = inputPath.split('/').filter(Boolean);

    for (const [pattern, count] of this.groupedPathCounts.entries()) {
      if (this.matchPattern(inputSegments, pattern)) {
        return { groupPattern: pattern, count };
      }
    }
    return null;
  }

  private rebuildGroups(): void {
    this.groupedPathCounts.clear();

    const groupsByLength = new Map<number, string[][]>();

    for (const url of this.urls) {
      const pathname = this.extractPathname(url);
      const segments = pathname.split('/').filter(Boolean);
      if (!groupsByLength.has(segments.length)) {
        groupsByLength.set(segments.length, []);
      }
      groupsByLength.get(segments.length)!.push(segments);
    }

    // Handle root URLs "/"
    if (groupsByLength.has(0)) {
      this.groupedPathCounts.set('/', groupsByLength.get(0)!.length);
    }

    for (const [length, groups] of groupsByLength.entries()) {
      if (length === 0) continue;

      const prefixGroups = new Map<string, string[][]>();

      for (const segments of groups) {
        const prefix = segments.slice(0, length - 1).join('/');
        if (!prefixGroups.has(prefix)) {
          prefixGroups.set(prefix, []);
        }
        prefixGroups.get(prefix)!.push(segments);
      }

      for (const [prefix, groupSegments] of prefixGroups.entries()) {
        const lastSegments = groupSegments.map((s) => s[length - 1]);
        const uniqueLastSegments = new Set(lastSegments);
        const allDynamic = lastSegments.every((seg) => this._isDynamicSegment(seg));

        if (
          allDynamic ||
          (uniqueLastSegments.size > 1 && Array.from(uniqueLastSegments).every((seg) => this._isDynamicSegment(seg)))
        ) {
          const groupPattern = (prefix ? '/' + prefix : '') + '/:dynamic';
          this.groupedPathCounts.set(groupPattern, groupSegments.length);
        } else {
          for (const segs of groupSegments) {
            const fullPath = '/' + segs.join('/');
            this.groupedPathCounts.set(fullPath, (this.groupedPathCounts.get(fullPath) || 0) + 1);
          }
        }
      }
    }
  }

  private matchPattern(inputSegments: string[], pattern: string): boolean {
    const patternSegments = pattern.split('/').filter(Boolean);
    if (inputSegments.length !== patternSegments.length) return false;

    for (let i = 0; i < patternSegments.length; i++) {
      const pSeg = patternSegments[i];
      const iSeg = inputSegments[i];
      if (pSeg === ':dynamic') continue;
      if (pSeg !== iSeg) return false;
    }
    return true;
  }

  private _isDynamicSegment(segment: string): boolean {
    if (/^\d+$/.test(segment)) return true;

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment)) return true;

    if (/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9\-]+$/.test(segment)) return true;

    return false;
  }

  private extractPathname(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.pathname;
    } catch {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  private validateUrl(url: string): void {
    this.extractPathname(url); // throws if invalid
  }
}
