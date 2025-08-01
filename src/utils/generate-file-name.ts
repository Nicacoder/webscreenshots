export function generateFileName(url: string, viewportName: string, imageType: string): string {
  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname.replace(/\./g, '-');
  const safeViewport = viewportName.toLowerCase().replace(/\s+/g, '-');

  return `${host}-${safeViewport}.${imageType}`;
}
