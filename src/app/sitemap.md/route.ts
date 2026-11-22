import { sitemapMarkdown } from "@/utils/markdown/maps";
import { textResponse } from "@/utils/markdown/response";
import { publicPaths } from "@/utils/site-pages";

export async function GET() {
  return textResponse(await sitemapMarkdown(await publicPaths()), "text/markdown");
}
