import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ButtonLink, ContentImage, PageIntro, Prose } from "@/components/ui/public-page";
import { dateLabel, getStory } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/stories/[slug]">) { const story = (await getStory((await params).slug)).data[0]; return { title: story?.title || "Story not found", description: story?.excerpt || undefined }; }
export default async function StoryPage({ params }: PageProps<"/stories/[slug]">) {
  const result = await getStory((await params).slug); if (!result.available) throw new Error("Stories are unavailable");
  const story = result.data[0]; if (!story) notFound();
  return <><PageIntro title={story.title} label="Stories" intro={dateLabel(story.published_at)} /><Container><article className="section reading-column story-detail"><ContentImage fileKey={story.cover_image_key} alt={story.title} /><Prose>{story.body}</Prose><div className="button-group"><ButtonLink href="/stories" secondary>All stories</ButtonLink></div></article></Container></>;
}

