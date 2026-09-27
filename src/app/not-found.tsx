import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="py-20">
      <p className="text-sm font-semibold tracking-widest text-brand uppercase">Page not found</p>
      <h1 className="mt-3 text-4xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        It may have moved, or the link may be out of date.
      </p>
      <Link
        href="/"
        className="tap mt-8 inline-flex items-center rounded-md bg-brand px-6 font-semibold text-white hover:bg-navy"
      >
        Go to the home page
      </Link>
    </Container>
  );
}
