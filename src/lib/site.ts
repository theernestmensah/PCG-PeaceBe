export const siteName = "PCG Peace Be Congregation";
export const siteFullName = "Presbyterian Church of Ghana, Peace Be Congregation";
export const siteDescription =
  "Presbyterian Church of Ghana, Peace Be Congregation, Community 25, Tema. Worship with us.";

export type NavItem = { href: string; label: string };

export const mainNav: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/groups", label: "Groups" },
  { href: "/events", label: "Events" },
  { href: "/sermons", label: "Sermons" },
  { href: "/announcements", label: "Announcements" },
  { href: "/visit", label: "Visit" },
  { href: "/contact", label: "Contact" },
];

export const giveNav: NavItem = { href: "/give", label: "Give" };
