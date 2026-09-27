import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { EmptyState, EventList, PageIntro, Pagination } from "@/components/ui/public-page";
import { getEvents, pageNumber } from "@/lib/content";
export const metadata: Metadata = { title: "Events", description: "Explore upcoming gatherings at Peace Be Congregation." };
export default async function EventsPage({ searchParams }: PageProps<"/events">) {
  const page = pageNumber((await searchParams).page);
  const result = await getEvents(false, page);
  return <><PageIntro title="Life, shared together." label="Events" intro="Worship, fellowship and opportunities to grow. See what’s coming up at Peace Be." /><Container><section className="section"><nav className="tabs" aria-label="Event period"><Link href="/events" aria-current="page">Upcoming events</Link><Link href="/events/archive">Past events</Link></nav>{result.data.length ? <EventList events={result.data.slice(0,12)} /> : <EmptyState available={result.available} title={page > 1 ? "No more events" : "Our next gathering starts here"}>New events will appear here once announced. Check our groups for regular fellowship activities.</EmptyState>}<Pagination page={page} more={result.data.length > 12} path="/events" /></section></Container></>;
}
