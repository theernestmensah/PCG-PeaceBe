import Link from "next/link";
import { Container } from "@/components/ui/container";
import { giveNav, mainNav, siteFullName } from "@/lib/site";
import { days, getServices, getSettings, safeExternal, timeLabel } from "@/lib/content";

export async function SiteFooter() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-serif text-xl font-semibold">Peace Be Congregation</p>
          <p className="mt-1 text-white/80">Presbyterian Church of Ghana</p>
          <address className="mt-4 not-italic text-white/80">{settings?.address || "Community 25, Tema, Ghana"}</address>
          {settings?.phone && <a className="tap mt-2 flex items-center text-white/80 hover:text-white" href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>{settings.phone}</a>}
          {settings?.email && <a className="tap flex items-center break-all text-white/80 hover:text-white" href={`mailto:${settings.email}`}>{settings.email}</a>}
          <div className="mt-4 flex flex-wrap gap-4">{Object.entries(settings?.social_links || {}).map(([name, url]) => safeExternal(url) && <a className="tap inline-flex items-center text-sm text-white/80 capitalize hover:text-white" key={name} href={safeExternal(url)!} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</div>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-wide text-white uppercase">
            Worship with us
          </h2>
          {services.data.length ? <ul className="mt-3 space-y-3">{services.data.map(s => <li key={s.id}><p>{s.name}</p><p className="text-sm text-white/80">{days[s.day_of_week]} · {timeLabel(s.start_time)} GMT</p></li>)}</ul> : <p className="mt-3 text-white/80">Contact the church to confirm service times.</p>}
          <Link
            href="/visit"
            className="tap mt-2 inline-flex items-center font-semibold text-white underline underline-offset-4 hover:no-underline"
          >
            Plan your visit
          </Link>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-sans text-sm font-semibold tracking-wide text-white uppercase">
            Explore
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4">
            {[...mainNav, giveNav].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="tap inline-flex items-center text-white/80 hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <div className="border-t border-white/15">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-5 text-sm text-white/70">
          <span>© {year} {siteFullName}</span>
          <span className="flex flex-wrap gap-5"><Link href="/member/login" className="hover:text-white hover:underline">Member area</Link><Link href="/privacy" className="hover:text-white hover:underline">Privacy</Link><Link href="/admin/login" className="hover:text-white hover:underline">Church office</Link></span>
        </Container>
      </div>
    </footer>
  );
}
