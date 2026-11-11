import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/*/saved", "/*/requests", "/*/trips", "/*/login", "/*/chat", "/*/admin", "/*/reset-password"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
