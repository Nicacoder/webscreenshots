export function generateFileName(url: string): string {
  const sanitized = url.replace(/^https?:\/\//, '').replace(/[\/:?#&=]/g, '_');
  return `${sanitized}.png`;
}
