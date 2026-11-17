/** Websocket чата Kerben Travel: браузер подключается к нему напрямую (Vercel не проксирует websocket) */
export const chatSocketUrl = (process.env.NEXT_PUBLIC_CHAT_WS_URL || "wss://api.kerben-travel.com").replace(/\/+$/, "");
