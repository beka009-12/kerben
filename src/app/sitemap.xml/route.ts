import { REVALIDATE, textResponse } from "@/utils/markdown/response";
import { publicPaths } from "@/utils/site-pages";
import { sitemapComment, sitemapEntries, sitemapXml } from "@/utils/sitemap-xml";

export async function GET() {
  return textResponse(sitemapXml(sitemapEntries(await publicPaths()), sitemapComment()), "application/xml", undefined, REVALIDATE);
}
