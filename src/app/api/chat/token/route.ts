import { ApiError } from "@/utils/api/client";
import { ChatAccountError, siteUserFrom } from "@/utils/api/chat-accounts";

/** Выдаёт браузеру токен для websocket чата: backend принимает в чате тот же токен аккаунта (/account/login) */
export async function POST(request: Request) {
  try {
    const { token } = await siteUserFrom(request);
    return Response.json(
      { token },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ChatAccountError)
      return Response.json({ error: error.code }, { status: 401 });
    if (error instanceof ApiError && error.status === 429)
      return Response.json({ error: "busy" }, { status: 429 });
    console.error(
      "[chat] token:",
      error instanceof Error ? error.message : error,
    );
    return Response.json({ error: "server" }, { status: 502 });
  }
}
