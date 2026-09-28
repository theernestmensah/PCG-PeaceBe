import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink, ContentImage, EmptyState, PageIntro, Prose } from "@/components/ui/public-page";
import { getLeaders } from "@/lib/content";

export const metadata: Metadata = { title: "The Congregational Session", description: "The Minister and Presbyters providing spiritual oversight at Peace Be Congregation." };

export default async function SessionPage() {
  const leaders = await getLeaders();
  const session = leaders.data.filter(leader => leader.category === "minister" || leader.category === "session");
  return <>
    <PageIntro title="The Congregational Session" label="Session" intro="Spiritual oversight, faithful governance and pastoral care for Peace Be Congregation." />
    <Container>
      <section className="section split-section"><div><p className="section-label">Presbyterian leadership</p><h2>Serving Christ and the congregation</h2><Prose>The Congregational Session is the local court of the Presbyterian Church. It brings the Minister and elected Presbyters together to guide worship, nurture members, steward the congregation and carry out the Church’s mission.</Prose></div><aside className="location-panel"><h2>Speak with the Session</h2><p>Contact the church office for official correspondence, pastoral support or matters for Session.</p><ButtonLink href="/contact">Contact the church office</ButtonLink></aside></section>
      <section className="section section-rule"><h2>Minister and Presbyters</h2>{session.length ? <div className="leaders-grid session-grid">{session.map(leader => <article key={leader.id}><ContentImage fileKey={leader.photo_key} alt={leader.full_name} portrait /><p className="section-label">{leader.category === "minister" ? "Minister" : "Presbyter"}</p><h3>{leader.full_name}</h3>{leader.title && <p>{leader.title}</p>}{leader.bio && <Prose>{leader.bio}</Prose>}</article>)}</div> : <EmptyState available={leaders.available} title="Session profiles are being prepared">The verified names and approved public details of the Minister and Presbyters will appear here.</EmptyState>}</section>
    </Container>
  </>;
}

