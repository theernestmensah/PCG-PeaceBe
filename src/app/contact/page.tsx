import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro, Prose } from "@/components/ui/public-page";
import { ContactForm } from "@/components/contact-form";
import { getCopy, getSettings, safeExternal } from "@/lib/content";
import { contactEnabled } from "@/lib/contact-config";
export const metadata: Metadata = { title: "Contact Us", description: "Get in touch with Peace Be Congregation in Community 25, Tema." };
export default async function ContactPage() {
  const [settings, copy] = await Promise.all([getSettings(), getCopy("contact.intro")]);
  return <><PageIntro title="Let’s talk." label="Contact" intro="A question, a prayer request, or a first hello. We’d love to hear from you." /><Container><section className="section contact-grid"><div><h2>Get in touch</h2><Prose>{copy || "Send a message to the church office and let us know how we can help."}</Prose><dl className="contact-details"><dt>Visit us</dt><dd>{settings?.address || "Community 25, Tema, Ghana"}</dd>{settings?.phone && <><dt>Call us</dt><dd><a href={"tel:" + settings.phone.replace(/[^+\d]/g, "")}>{settings.phone}</a></dd></>}{settings?.email && <><dt>Email</dt><dd><a href={"mailto:" + settings.email}>{settings.email}</a></dd></>}{settings?.office_hours && <><dt>Office hours</dt><dd>{settings.office_hours}</dd></>}</dl><div className="social-links">{Object.entries(settings?.social_links || {}).map(([name, url]) => safeExternal(url) && <a key={name} href={safeExternal(url)!} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</div></div><ContactForm enabled={contactEnabled()} /></section></Container></>;
}
