import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export type Service = { id: string; name: string; day_of_week: number; start_time: string; language: string | null; notes: string | null };
export type Settings = { address: string | null; phone: string | null; email: string | null; office_hours: string | null; map_embed_url: string | null; momo_number: string | null; momo_name: string | null; bank_details: Record<string, string> | null; social_links: Record<string, string> };
export type Group = { id: string; name: string; short_name: string | null; slug: string; description: string | null; meeting_day: number | null; meeting_time: string | null; meeting_venue: string | null; cover_image_key: string | null; group_kind?: "generational" | "intergenerational" | "ministry" | "committee" | "shepherding"; is_public?: boolean };
export type ChurchEvent = { id: string; title: string; slug: string; description: string | null; starts_at: string; ends_at: string; venue: string | null; status: string; flyer_key: string | null; group_id: string | null; is_featured: boolean };
export type Sermon = { id: string; title: string; slug: string; preacher_name: string; preached_on: string; bible_passage: string | null; youtube_url: string | null; audio_key: string | null; summary: string | null };
export type Announcement = { id: string; title: string; body: string; publish_at: string; is_pinned: boolean };
export type Leader = { id: string; full_name: string; title: string; bio: string | null; photo_key: string | null; group_id: string | null; category: "minister" | "session" | "group_leader" };
export type AlmanacEntry = { id: string; entry_date: string; day_label: string | null; theme: string | null; liturgical_season: string | null; liturgical_color: string | null; readings: string[]; memory_verse_reference: string | null; memory_verse_text: string | null; hymn_number: string | null; hymn_title: string | null; hymn_language: string | null; prayer_focus: string | null; observance: string | null; reflection: string | null; source_note: string | null };
export type Campaign = { id: string; name: string; slug: string; theme: string | null; scripture_reference: string | null; purpose: string | null; target_amount: number; confirmed_amount: number; starts_on: string; ends_on: string | null; status: "active" | "closed"; show_progress: boolean };
export type Story = { id: string; title: string; slug: string; excerpt: string | null; body: string; cover_image_key: string | null; published_at: string };
export type Download = { id: string; title: string; description: string | null; category: string; object_key: string | null; external_url: string | null };
type PageContent = { key: string; title: string | null; body: string | null };
export type Result<T> = { data: T[]; available: boolean };

export function publicDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  // Public pages never inherit an administrator's session or privileges.
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(10000) }) } });
}

async function read<T>(query: PromiseLike<{ data: unknown; error: unknown }> | undefined): Promise<Result<T>> {
  if (!query) return { data: [], available: false };
  try {
    const { data, error } = await query;
    if (error) { console.error("Public content query failed"); return { data: [], available: false }; }
    return { data: (data ?? []) as T[], available: true };
  } catch { console.error("Public content connection failed"); return { data: [], available: false }; }
}

