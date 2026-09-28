import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white">
      <div className="h-1 bg-brand" />
      <Container className="flex min-h-18 items-center justify-between gap-3 py-2">
        <Link href="/" className="tap flex min-w-0 items-center gap-2.5 rounded-sm sm:gap-3">
          <Image
            src="/images/pcg-crest.jpg"
            alt=""
            width={177}
            height={148}
            preload
            className="h-11 w-auto shrink-0 sm:h-12"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-muted sm:tracking-wide sm:uppercase">
              Presbyterian Church of Ghana
            </span>
            <span className="font-serif text-lg font-semibold text-navy">
              Peace Be Congregation
            </span>
          </span>
        </Link>
        <SiteNav />
      </Container>
    </header>
  );
}
