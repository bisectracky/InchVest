export function createPageUrl(page: string): string {
  // Example implementation
  return `/${page.toLowerCase()}`;
}

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}