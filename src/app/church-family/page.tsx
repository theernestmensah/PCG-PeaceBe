import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Arrow, ButtonLink, EmptyState, PageIntro, SectionHeading } from "@/components/ui/public-page";
import { getGroups } from "@/lib/content";

export const metadata: Metadata = { title: "Our Church Family", description: "Meet the groups, ministries and leaders who make up Peace Be Congregation." };

const sections = [
  { kind: "generational", title: "Generational groups", intro: "A place for every stage of life to learn, belong and serve." },
  { kind: "intergenerational", title: "Intergenerational groups", intro: "Members of all ages gathering around prayer, music, service and witness." },
  { kind: "ministry", title: "Ministries and departments", intro: "The teams carrying the congregation’s worship, care, mission and administration." },
] as const;

export default async function ChurchFamilyPage() {
  const groups = await getGroups();
  return <>
    <PageIntro title="One church family. Many ways to belong." label="Church family" intro="Meet the groups, ministries and leaders through which Peace Be worships, nurtures and serves." />
    <Container>
      <section className="section church-family-intro"><div><p className="section-label">Our leadership</p><h2>The Congregational Session</h2><p>The Minister and elected Presbyters provide spiritual oversight and govern the congregation within the Presbyterian Church of Ghana.</p><ButtonLink href="/session" secondary>Meet the Session</ButtonLink></div><div><p className="section-label">Find your place</p><h2>Life is shared here</h2><p>Every member can grow through a generational group and take part in the wider ministries of the congregation.</p><ButtonLink href="/contact">Ask where you belong</ButtonLink></div></section>
      {sections.map(section => {
        const items = groups.data.filter(group => (group.group_kind || "ministry") === section.kind && group.is_public !== false);
        return <section className="section section-rule" key={section.kind}><SectionHeading title={section.title} /><p className="section-deck">{section.intro}</p>{items.length ? <div className="group-list">{items.map(group => <Link className="group-row" href={`/groups/${group.slug}`} key={group.id}><div><h3>{group.name}</h3><p>{group.description || "Learn when we meet and how to take part."}</p></div><Arrow /></Link>)}</div> : <EmptyState available={groups.available} title={`${section.title} are being added`}>The church office is preparing the official list and meeting information.</EmptyState>}</section>;
      })}
    </Container>
  </>;
}

