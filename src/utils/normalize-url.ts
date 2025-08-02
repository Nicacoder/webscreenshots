export function normalizeUrl(input: string): string {
  const normalized = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(input) ? input : `https://${input}`;
  try {
    return new URL(normalized).toString();
  } catch {
    throw new Error(`Invalid URL: "${input}"`);
  }
}
