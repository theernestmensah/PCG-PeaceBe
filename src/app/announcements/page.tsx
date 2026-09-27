import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { EmptyState, PageIntro, Prose } from "@/components/ui/public-page";
import { dateLabel, getAnnouncements } from "@/lib/content";
export const metadata: Metadata = { title: "Announcements", description: "Current notices and updates from Peace Be Congregation." };
export default async function AnnouncementsPage() {
  const result = await getAnnouncements();
  return <><PageIntro title="Stay in the know." label="Announcements" intro="The latest notices, reminders and updates for our church family." /><Container><section className="section reading-column">{result.data.length ? result.data.map(a => <article id={"notice-" + a.id} className="announcement" key={a.id}><div className="meta">{a.is_pinned && <span className="badge">Pinned notice</span>}<time dateTime={a.publish_at}>{dateLabel(a.publish_at)}</time></div><h2>{a.title}</h2><Prose>{a.body}</Prose></article>) : <EmptyState available={result.available} title="You’re all caught up">There are no current announcements. Check back for updates from the church.</EmptyState>}</section></Container></>;
}
