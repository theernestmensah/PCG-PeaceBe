import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Arrow, EmptyState, PageIntro } from "@/components/ui/public-page";
import { getDownloads, mediaUrl, safeExternal } from "@/lib/content";

export const metadata: Metadata = { title: "Resources", description: "Approved forms, notices and downloads from Peace Be Congregation." };
export default async function ResourcesPage() {
  const resources = await getDownloads();
  const categories = resources.data.reduce<Map<string, typeof resources.data>>((map, item) => {
    map.set(item.category, [...(map.get(item.category) || []), item]);
    return map;
  }, new Map());
  return <><PageIntro title="Resources for church life." label="Resources" intro="Approved forms, notices, study material and useful congregation documents." /><Container><section className="section resource-list">{resources.data.length ? Array.from(categories).map(([category, items]) => <section key={category}><h2>{category}</h2>{items.map(item => { const href = safeExternal(item.external_url) || mediaUrl(item.object_key); return href ? <a className="resource-row" href={href} target="_blank" rel="noopener noreferrer" key={item.id}><div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div><Arrow /></a> : null; })}</section>) : <EmptyState available={resources.available} title="Resources are being organised">Approved forms and documents will appear here once published by the church office.</EmptyState>}</section></Container></>;
}

