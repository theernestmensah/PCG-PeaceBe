import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { EmptyState, PageIntro, Pagination, SermonList } from "@/components/ui/public-page";
import { getSermons, pageNumber } from "@/lib/content";
export const metadata: Metadata = { title: "Sermons", description: "Listen to messages and explore Scripture with Peace Be Congregation." };
export default async function SermonsPage({ searchParams }: PageProps<"/sermons">) {
  const params = await searchParams;
  const page = pageNumber(params.page);
  const q = typeof params.q === "string" ? params.q.slice(0,100) : "";
  const result = await getSermons(page, q);
  return <><PageIntro title="A Word for your week." label="Sermons" intro="Listen again, reflect on Scripture, and carry the message into everyday life." /><Container><section className="section"><form className="search-form" action="/sermons" role="search"><label htmlFor="sermon-search">Find a sermon</label><div><input id="sermon-search" name="q" type="search" placeholder="Search by sermon title" defaultValue={q} maxLength={100} /><button className="button button-primary" type="submit">Search</button></div></form>{result.data.length ? <SermonList sermons={result.data.slice(0,12)} /> : <EmptyState available={result.available} title={q ? "No sermons match your search" : "Make room for the Word"}>{q ? "Try another title or clear your search to browse all sermons." : "Recordings will appear here as they are published by the church."}</EmptyState>}<Pagination page={page} more={result.data.length > 12} path="/sermons" search={q} /></section></Container></>;
}
