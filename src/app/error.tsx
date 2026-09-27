"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";

// TODO(step 7): report the error to Sentry.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-20">
      <h1 className="text-4xl font-semibold">Something went wrong</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Sorry, this page could not be loaded. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="tap inline-flex items-center rounded-md bg-brand px-6 font-semibold text-white hover:bg-navy"
        >
          Try again
        </button>
        <Link
          href="/"
          className="tap inline-flex items-center rounded-md border border-navy/20 px-6 font-semibold text-navy hover:border-brand"
        >
          Go to the home page
        </Link>
      </div>
    </Container>
  );
}
