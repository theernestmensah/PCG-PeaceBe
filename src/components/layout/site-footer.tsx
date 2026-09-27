import Link from "next/link";
import { Container } from "@/components/ui/container";
import { giveNav, mainNav, siteFullName } from "@/lib/site";

// TODO(step 3): address, phone, email, service times and social links come from
// site_settings and service_times. The values below are placeholders.
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-navy text-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-serif text-xl font-semibold">Peace Be Congregation</p>
          <p className="mt-1 text-white/80">Presbyterian Church of Ghana</p>
          <address className="mt-4 not-italic text-white/80">[Community 25, Tema]</address>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-wide text-white uppercase">
            Worship with us
          </h2>
          <p className="mt-3 text-white/80">Service times to be confirmed.</p>
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
        <Container className="py-5 text-sm text-white/70">
          © {year} {siteFullName}
        </Container>
      </div>
    </footer>
  );
}
