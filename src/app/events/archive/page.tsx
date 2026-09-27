import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { EmptyState, EventList, PageIntro, Pagination } from "@/components/ui/public-page";
import { getEvents, pageNumber } from "@/lib/content";
export const metadata: Metadata = { title: "Past Events" };
export default async function EventsArchivePage({ searchParams }: PageProps<"/events/archive">) {
  const page = pageNumber((await searchParams).page);
  const result = await getEvents(true, page);
  return <><PageIntro title="Moments we’ve shared." label="Past events" intro="Look back at gatherings from the life of Peace Be Congregation." /><Container><section className="section"><nav className="tabs" aria-label="Event period"><Link href="/events">Upcoming events</Link><Link href="/events/archive" aria-current="page">Past events</Link></nav>{result.data.length ? <EventList events={result.data.slice(0,12)} /> : <EmptyState available={result.available} title="No past events to show">Published events will move here automatically after they finish.</EmptyState>}<Pagination page={page} more={result.data.length > 12} path="/events/archive" /></section></Container></>;
}
