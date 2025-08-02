export function normalizeRoute(route: string): string {
  return route.replace(/\/+$/, '');
}
