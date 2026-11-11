/** Websocket чата Kerben Travel: браузер подключается к нему напрямую (Vercel не проксирует websocket) */
export const chatSocketUrl = (process.env.NEXT_PUBLIC_CHAT_WS_URL || "wss://13.49.104.87").replace(/\/+$/, "");
