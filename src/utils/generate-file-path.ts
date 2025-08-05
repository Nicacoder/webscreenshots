import path from 'path';

export interface GenerateFilePathOptions {
  url: string;
  viewport: string;
  extension: string;
  pattern: string;
  outputDir: string;
  timestamp: Date;
}

export function generateFilePath({
  url,
  viewport,
  extension,
  pattern,
  outputDir,
  timestamp,
}: GenerateFilePathOptions): string {
  const parsed = new URL(url);
  const host = parsed.hostname.replace(/\./g, '-');
  const safeRoute = parsed.pathname.replace(/\//g, '-').replace(/^-|-$/g, '') || 'home';
  const safeViewport = viewport.toLowerCase().replace(/\s+/g, '-');
  const formattedTimestamp = timestamp.toISOString().replace(/[:.]/g, '-');

  const resolvedPath = pattern
    .replace(/{host}/g, host)
    .replace(/{viewport}/g, safeViewport)
    .replace(/{route}/g, safeRoute)
    .replace(/{ext}/g, extension)
    .replace(/{timestamp}/g, formattedTimestamp);

  return path.join(outputDir, resolvedPath);
}
