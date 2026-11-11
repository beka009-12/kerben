import { BACKEND_URL } from "@/utils/api/backend";
import { ApiError, apiFetch } from "@/utils/api/client";
import { clientIp, createRateLimit } from "@/utils/api/rate-limit";

const ROUTES: { method: string; path: RegExp; slash?: boolean; open?: boolean }[] = [
  { method: "GET", path: /^chat\/sessions$/ },
  { method: "POST", path: /^chat\/session$/ },
  { method: "GET", path: /^chat\/history\/[\w-]{1,64}$/ },
  { method: "POST", path: /^booking\/preview$/ },
  { method: "POST", path: /^booking\/confirm$/ },
  { method: "DELETE", path: /^chat\/[\w-]{1,64}\/services\/(hotel|transport)$/ },
  { method: "GET", path: /^auth\/me$/ },
  { method: "POST", path: /^account\/(login|register|forgot-password|reset-password)$/, open: true },
  { method: "GET", path: /^account\/me$/ },
  { method: "GET", path: /^tours\/\d{1,9}\/reviews$/, slash: true, open: true },
  { method: "POST", path: /^tours\/\d{1,9}\/reviews$/, slash: true },
  { method: "DELETE", path: /^tours\/\d{1,9}\/reviews\/\d{1,9}$/, slash: true },
  { method: "POST", path: /^travel-selections$/, slash: true },
  { method: "POST", path: /^travel-requests$/, slash: true },
  { method: "GET", path: /^travel-requests\/me$/, slash: true },
  { method: "DELETE", path: /^travel-requests\/me\/\d{1,9}$/, slash: true },
];

const ACCOUNT = /^account\/(login|register|forgot-password|reset-password)$/;
const accountLimit = createRateLimit({ limit: 10, windowMs: 10 * 60 * 1000 });

async function forward(request: Request, { params }: RouteContext<"/api/chat/[...path]">) {
  const path = (await params).path.join("/");
  const route = ROUTES.find((r) => r.method === request.method && r.path.test(path));
  if (!route) return Response.json({ detail: "Not found" }, { status: 404 });
  if (ACCOUNT.test(path) && !accountLimit(`${clientIp(request)}:${path}`)) {
    return Response.json({ code: "too_many_requests", detail: "Too many attempts" }, { status: 429, headers: { "Retry-After": "600" } });
  }
  const authorization = request.headers.get("authorization");
  if (!authorization && !route.open) return Response.json({ detail: "Unauthorized" }, { status: 401 });

  let body: unknown;
  if (request.method === "POST") body = await request.json().catch(() => undefined);
  try {
    const data = await apiFetch<unknown>(`${BACKEND_URL}/${path}${route.slash ? "/" : ""}`, {
      method: request.method,
      headers: authorization ? { Authorization: authorization } : {},
      body,
      timeoutMs: 15_000,
      cache: "no-store",
    });
    return Response.json(data ?? {}, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ApiError && error.status > 0) return Response.json(error.details ?? { detail: error.message }, { status: error.status });
    return Response.json({ detail: "Backend unavailable" }, { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as DELETE };
