import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ButtonLink, PageIntro, Prose } from "@/components/ui/public-page";
import { dateLabel, getSermon, mediaUrl, youtubeEmbed } from "@/lib/content";
async function load(slug: string) { const result = await getSermon(slug); if (!result.available) throw new Error("Sermon information is unavailable"); return result.data[0]; }
export async function generateMetadata({ params }: PageProps<"/sermons/[slug]">) { const sermon = await load((await params).slug); return { title: sermon?.title || "Sermon not found" }; }
export default async function SermonPage({ params }: PageProps<"/sermons/[slug]">) {
  const sermon = await load((await params).slug);
  if (!sermon) notFound();
  const video = youtubeEmbed(sermon.youtube_url), audio = mediaUrl(sermon.audio_key);
  return <><PageIntro title={sermon.title} label="Sermons" intro={sermon.preacher_name + " · " + dateLabel(sermon.preached_on)} /><Container><section className="section reading-column">{sermon.bible_passage && <p className="scripture-passage">{sermon.bible_passage}</p>}{video && <div className="video-player"><iframe src={video} title={"Watch " + sermon.title} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>}{audio && <section className="audio-player"><h2>Listen to the message</h2><audio controls preload="none" src={audio} aria-label={sermon.title}>Your browser does not support audio playback.</audio><a href={audio} className="text-link">Open audio recording ↗</a></section>}{!video && !audio && <p className="form-notice">This recording is temporarily unavailable. Please try again later.</p>}{sermon.summary && <><h2>Reflect on the message</h2><Prose>{sermon.summary}</Prose></>}<div className="button-group"><ButtonLink href="/sermons" secondary>All sermons</ButtonLink></div></section></Container></>;
}
