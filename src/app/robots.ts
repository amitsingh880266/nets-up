import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Only the public landing page is worth indexing; session/player screens are personal, dynamic trackers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/players/", "/session/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
