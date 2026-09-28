import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Arrow, EmptyState, PageIntro } from "@/components/ui/public-page";
import { dateLabel, getAlmanacEntry, getEvents, getServices, ghanaDate } from "@/lib/content";

export const metadata: Metadata = {
  title: "Today at Peace Be",
  description: "Today's Almanac readings, hymn, prayer focus and congregation life at Peace Be.",
};

export default async function TodayPage() {
  const today = ghanaDate();
  const [almanac, events, services] = await Promise.all([getAlmanacEntry(today), getEvents(), getServices()]);
  const entry = almanac.data[0];
  const day = new Date(`${today}T12:00:00Z`);

  return <>
    <PageIntro title="Today at Peace Be" label="Today" intro={new Intl.DateTimeFormat("en-GH", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Accra" }).format(day)} />
    <Container>
      <section className="section today-layout">
        <article className="almanac-card">
          <div className="almanac-date" aria-hidden="true"><span>{day.toLocaleDateString("en-GH", { month: "short", timeZone: "Africa/Accra" })}</span><strong>{day.getUTCDate()}</strong></div>
          <div className="almanac-body">
            <p className="section-label">From the Almanac</p>
            {entry ? <>
              <h2>{entry.theme || entry.day_label || "Today’s worship guide"}</h2>
              {(entry.liturgical_season || entry.observance) && <p className="almanac-season">{[entry.liturgical_season, entry.observance].filter(Boolean).join(" · ")}</p>}
              {entry.readings.length > 0 && <div className="almanac-block"><h3>Readings</h3><ul>{entry.readings.map(reading => <li key={reading}>{reading}</li>)}</ul></div>}
              {(entry.memory_verse_reference || entry.memory_verse_text) && <blockquote><p>{entry.memory_verse_text}</p>{entry.memory_verse_reference && <cite>{entry.memory_verse_reference}</cite>}</blockquote>}
              {(entry.hymn_number || entry.hymn_title) && <div className="almanac-block"><h3>Hymn of the day</h3><p>{entry.hymn_number && `PCG Hymn ${entry.hymn_number}`}{entry.hymn_number && entry.hymn_title && " · "}{entry.hymn_title}{entry.hymn_language && ` (${entry.hymn_language})`}</p></div>}
              {entry.prayer_focus && <div className="almanac-block"><h3>Prayer focus</h3><p>{entry.prayer_focus}</p></div>}
              {entry.reflection && <div className="almanac-reflection"><h3>Reflection</h3><p>{entry.reflection}</p></div>}
              {entry.source_note && <p className="source-note">Source: {entry.source_note}</p>}
            </> : <EmptyState available={almanac.available} title="Today’s Almanac entry is being prepared">The church office will publish the approved readings, hymn and prayer focus here.</EmptyState>}
          </div>
        </article>
        <aside className="today-sidebar">
          <section><p className="section-label">Worship</p><h2>Next service</h2>{services.data[0] ? <><h3>{services.data[0].name}</h3><p>Sunday morning at Peace Be Congregation</p><Link className="text-link" href="/visit">Plan your visit <Arrow /></Link></> : <p className="muted">Please contact the church office to confirm service times.</p>}</section>
          <section><p className="section-label">Coming up</p><h2>Church life</h2>{events.data.slice(0, 2).map(event => <article key={event.id}><p className="meta">{dateLabel(event.starts_at, true)} · GMT</p><h3><Link href={`/events/${event.slug}`}>{event.title}</Link></h3></article>)}{events.data.length === 0 && <p className="muted">New congregation events will appear here.</p>}</section>
        </aside>
      </section>
    </Container>
  </>;
}

