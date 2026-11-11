import { ApiError } from "@/utils/api/client";
import { ChatAccountError, chatTokenFor, siteUserFrom } from "@/utils/api/chat-accounts";

/** Выдаёт браузеру клиентский токен backend для websocket чата. Вход — токен клиента backend (/account/login) */
export async function POST(request: Request) {
  try {
    const user = await siteUserFrom(request);
    const fresh = new URL(request.url).searchParams.has("fresh");
    const token = await chatTokenFor(user, fresh);
    return Response.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ChatAccountError) {
      const status = error.code === "unauthorized" ? 401 : error.code === "notConfigured" ? 503 : 502;
      return Response.json({ error: error.code }, { status });
    }
    if (error instanceof ApiError && error.status === 429) return Response.json({ error: "busy" }, { status: 429 });
    console.error("[chat] token:", error instanceof Error ? error.message : error);
    return Response.json({ error: "server" }, { status: 502 });
  }
}
