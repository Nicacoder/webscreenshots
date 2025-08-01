export function generateFileName(url: string, viewportName: string, imageType: string): string {
  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname.replace(/\./g, '-');
  const pathname =
    parsedUrl.pathname
      .replace(/^\/|\/$/g, '') // remove leading/trailing slashes
      .replace(/\//g, '-') || // replace slashes with dashes
    'home';
  const safeViewport = viewportName.toLowerCase().replace(/\s+/g, '-');

  return `${host}-${pathname}-${safeViewport}.${imageType}`;
}
