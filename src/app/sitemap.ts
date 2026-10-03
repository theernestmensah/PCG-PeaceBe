import type { MetadataRoute } from "next";
import { getGroups, getStories } from "@/lib/content";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) return [];
  const routes = ["", "/today", "/about", "/visit", "/church-family", "/session", "/groups", "/events", "/events/archive", "/sermons", "/announcements", "/stories", "/resources", "/harvest", "/give", "/contact", "/privacy"];
  const [groups, stories] = await Promise.all([getGroups(), getStories()]);
  return [...routes, ...groups.data.map(g => `/groups/${g.slug}`), ...stories.data.map(story => `/stories/${story.slug}`)].map(path => ({ url: `${base}${path}`, changeFrequency: "weekly" as const }));
}
