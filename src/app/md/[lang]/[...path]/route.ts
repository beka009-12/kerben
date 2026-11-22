import { hasLocale } from "@/utils/i18n/config";
import { htmlUrl, pathFromSegments } from "@/utils/markdown/md";
import { pageMarkdown } from "@/utils/markdown/pages";
import { notFoundText, textResponse } from "@/utils/markdown/response";

/** Сюда переписываются адреса /{lang}/…/*.md (rewrites в next.config.ts): /en/tours/49.md → /md/en/tours/49 */
export async function GET(_request: Request, ctx: RouteContext<"/md/[lang]/[...path]">) {
  const { lang, path: segments } = await ctx.params;
  const path = pathFromSegments(segments);
  if (!hasLocale(lang) || path === null) return notFoundText();
  try {
    const body = await pageMarkdown(lang, path);
    return body === null ? notFoundText() : textResponse(body, "text/markdown", htmlUrl(lang, path));
  } catch (error) {
    console.error("[markdown] page failed", lang, path, error);
    return new Response("Temporarily unavailable\n", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" } });
  }
}
