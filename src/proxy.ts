import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, ADMIN_REFRESH_COOKIE, refreshAdminTokens, writeAdminSession } from "@/utils/admin/tokens";
import { BACKEND_URL } from "@/utils/api/backend";
import { hasLocale, LOCALE_COOKIE, negotiateLocale } from "@/utils/i18n/config";

const ADMIN = /^\/([^/]+)\/admin(\/.*)?$/;
const ADMIN_HOME = "/ru/admin";

function adminHosts(): string[] {
  return (process.env.ADMIN_HOSTS ?? "admin.localhost")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminHost(host: string): boolean {
  const label = host.split(".")[0];
  return adminHosts().includes(host) || label === "admin" || label.endsWith("-admin");
}

const notFound = (request: NextRequest, lang: string) => NextResponse.rewrite(new URL(`/${lang}/__missing`, request.url));
const redirectTo = (request: NextRequest, path: string) => NextResponse.redirect(new URL(path, request.url));

async function renewAdmin(request: NextRequest, refreshToken: string, lang: string) {
  const tokens = await refreshAdminTokens(BACKEND_URL, refreshToken);
  if (!tokens) return redirectTo(request, `/${lang}/admin/login?expired=1`);
  request.cookies.set(ADMIN_COOKIE, tokens.accessToken);
  const response = NextResponse.next({ request: { headers: request.headers } });
  writeAdminSession(response.cookies, tokens);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") ?? request.nextUrl.host).split(":")[0].toLowerCase();
  const admin = ADMIN.exec(pathname);
  const access = request.cookies.get(ADMIN_COOKIE)?.value;
  const refresh = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  const signedIn = Boolean(access || refresh);

  if (isAdminHost(host)) {
    if (pathname === "/") return redirectTo(request, signedIn ? ADMIN_HOME : `${ADMIN_HOME}/login`);
    if (!admin || !hasLocale(admin[1])) return notFound(request, "ru");
    const isLogin = admin[2] === "/login";
    if (isLogin && request.nextUrl.searchParams.has("expired")) {
      const response = NextResponse.next();
      response.cookies.delete(ADMIN_COOKIE);
      response.cookies.delete(ADMIN_REFRESH_COOKIE);
      return response;
    }
    if (isLogin && signedIn) return redirectTo(request, `/${admin[1]}/admin`);
    if (!isLogin && !signedIn) return redirectTo(request, `/${admin[1]}/admin/login`);
    if (!isLogin && !access && refresh) return renewAdmin(request, refresh, admin[1]);
    return;
  }

  if (admin && hasLocale(admin[1])) return notFound(request, admin[1]);
  if (hasLocale(pathname.split("/")[1])) return;

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = hasLocale(saved) ? saved : negotiateLocale(request.headers.get("accept-language"));

  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
