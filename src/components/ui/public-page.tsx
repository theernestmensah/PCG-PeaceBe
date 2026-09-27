import Link from "next/link";
import Image from "next/image";
import { Container } from "./container";
import { dateLabel, days, getServices, mediaUrl, timeLabel, type ChurchEvent, type Sermon } from "@/lib/content";

export function Arrow() { return <span aria-hidden="true">↗</span>; }
export function ButtonLink({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) { return <Link href={href} className={`button ${secondary ? "button-secondary" : "button-primary"}`}>{children}<Arrow /></Link>; }
export function PageIntro({ title, intro, label }: { title: string; intro: string; label?: string }) {
  return <section className="page-intro"><Container><nav aria-label="Breadcrumb" className="breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>{label || title}</span></nav><h1>{title}</h1><p>{intro}</p></Container></section>;
}
export function EmptyState({ available = true, title, children }: { available?: boolean; title: string; children?: React.ReactNode }) {
  return <div className="empty-state"><h3>{available ? title : "Updates are temporarily unavailable"}</h3><p>{available ? children : "Please try again later. You can still explore the rest of the website."}</p></div>;
}
export function Prose({ children }: { children: React.ReactNode }) { return <div className="prose-copy">{children}</div>; }
export function SectionHeading({ title, href, link }: { title: string; href?: string; link?: string }) { return <div className="section-heading"><h2>{title}</h2>{href && <Link href={href} className="text-link">{link || "View all"} <Arrow /></Link>}</div>; }
export async function ServiceList() {
  const services = await getServices();
  return services.data.length ? <ul className="service-list">{services.data.map(s => <li key={s.id}><div><h3>{s.name}</h3><p>{days[s.day_of_week]} · {timeLabel(s.start_time)} <span className="muted">GMT</span></p>{s.language && <span className="muted">{s.language}</span>}{s.notes && <p className="muted">{s.notes}</p>}</div></li>)}</ul> : <p className="muted">Please confirm the current service times with the church before travelling.</p>;
}
export function EventList({ events }: { events: ChurchEvent[] }) { return <div className="event-list">{events.map(e => { const d = new Date(e.starts_at); return <article className="event-row" key={e.id}><div className="date-block"><span>{d.toLocaleDateString("en-GH", { month: "short", timeZone: "Africa/Accra" })}</span><strong>{d.toLocaleDateString("en-GH", { day: "2-digit", timeZone: "Africa/Accra" })}</strong></div><div className="event-copy"><div className="meta">{dateLabel(e.starts_at, true)} · GMT {e.status === "cancelled" && <span className="badge badge-red">Cancelled</span>}</div><h3><Link href={`/events/${e.slug}`}>{e.title}</Link></h3><p className="muted">{e.venue || "Venue details to follow"}</p></div><Link className="row-arrow" href={`/events/${e.slug}`} aria-label={`View ${e.title}`}><Arrow /></Link></article>; })}</div>; }
export function SermonList({ sermons }: { sermons: Sermon[] }) { return <div className="sermon-list">{sermons.map(s => <article className="sermon-row" key={s.id}><div className="sermon-symbol" aria-hidden="true">▷</div><div><p className="meta">{dateLabel(s.preached_on)}</p><h3><Link href={`/sermons/${s.slug}`}>{s.title}</Link></h3><p className="muted">{s.preacher_name}{s.bible_passage ? ` · ${s.bible_passage}` : ""}</p></div><Link className="row-arrow" href={`/sermons/${s.slug}`} aria-label={`Listen to ${s.title}`}><Arrow /></Link></article>)}</div>; }
export function ContentImage({ fileKey, alt, portrait = false }: { fileKey: string | null; alt: string; portrait?: boolean }) { const url = mediaUrl(fileKey); return url ? <div className={portrait ? "content-image portrait" : "content-image"}><Image src={url} alt={alt} fill sizes="(max-width: 700px) 100vw, 650px" /></div> : null; }
export function Pagination({ page, more, path, search = "" }: { page: number; more: boolean; path: string; search?: string }) { const href = (n: number) => `${path}?${new URLSearchParams({ page: String(n), ...(search ? { q: search } : {}) })}`; return page > 1 || more ? <nav className="pagination" aria-label="Pagination">{page > 1 && <Link className="button button-secondary" href={href(page - 1)}>← Previous</Link>}<span>Page {page}</span>{more && <Link className="button button-secondary" href={href(page + 1)}>Next →</Link>}</nav> : null; }
