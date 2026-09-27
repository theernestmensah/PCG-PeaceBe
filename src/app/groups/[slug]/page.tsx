import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ButtonLink, ContentImage, PageIntro, Prose, SectionHeading } from "@/components/ui/public-page";
import { days, getGroups, getLeaders, timeLabel } from "@/lib/content";
async function load(slug: string) { const result = await getGroups(); if (!result.available) throw new Error("Group information is unavailable"); return result.data.find(g => g.slug === slug); }
export async function generateMetadata({ params }: PageProps<"/groups/[slug]">) { const group = await load((await params).slug); return { title: group?.name || "Group not found" }; }
export default async function GroupPage({ params }: PageProps<"/groups/[slug]">) {
  const group = await load((await params).slug);
  if (!group) notFound();
  const leaders = (await getLeaders()).data.filter(l => l.group_id === group.id);
  return <><PageIntro title={group.name} label="Groups & ministries" intro="Sharing faith. Building friendships. Serving together." /><Container><section className="section split-section"><div><ContentImage fileKey={group.cover_image_key} alt={group.name} /><h2>A place to grow together</h2><Prose>{group.description || "Contact the church office to learn about this group and how you can take part."}</Prose></div><aside className="location-panel"><h2>Come along</h2>{group.meeting_day !== null ? <p>{days[group.meeting_day]}{group.meeting_time ? " · " + timeLabel(group.meeting_time) + " GMT" : ""}</p> : <p>Ask the church about the next meeting.</p>}{group.meeting_venue && <p>{group.meeting_venue}</p>}<ButtonLink href="/contact">Ask about this group</ButtonLink></aside></section>{leaders.length > 0 && <section className="section section-rule"><SectionHeading title="Your group leaders" /><div className="leaders-grid">{leaders.map(l => <article key={l.id}><ContentImage fileKey={l.photo_key} alt={l.full_name} portrait /><h3>{l.full_name}</h3><p>{l.title}</p>{l.bio && <Prose>{l.bio}</Prose>}</article>)}</div></section>}<ButtonLink href="/groups" secondary>All groups</ButtonLink></Container></>;
}
