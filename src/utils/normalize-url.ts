export function normalizeUrl(input: string): string {
  try {
    new URL(input);
    return input;
  } catch {
    try {
      const corrected = `https://${input}`;
      new URL(corrected);
      return corrected;
    } catch {
      throw new Error(`Invalid URL: "${input}"`);
    }
  }
}
