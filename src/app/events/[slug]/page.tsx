import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ButtonLink, ContentImage, PageIntro, Prose } from "@/components/ui/public-page";
import { dateLabel, getEvent } from "@/lib/content";
async function load(slug: string) { const result = await getEvent(slug); if (!result.available) throw new Error("Event information is unavailable"); return result.data[0]; }
export async function generateMetadata({ params }: PageProps<"/events/[slug]">) { const event = await load((await params).slug); return { title: event?.title || "Event not found" }; }
export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const event = await load((await params).slug);
  if (!event) notFound();
  const past = new Date(event.ends_at) < new Date();
  return <><PageIntro title={event.title} label="Events" intro={dateLabel(event.starts_at, true) + " GMT"} /><Container><section className="section split-section"><div>{event.status === "cancelled" && <div className="cancellation" role="status">This event has been cancelled. Please contact the church with any questions.</div>}{past && event.status !== "cancelled" && <p className="badge">Past event</p>}<ContentImage fileKey={event.flyer_key} alt={"Flyer for " + event.title} /><h2>About this gathering</h2><Prose>{event.description || "Please contact the church office for more information about this gathering."}</Prose></div><aside className="location-panel"><h2>The details</h2><dl><dt>Starts</dt><dd>{dateLabel(event.starts_at, true)} GMT</dd><dt>Ends</dt><dd>{dateLabel(event.ends_at, true)} GMT</dd><dt>Location</dt><dd>{event.venue || "Please confirm the venue with the church."}</dd></dl><ButtonLink href="/contact" secondary>Ask a question</ButtonLink></aside></section><ButtonLink href={past ? "/events/archive" : "/events"} secondary>{past ? "All past events" : "All upcoming events"}</ButtonLink></Container></>;
}
