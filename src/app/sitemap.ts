import type { MetadataRoute } from "next";
import { getGroups } from "@/lib/content";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) return [];
  const routes = ["", "/about", "/visit", "/groups", "/events", "/events/archive", "/sermons", "/announcements", "/give", "/contact"];
  const groups = await getGroups();
  return [...routes, ...groups.data.map(g => `/groups/${g.slug}`)].map(path => ({ url: `${base}${path}`, changeFrequency: "weekly" as const }));
}
