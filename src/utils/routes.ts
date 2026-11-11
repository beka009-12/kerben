const FULLSCREEN = /^\/[^/]+\/chat(?:\/|$)/;
const ADMIN = /^\/[^/]+\/admin(?:\/|$)/;

export function isFullscreenPage(pathname: string): boolean {
  return FULLSCREEN.test(pathname);
}

export function isAdminPage(pathname: string): boolean {
  return ADMIN.test(pathname);
}

export function safeNext(value: string | null): string | null {
  return value && /^\/(?!\/)[\w\-/?=&#%.]*$/.test(value) ? value : null;
}
