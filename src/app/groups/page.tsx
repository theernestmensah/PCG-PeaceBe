import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Arrow, EmptyState, PageIntro } from "@/components/ui/public-page";
import { getGroups } from "@/lib/content";
export const metadata: Metadata = { title: "Groups & Ministries", description: "Find fellowship and opportunities to serve through the groups of Peace Be Congregation." };
export default async function GroupsPage() {
  const result = await getGroups();
  return <><PageIntro title="There’s room for you." label="Groups & ministries" intro="Faith grows through shared life. Find a group, build friendships, and discover a place to serve." /><Container><section className="section">{result.data.length ? <div className="group-list">{result.data.map(g => <Link className="group-row" href={"/groups/" + g.slug} key={g.id}><div><h2>{g.name}</h2><p>{g.description ? g.description.slice(0,180) + (g.description.length > 180 ? "…" : "") : "Explore this group and ask how to get involved."}</p></div><Arrow /></Link>)}</div> : <EmptyState available={result.available} title="Find your place in our church family">Group information will appear here once published. Please speak to the church office about getting involved.</EmptyState>}</section></Container></>;
}
