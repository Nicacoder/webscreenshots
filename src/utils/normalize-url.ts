export function normalizeUrl(input: string): string {
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(input)) {
    input = `https://${input}`;
  }

  try {
    return new URL(input).toString();
  } catch {
    throw new Error(`Invalid URL: "${input}"`);
  }
}
