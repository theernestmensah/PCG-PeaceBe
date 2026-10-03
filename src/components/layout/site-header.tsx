import Image from "next/image";
import Link from "next/link";
import { SiteNav, type OfficeDetails } from "@/components/layout/site-nav";
import { Container } from "@/components/ui/container";
import { getGroups, getServices, getSettings, nextService } from "@/lib/content";
import { churchFamilyLabel, isMenu, primaryNav, type NavEntry } from "@/lib/site";

const defaultAddress = "Community 25, Tema, Ghana";

export async function SiteHeader() {
  const [settings, services, groups] = await Promise.all([getSettings(), getServices(), getGroups()]);
  const next = nextService(services.data);
  const office: OfficeDetails = {
    nextService: next ? { label: next.label, name: next.service.name } : null,
    phone: settings?.phone || null,
    phoneHref: settings?.phone ? `tel:${settings.phone.replace(/[^+\d]/g, "")}` : null,
    address: settings?.address || defaultAddress,
  };

  // Public groups join the Church Family menu, generational groups first.
  const order = ["generational", "intergenerational", "ministry"];
  const groupLinks = groups.data
    .filter((group) => group.is_public !== false && order.includes(group.group_kind || "ministry"))
    .sort((a, b) => order.indexOf(a.group_kind || "ministry") - order.indexOf(b.group_kind || "ministry"))
    .map((group) => ({ href: `/groups/${group.slug}`, label: group.short_name || group.name }));
  const nav: NavEntry[] = primaryNav.map((entry) =>
    isMenu(entry) && entry.label === churchFamilyLabel ? { ...entry, groups: groupLinks } : entry,
  );

  return (
    <>
      <div className="site-strip bg-navy text-white">
        <Container className="flex min-h-11 items-center justify-between gap-4 text-sm">
          {office.nextService ? (
            <Link href="/visit" className="tap flex min-w-0 items-center gap-2 hover:underline">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span className="truncate">
                <span className="text-white/75">Next service: </span>
                <span className="font-semibold">{office.nextService.label}</span>
                <span className="hidden text-white/75 md:inline"> · {office.nextService.name}</span>
              </span>
            </Link>
          ) : (
            <Link href="/visit" className="tap flex items-center hover:underline">
              Join us for worship at Peace Be
            </Link>
          )}
          <div className="flex shrink-0 items-center gap-5">
            <span className="hidden text-white/75 lg:inline">{office.address}</span>
            {office.phoneHref && (
              <a href={office.phoneHref} className="tap flex items-center gap-2 font-semibold hover:underline">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                </svg>
                <span className="sr-only sm:not-sr-only">Call {office.phone}</span>
              </a>
            )}
          </div>
        </Container>
      </div>
      <header className="site-header sticky top-0 z-40 border-b border-navy/10 bg-white transition-shadow">
        <Container className="flex min-h-18 items-center justify-between gap-2 py-2 sm:gap-3">
          <Link href="/" className="tap flex min-w-0 items-center gap-2 rounded-sm sm:gap-3">
            <Image
              src="/images/pcg-crest.png"
              alt=""
              width={211}
              height={281}
              preload
              className="h-11 w-auto shrink-0 sm:h-14"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-xs/tight font-medium text-muted sm:tracking-wide sm:uppercase lg:max-xl:sr-only">
                Presbyterian Church of Ghana
              </span>
              <span className="font-serif text-base/tight font-semibold tracking-tight text-navy sm:text-lg/tight sm:tracking-normal">
                Peace Be Congregation
              </span>
            </span>
          </Link>
          <SiteNav nav={nav} office={office} />
        </Container>
      </header>
    </>
  );
}
