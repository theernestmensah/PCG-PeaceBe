import type { Metadata } from "next";
import { HarvestProgress } from "@/components/harvest-progress";
import { Container } from "@/components/ui/container";
import { ButtonLink, EmptyState, PageIntro } from "@/components/ui/public-page";
import { dateLabel, getCampaigns } from "@/lib/content";

export const metadata: Metadata = { title: "Harvest", description: "Follow and support the current Peace Be Congregation Harvest." };

export default async function HarvestPage() {
  const campaigns = await getCampaigns();
  const campaign = campaigns.data.find(item => item.status === "active") || campaigns.data[0];
  return <>
    <PageIntro title="Our Harvest" label="Harvest" intro="Giving together for the work God has entrusted to our congregation." />
    <Container>
      <section className="section harvest-layout">
        {campaign ? <>
          <article className="harvest-main"><p className="section-label">{campaign.status === "active" ? "Current campaign" : "Completed campaign"}</p><h2>{campaign.name}</h2>{campaign.theme && <p className="harvest-theme">{campaign.theme}</p>}{campaign.scripture_reference && <p className="scripture-passage">{campaign.scripture_reference}</p>}{campaign.purpose && <p>{campaign.purpose}</p>}{campaign.show_progress && <HarvestProgress campaign={campaign} />}<p className="source-note">Campaign period: {dateLabel(campaign.starts_on)}{campaign.ends_on ? ` – ${dateLabel(campaign.ends_on)}` : ""}</p></article>
          <aside className="harvest-give"><p className="section-label">Take part</p><h2>Make your contribution</h2><p>Use an approved Peace Be giving channel and include the Harvest reference provided by the church office. Contributions appear in the total only after finance confirmation.</p><ButtonLink href="/give">View giving details</ButtonLink><p className="harvest-privacy">Names and individual amounts are kept private.</p></aside>
        </> : <EmptyState available={campaigns.available} title="The next Harvest campaign is being prepared">The target, purpose, dates and approved giving details will appear here once confirmed by the church office.</EmptyState>}
      </section>
    </Container>
  </>;
}

