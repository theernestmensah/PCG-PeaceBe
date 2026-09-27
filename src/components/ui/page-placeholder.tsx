import { Container } from "@/components/ui/container";

// TODO(step 4-6): temporary page body until each page is built.
export function PagePlaceholder({ title, intro }: { title: string; intro?: string }) {
  return (
    <Container className="py-14 sm:py-20">
      <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {intro ?? "This page is being prepared. Please check back soon."}
      </p>
    </Container>
  );
}
