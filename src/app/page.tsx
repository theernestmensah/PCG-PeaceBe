import Link from "next/link";
import { Container } from "@/components/ui/container";

// TODO(step 4): full home page (service times, featured events, latest sermon, announcements).
export default function HomePage() {
  return (
    <section className="bg-surface">
      <Container className="py-16 sm:py-24">
        <p className="text-sm font-semibold tracking-widest text-brand uppercase">
          Presbyterian Church of Ghana
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold sm:text-6xl">
          Peace Be Congregation
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          A worshipping family in Community 25, Tema. You are welcome here.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/visit"
            className="tap inline-flex items-center rounded-md bg-brand px-6 font-semibold text-white transition-colors hover:bg-navy"
          >
            Plan your visit
          </Link>
          <Link
            href="/sermons"
            className="tap inline-flex items-center rounded-md border border-navy/20 bg-white px-6 font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
          >
            Watch sermons
          </Link>
        </div>
      </Container>
    </section>
  );
}
