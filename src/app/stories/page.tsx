import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Arrow, ContentImage, EmptyState, PageIntro } from "@/components/ui/public-page";
import { dateLabel, getStories } from "@/lib/content";

export const metadata: Metadata = { title: "Stories", description: "News, testimonies and milestones from Peace Be Congregation." };
export default async function StoriesPage() {
  const stories = await getStories();
  return <><PageIntro title="Stories from our church family." label="Stories" intro="Worship, service, milestones and the everyday life we share at Peace Be." /><Container><section className="section">{stories.data.length ? <div className="story-grid">{stories.data.map((story, index) => <article className={index === 0 ? "story-card story-featured" : "story-card"} key={story.id}><ContentImage fileKey={story.cover_image_key} alt={story.title} /><p className="meta">{dateLabel(story.published_at)}</p><h2><Link href={`/stories/${story.slug}`}>{story.title}</Link></h2><p>{story.excerpt || story.body.slice(0, 180) + (story.body.length > 180 ? "…" : "")}</p><Link className="text-link" href={`/stories/${story.slug}`}>Read the story <Arrow /></Link></article>)}</div> : <EmptyState available={stories.available} title="The first Peace Be story is being prepared">News, testimonies and congregation milestones will appear here after church-office review.</EmptyState>}</section></Container></>;
}