export const getSettings = cache(async () => {
  const result = await read<Settings>(publicDatabase()?.from("site_settings").select("address,phone,email,office_hours,map_embed_url,momo_number,momo_name,bank_details,social_links").limit(1));
  return result.data[0] ?? null;
});
export const getServices = cache(() => read<Service>(publicDatabase()?.from("service_times").select("*").order("sort_order")));
export const getGroups = cache(() => read<Group>(publicDatabase()?.from("groups").select("*").order("sort_order")));
export const getLeaders = cache(() => read<Leader>(publicDatabase()?.from("leaders").select("*").eq("is_active", true).order("sort_order")));
export const getCopy = cache(async (key: string) => (await read<PageContent>(publicDatabase()?.from("page_content").select("*").eq("key", key).limit(1))).data[0]?.body || null);
export const getAnnouncements = cache(() => {
  const now = new Date().toISOString();
  return read<Announcement>(publicDatabase()?.from("announcements").select("*").eq("status", "published").lte("publish_at", now).or(`expires_at.is.null,expires_at.gt.${now}`).order("is_pinned", { ascending: false }).order("publish_at", { ascending: false }));
});
export const getEvents = cache((past = false, page = 1) => {
  const query = publicDatabase()?.from("events").select("*").in("status", ["published", "cancelled"]);
  const now = new Date().toISOString();
  return read<ChurchEvent>((past ? query?.lt("ends_at", now) : query?.gte("ends_at", now))?.order("starts_at", { ascending: !past }).range((page - 1) * 12, page * 12));
});
export const getSermons = cache((page = 1, search = "") => {
  let query = publicDatabase()?.from("sermons").select("*").eq("status", "published");
  if (search) query = query?.ilike("title", `%${search.replace(/[%_\\]/g, "").slice(0, 100)}%`);
  return read<Sermon>(query?.order("preached_on", { ascending: false }).range((page - 1) * 12, page * 12));
});
export const getAlmanacEntry = cache(async (date: string) => read<AlmanacEntry>(publicDatabase()?.from("almanac_entries").select("*").eq("entry_date", date).eq("status", "published").limit(1)));
export const getCampaigns = cache(() => read<Campaign>(publicDatabase()?.from("campaigns").select("*").in("status", ["active", "closed"]).order("starts_on", { ascending: false })));
export const getStories = cache(() => read<Story>(publicDatabase()?.from("stories").select("*").eq("status", "published").order("published_at", { ascending: false })));
export const getStory = cache((slug: string) => read<Story>(publicDatabase()?.from("stories").select("*").eq("slug", slug).eq("status", "published").limit(1)));
export const getDownloads = cache(() => read<Download>(publicDatabase()?.from("downloads").select("*").eq("status", "published").order("category").order("sort_order")));
export const getEvent = cache(async (slug: string) => read<ChurchEvent>(publicDatabase()?.from("events").select("*").eq("slug", slug).in("status", ["published", "cancelled"]).limit(1)));
export const getSermon = cache(async (slug: string) => read<Sermon>(publicDatabase()?.from("sermons").select("*").eq("slug", slug).eq("status", "published").limit(1)));

export const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function ghanaDate(date = new Date()) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Accra", year: "numeric", month: "2-digit", day: "2-digit" }).format(date); }
export function timeLabel(time: string) { const [hour, minute] = time.split(":").map(Number); return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "am" : "pm"}`; }
/* The next service to start after `now`, in Ghana time (GMT, no daylight saving). */
export function nextService(services: Service[], now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Accra", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now).map((part) => [part.type, part.value]));
  const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  const minutesNow = Number(parts.hour) * 60 + Number(parts.minute);
  let best: { service: Service; daysAhead: number; wait: number } | null = null;
  for (const service of services) {
    const [hour, minute] = service.start_time.split(":").map(Number);
    let daysAhead = (service.day_of_week - today + 7) % 7;
    if (daysAhead === 0 && hour * 60 + minute <= minutesNow) daysAhead = 7;
    const wait = daysAhead * 1440 + hour * 60 + minute - minutesNow;
    if (!best || wait < best.wait) best = { service, daysAhead, wait };
  }
  if (!best) return null;
  const day = best.daysAhead === 0 ? "Today" : best.daysAhead === 1 ? "Tomorrow" : days[best.service.day_of_week];
  return { service: best.service, label: `${day}, ${timeLabel(best.service.start_time)}` };
}
export function dateLabel(date: string, withTime = false) { return new Intl.DateTimeFormat("en-GH", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Accra", ...(withTime ? { hour: "numeric", minute: "2-digit" } as const : {}) }).format(new Date(date)); }
export function mediaUrl(key: string | null) { const base = process.env.NEXT_PUBLIC_MEDIA_URL; return key && base ? `${base.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}` : null; }
export function safeExternal(value: string | null | undefined) { try { const url = new URL(value || ""); return url.protocol === "https:" ? url.toString() : null; } catch { return null; } }
export function youtubeEmbed(value: string | null) {
  try {
    const url = new URL(value || "");
    if (url.protocol !== "https:") return null;
    const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname) ? (url.pathname === "/watch" ? url.searchParams.get("v") : /^\/(?:embed|shorts)\/([^/]+)$/.exec(url.pathname)?.[1]) : null;
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch { return null; }
}
export function pageNumber(value: string | string[] | undefined) { const n = Number(value); return Number.isSafeInteger(n) && n > 0 ? Math.min(n, 10000) : 1; }
