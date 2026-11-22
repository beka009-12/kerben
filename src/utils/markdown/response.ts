/** CDN держит текст 10 минут и ещё сутки отдаёт старый, пока обновляет: каталог меняется редко, а backend не дёргается на каждый запрос */
const CACHE = "public, max-age=300, s-maxage=600, stale-while-revalidate=86400";
/** robots.txt и sitemap.xml — как отдавал их Next: правила для роботов не должны отставать от деплоя */
export const REVALIDATE = "public, max-age=0, must-revalidate";

export function textResponse(body: string, type: "text/markdown" | "text/plain" | "application/xml", canonical?: string, cacheControl = CACHE): Response {
  const headers = new Headers({ "Content-Type": type === "application/xml" ? type : `${type}; charset=utf-8`, "Cache-Control": cacheControl });
  // Markdown-копия не конкурирует со страницей в поиске: canonical в HTTP-заголовке указывает на HTML
  if (canonical) headers.set("Link", `<${canonical}>; rel="canonical"`);
  return new Response(body, { headers });
}

export const notFoundText = () => new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
