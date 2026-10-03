export const siteName = "PCG Peace Be Congregation";
export const siteFullName = "Presbyterian Church of Ghana, Peace Be Congregation";
export const siteDescription =
  "Presbyterian Church of Ghana, Peace Be Congregation, Community 25, Tema. Worship with us.";

export type NavItem = { href: string; label: string; description?: string };
export type NavMenu = { label: string; items: NavItem[]; groups?: NavItem[] };
export type NavEntry = NavItem | NavMenu;

export function isMenu(entry: NavEntry): entry is NavMenu {
  return "items" in entry;
}

/* The Church Family menu also lists the public groups, read from the database by the header. */
export const churchFamilyLabel = "Church Family";

export const primaryNav: NavEntry[] = [
  { href: "/today", label: "Today" },
  {
    label: "About",
    items: [
      { href: "/about", label: "About Peace Be", description: "Our story, identity and ministry team" },
      { href: "/session", label: "The Session", description: "The Minister and Presbyters who lead us" },
    ],
  },
  {
    label: "Worship",
    items: [
      { href: "/visit", label: "Service times and visiting", description: "When we meet and what to expect" },
      { href: "/sermons", label: "Sermons", description: "Watch and listen to recent preaching" },
      { href: "/today", label: "Today's Almanac", description: "Readings, hymn and prayer for the day" },
    ],
  },
  {
    label: churchFamilyLabel,
    items: [
      { href: "/church-family", label: "All groups and ministries", description: "Find where you belong" },
      { href: "/session", label: "The Session", description: "Spiritual oversight of the congregation" },
    ],
  },
  {
    label: "What's On",
    items: [
      { href: "/events", label: "Events", description: "Upcoming services, programmes and gatherings" },
      { href: "/announcements", label: "Announcements", description: "Notices from the church office" },
      { href: "/harvest", label: "Harvest", description: "This year's Harvest and its progress" },
    ],
  },
  { href: "/contact", label: "Contact" },
];

export const visitNav: NavItem = { href: "/visit", label: "Plan a visit" };
export const giveNav: NavItem = { href: "/give", label: "Give" };

/* Flat list for the footer: every page once, in menu order. */
export const mainNav: NavItem[] = primaryNav
  .flatMap((entry) => (isMenu(entry) ? entry.items : [entry]))
  .filter((item, index, all) => all.findIndex((other) => other.href === item.href) === index)
  .map(({ href, label }) => ({ href, label: href === "/today" ? "Today" : label }));
